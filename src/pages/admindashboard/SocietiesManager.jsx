import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Edit3, Filter, Loader2, Search, Trash2, X } from "lucide-react";
import { fetchAdminSocieties, updateAdminSociety, deleteAdminSociety, assignSocietyAdmin, fetchAdminUsers } from "@/services/admin.js";
import { presignUpload, uploadFileToPresignedUrl, primeDownloadCache, invalidateDownloadUrl } from "@/services/uploads.jsx";
import { useMediaPreviews } from "@/hooks/useMediaPreviews.js";

const numberFormatter = new Intl.NumberFormat("en-ZA");
const pageSize = 20;
const FALLBACK_IMAGE_URL = "https://pukkeconnect.s3.eu-central-1.amazonaws.com/imageplaceholder.jpg";

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" });
}

function Modal({ open, onClose, title, children, footer, disableClose = false }) {
  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={() => {
              if (!disableClose && onClose) onClose();
            }}
          />
          <Motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                )}
              </div>
              {!disableClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1">{children}</div>
            {footer && <div className="mt-6">{footer}</div>}
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", tone = "danger", loading = false, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading && onCancel) onCancel();
      }}
      title={title}
      disableClose={loading}
      footer={(
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${tone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : confirmLabel}
          </button>
        </div>
      )}
    >
      <p className="text-sm text-gray-600">{description}</p>
    </Modal>
  );
}

export default function SocietiesManager({ campusOptions = [] }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({ campus: "all", category: "all" });
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ total: 0, limit: pageSize, page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", campus: "", description: "" });
  const [originalEditForm, setOriginalEditForm] = useState({ name: "", category: "", campus: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banner, setBanner] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [societyAdmins, setSocietyAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [editLogoKey, setEditLogoKey] = useState(null);
  const [editLogoInitialKey, setEditLogoInitialKey] = useState(null);
  const [editPendingLogoFile, setEditPendingLogoFile] = useState(null);
  const [editPendingLogoPreview, setEditPendingLogoPreview] = useState(null);
  const [editLogoRemoved, setEditLogoRemoved] = useState(false);
  const [editLogoUploading, setEditLogoUploading] = useState(false);
  const [editLogoError, setEditLogoError] = useState(null);
  const timeoutRef = useRef(null);

  const editLogoPreviewItems = useMediaPreviews(editLogoKey ? [{ key: editLogoKey }] : []);
  const editLogoRemoteUrl = editLogoPreviewItems[0]?.url ?? "";
  const editLogoPreviewLoading = editLogoPreviewItems[0]?.loading ?? false;
  const editLogoPreviewFailed = editLogoPreviewItems[0]?.error ?? false;
  const editLogoPreview = editLogoRemoved
    ? null
    : editPendingLogoPreview || (editLogoPreviewFailed ? null : editLogoRemoteUrl);

  useEffect(() => {
    return () => {
      if (editPendingLogoPreview) {
        URL.revokeObjectURL(editPendingLogoPreview);
      }
    };
  }, [editPendingLogoPreview]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = {
      page,
      limit: pageSize,
    };
    if (debouncedSearch) params.q = debouncedSearch;
    if (filters.campus !== "all") params.campus = filters.campus;
    if (filters.category !== "all") params.category = filters.category;

    fetchAdminSocieties(params)
      .then((result) => {
        if (cancelled) return;
        const nextRecords = Array.isArray(result?.data) ? result.data : [];
        setRecords(nextRecords);
        setMeta({
          total: result?.total ?? nextRecords.length,
          limit: result?.limit ?? pageSize,
          page: result?.page ?? page,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load societies");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filters.campus, filters.category, page, reloadKey]);

  const categories = useMemo(() => {
    const set = new Set();
    records.forEach((item) => {
      if (item?.category) set.add(item.category);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [records]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || pageSize)));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const campusChoices = Array.isArray(campusOptions) && campusOptions.length ? campusOptions : [];

  const showBanner = (type, message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setBanner({ type, message });
    timeoutRef.current = setTimeout(() => setBanner(null), 4000);
  };

  const openEdit = async (record) => {
    setEditing(record);
    const initialForm = {
      name: record?.name ?? "",
      category: record?.category ?? "",
      campus: record?.campus ?? "",
      description: record?.description ?? "",
      adminUserId: record?.adminId ?? "",
    };
    setEditForm(initialForm);
    setOriginalEditForm(initialForm);
    const logoKey = record?.logo?.key ?? record?.logoKey ?? null;
    setEditLogoKey(logoKey);
    setEditLogoInitialKey(logoKey);
    setEditLogoError(null);
    if (editPendingLogoPreview) {
      URL.revokeObjectURL(editPendingLogoPreview);
    }
    setEditPendingLogoFile(null);
    setEditPendingLogoPreview(null);
    setEditLogoRemoved(false);

    // Load all users (students and society_admins) for the dropdown
    setLoadingAdmins(true);
    try {
      const usersData = await fetchAdminUsers({ limit: 100 });
      const usersList = Array.isArray(usersData?.data) ? usersData.data : [];
      // Filter to only students and society_admins
      const eligibleUsers = usersList.filter(u => u.role === 'student' || u.role === 'society_admin');
      setSocietyAdmins(eligibleUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
      console.error("Error details:", err.message, err.response?.data);
      showBanner("error", `Failed to load users: ${err.message || "Unknown error"}`);
      setSocietyAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleEditLogoUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || !editing) return;

    if (!file.type.startsWith("image/")) {
      setEditLogoError("Please upload a valid image file (PNG, JPG, JPEG)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setEditLogoError("Image must be less than 2MB");
      return;
    }

    if (editPendingLogoPreview) {
      URL.revokeObjectURL(editPendingLogoPreview);
    }

    const previewUrl = URL.createObjectURL(file);
    setEditPendingLogoFile(file);
    setEditPendingLogoPreview(previewUrl);
    setEditLogoRemoved(false);
    setEditLogoError(null);
  };

  const removeEditLogo = () => {
    if (editPendingLogoPreview) {
      URL.revokeObjectURL(editPendingLogoPreview);
    }
    setEditPendingLogoFile(null);
    setEditPendingLogoPreview(null);
    setEditLogoRemoved(true);
    setEditLogoError(null);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
    setEditForm({ name: "", category: "", campus: "", description: "", adminUserId: "" });
    setOriginalEditForm({ name: "", category: "", campus: "", description: "", adminUserId: "" });
    setSocietyAdmins([]);
    if (editPendingLogoPreview) {
      URL.revokeObjectURL(editPendingLogoPreview);
    }
    if (editLogoKey && editLogoKey !== editLogoInitialKey) {
      invalidateDownloadUrl(editLogoKey);
    }
    setEditLogoKey(null);
    setEditLogoInitialKey(null);
    setEditPendingLogoFile(null);
    setEditPendingLogoPreview(null);
    setEditLogoRemoved(false);
    setEditLogoUploading(false);
    setEditLogoError(null);
  };

  const hasFormChanges = () => {
    const baseChanged =
      editForm.name.trim() !== originalEditForm.name.trim() ||
      editForm.category.trim() !== originalEditForm.category.trim() ||
      editForm.campus !== originalEditForm.campus ||
      editForm.description.trim() !== originalEditForm.description.trim() ||
      editForm.adminUserId !== originalEditForm.adminUserId;

    const logoChanged =
      Boolean(editPendingLogoFile) ||
      (editLogoRemoved && editLogoInitialKey !== null) ||
      (!editLogoRemoved && !editPendingLogoFile && editLogoKey !== editLogoInitialKey);

    return baseChanged || logoChanged;
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      // Update society details
      const payload = {
        name: editForm.name.trim(),
        category: editForm.category.trim() || null,
        campus: editForm.campus || null,
        description: editForm.description.trim() || null,
      };

      let nextLogoKey = editLogoInitialKey;
      let uploadedLogo = null;

      if (editPendingLogoFile) {
        try {
          setEditLogoUploading(true);
          const presign = await presignUpload({
            scope: "society",
            folder: `logos/${editing.societyId}`,
            fileName: editPendingLogoFile.name,
            contentType: editPendingLogoFile.type,
            size: editPendingLogoFile.size,
          });

          await uploadFileToPresignedUrl(presign.uploadUrl, editPendingLogoFile);
          uploadedLogo = presign;
          nextLogoKey = presign.key;
        } catch (err) {
          console.error("Failed to upload logo", err);
          setEditLogoError("Failed to upload logo. Please try again.");
          throw err;
        } finally {
          setEditLogoUploading(false);
        }
      } else if (editLogoRemoved && editLogoInitialKey) {
        nextLogoKey = null;
      }

      if (editPendingLogoFile || (editLogoRemoved && editLogoInitialKey)) {
        payload.logo = nextLogoKey ? { key: nextLogoKey } : null;
      }

      await updateAdminSociety(editing.societyId, payload);

      // Assign admin if changed
      const originalAdminId = editing.adminId || "";
      const newAdminId = editForm.adminUserId || "";

      if (newAdminId && newAdminId !== originalAdminId) {
        await assignSocietyAdmin(editing.societyId, newAdminId);
        showBanner("success", "Society and admin assignment updated successfully");
      } else {
        showBanner("success", "Society updated successfully");
      }

      if (editLogoInitialKey && editLogoInitialKey !== nextLogoKey) {
        invalidateDownloadUrl(editLogoInitialKey);
      }
      if (uploadedLogo) {
        primeDownloadCache(uploadedLogo.key, uploadedLogo.downloadUrl, uploadedLogo.downloadExpiresIn);
      }

      if (editPendingLogoPreview) {
        URL.revokeObjectURL(editPendingLogoPreview);
      }

      setEditLogoInitialKey(nextLogoKey);
      setEditLogoKey(nextLogoKey);
      setEditPendingLogoFile(null);
      setEditPendingLogoPreview(null);
      setEditLogoRemoved(false);
      setEditLogoError(null);

      setReloadKey((value) => value + 1);
      closeEdit();
    } catch (err) {
      showBanner("error", err?.message || "Unable to update society");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAdminSociety(deleteTarget.societyId);
      showBanner("success", "Society removed");
      setDeleteTarget(null);
      if (records.length <= 1 && page > 1) {
        setPage((value) => Math.max(1, value - 1));
      } else {
        setReloadKey((value) => value + 1);
      }
    } catch (err) {
      showBanner("error", err?.message || "Unable to delete society");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Filter size={16} />
            <span>Quick filters</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                type="search"
                placeholder="Search"
                className="w-full rounded-2xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
              />
            </div>
            <select
              value={filters.campus}
              onChange={(event) => {
                setFilters((prev) => ({ ...prev, campus: event.target.value }));
                setPage(1);
              }}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            >
              <option value="all">All campuses</option>
              {campusChoices.map((campus) => (
                <option key={campus} value={campus}>
                  {campus}
                </option>
              ))}
            </select>
            <select
              value={filters.category}
              onChange={(event) => {
                setFilters((prev) => ({ ...prev, category: event.target.value }));
                setPage(1);
              }}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFilters({ campus: "all", category: "all" });
                setPage(1);
              }}
              className="rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Showing {numberFormatter.format(records.length)} of {numberFormatter.format(meta.total || records.length)} societies
        </div>
      </div>

      {banner && (
        <div
          className={`rounded-2xl border px-4 py-2 text-sm ${
            banner.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {banner.message}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">Society</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Campus</th>
              <th className="px-4 py-3">Members</th>
              <th className="px-4 py-3">Events</th>
              <th className="px-4 py-3">Posts</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b last:border-0">
                  {Array.from({ length: 8 }).map((__, cell) => (
                    <td key={cell} className="px-4 py-3">
                      <div className="h-3 rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                  No societies match the current filters.
                </td>
              </tr>
            ) : (
              records.map((record) => {
                const counts = record?.counts || {};
                return (
                  <tr key={record.societyId} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{record.name}</div>
                      <div className="text-xs text-gray-500">
                        {record.createdBy?.firstName && record.createdBy?.lastName ? (
                          <>Managed by {record.createdBy.firstName} {record.createdBy.lastName}</>
                        ) : record.createdBy?.firstName ? (
                          <>Managed by {record.createdBy.firstName}</>
                        ) : record.createdBy?.lastName ? (
                          <>Managed by {record.createdBy.lastName}</>
                        ) : (
                          <span className="italic text-gray-400">No society admin assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{record.category || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-600">{record.campus || "N/A"}</td>
                    <td className="px-4 py-3 text-gray-600">{numberFormatter.format(counts.members || 0)}</td>
                    <td className="px-4 py-3 text-gray-600">{numberFormatter.format(counts.events || 0)}</td>
                    <td className="px-4 py-3 text-gray-600">{numberFormatter.format(counts.posts || 0)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(record.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(record)}
                          className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(record)}
                          className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-gray-500">
          Page {meta.page || page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => hasPrev && setPage((value) => Math.max(1, value - 1))}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasPrev || loading}
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => hasNext && setPage((value) => value + 1)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hasNext || loading}
          >
            Next
          </button>
        </div>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={closeEdit}
        title="Edit society"
        footer={(
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeEdit}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="admin-edit-society"
              className="flex items-center gap-2 rounded-xl bg-[#6a509b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b4586] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving || !editForm.name.trim() || !hasFormChanges()}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}
            </button>
          </div>
        )}
      >
        <form id="admin-edit-society" className="space-y-4" onSubmit={handleEditSubmit}>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={(event) => setEditForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Category</label>
              <input
                type="text"
                value={editForm.category}
                onChange={(event) => setEditForm((prev) => ({ ...prev, category: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Campus</label>
              <select
                value={editForm.campus || ""}
                onChange={(event) => setEditForm((prev) => ({ ...prev, campus: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
              >
                <option value="">Unspecified</option>
                {campusChoices.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Assign Society Admin</label>
            <select
              value={editForm.adminUserId || ""}
              onChange={(event) => setEditForm((prev) => ({ ...prev, adminUserId: event.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
              disabled={loadingAdmins}
            >
              <option value="">Unassigned</option>
              {societyAdmins.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.role === 'student' ? 'Student (will be promoted)' : 'Society Admin'} ({user.email})
                </option>
              ))}
            </select>
            {loadingAdmins ? (
              <p className="text-xs text-gray-500">Loading users...</p>
            ) : (
              <p className="text-xs text-gray-500">Select a student or existing admin. Students will be promoted to society admin role.</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Society Logo</label>
            <div className="flex items-start gap-3">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-white">
                {editLogoPreviewLoading && !editPendingLogoFile ? (
                  <Loader2 size={20} className="animate-spin text-gray-400" />
                ) : (
                  <img
                    src={editLogoPreview || FALLBACK_IMAGE_URL}
                    alt="Society logo preview"
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <label
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-white text-sm cursor-pointer transition ${editLogoUploading || saving ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
                    style={{ background: "#6a509b" }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditLogoUpload}
                      disabled={editLogoUploading || saving}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Choose Logo
                  </label>
                  {(editPendingLogoFile || editLogoInitialKey) && (
                    <button
                      type="button"
                      onClick={removeEditLogo}
                      disabled={editLogoUploading || saving}
                      className="inline-flex items-center px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">Optional. Recommended: square image, 300x300px, PNG or JPG, max 2MB.</p>
                {editLogoError && <p className="text-xs text-red-500">{editLogoError}</p>}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
            <textarea
              value={editForm.description}
              onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={4}
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete society"
        description={`Are you sure you want to delete ${deleteTarget?.name ?? "this society"}? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
