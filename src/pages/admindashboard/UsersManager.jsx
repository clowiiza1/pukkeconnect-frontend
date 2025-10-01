import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Edit3, Filter, Loader2, RotateCw, Search, Trash2, X } from "lucide-react";
import { fetchAdminUsers, updateAdminUser, deleteAdminUser } from "@/services/admin.js";

const pageSize = 20;
const roleOptions = [
  { value: "all", label: "All roles" },
  { value: "student", label: "Students" },
  { value: "society_admin", label: "Society admins" },
  { value: "university_admin", label: "Platform admins" },
];

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
                {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              </div>
              {!disableClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
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

function ConfirmDialog({ open, title, description, confirmLabel = "Confirm", loading = false, onConfirm, onCancel }) {
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
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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

export default function UsersManager({ campusOptions = [] }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [campusFilter, setCampusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ total: 0, limit: pageSize, page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    campus: "",
    major: "",
    role: "student",
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banner, setBanner] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
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
    if (roleFilter !== "all") params.role = roleFilter;
    if (campusFilter !== "all") params.campus = campusFilter;

    fetchAdminUsers(params)
      .then((result) => {
        if (cancelled) return;
        setRecords(Array.isArray(result?.data) ? result.data : []);
        setMeta({
          total: result?.total ?? 0,
          limit: result?.limit ?? pageSize,
          page: result?.page ?? page,
        });
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, roleFilter, campusFilter, page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || pageSize)));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const countsByRole = useMemo(() => {
    return records.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] ?? 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0 }
    );
  }, [records]);

  const showBanner = (type, message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setBanner({ type, message });
    timeoutRef.current = setTimeout(() => setBanner(null), 4000);
  };

  const openEdit = (user) => {
    setEditTarget(user);
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      phoneNumber: user.phoneNumber || "",
      campus: user.campus || "",
      major: user.major || "",
      role: user.role || "student",
    });
  };

  const closeEdit = () => {
    if (saving) return;
    setEditTarget(null);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    try {
      await updateAdminUser(editTarget.id, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
        campus: editForm.campus || null,
        major: editForm.major || null,
        role: editForm.role,
      });
      showBanner("success", "User updated successfully");
      setReloadKey((value) => value + 1);
      closeEdit();
    } catch (err) {
      showBanner("error", err?.message || "Unable to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAdminUser(deleteTarget.id);
      showBanner("success", "User removed");
      setDeleteTarget(null);
      if (records.length <= 1 && page > 1) {
        setPage((value) => Math.max(1, value - 1));
      } else {
        setReloadKey((value) => value + 1);
      }
    } catch (err) {
      showBanner("error", err?.message || "Unable to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
            <Filter size={16} />
            <span>Filters</span>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search"
              className="w-full rounded-2xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={campusFilter}
            onChange={(event) => {
              setCampusFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
          >
            <option value="all">All campuses</option>
            {campusOptions.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setRoleFilter("all");
              setCampusFilter("all");
              setPage(1);
            }}
            className="rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Reset
          </button>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((value) => value + 1)}
          className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          disabled={loading}
        >
          <RotateCw size={16} className={loading ? "animate-spin" : undefined} />
          Refresh
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center">
          <div className="text-2xl font-semibold text-gray-900">{records.length}</div>
          <div className="text-xs uppercase tracking-wide text-gray-500">Users (page)</div>
        </div>
        {roleOptions
          .filter((option) => option.value !== "all")
          .map((option) => (
            <div key={option.value} className="rounded-2xl border border-gray-200 bg-white p-3 text-center">
              <div className="text-2xl font-semibold text-gray-900">{countsByRole[option.value] ?? 0}</div>
              <div className="text-xs uppercase tracking-wide text-gray-500">{option.label}</div>
            </div>
          ))}
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
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead>
            <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Societies</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="animate-pulse border-b last:border-0">
                  {Array.from({ length: 5 }).map((__, cell) => (
                    <td key={cell} className="px-4 py-3">
                      <div className="h-3 rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No users match the selected filters.
                </td>
              </tr>
            ) : (
              records.map((user) => (
                <tr key={user.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{user.universityNumber}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{user.email}</div>
                    {user.phoneNumber && <div className="text-xs text-gray-500">{user.phoneNumber}</div>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div className="mb-1 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {user.role.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-gray-500">{user.campus || "No campus"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {user.societies.length === 0 && user.managedSocieties.length === 0 ? (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">No societies</span>
                      ) : (
                        <>
                          {user.societies.map((society) => (
                            <span
                              key={`member-${society.societyId}`}
                              className="rounded-full bg-[#f3eff9] px-2 py-1 text-xs text-[#5a4695]"
                            >
                              {society.name}
                            </span>
                          ))}
                          {user.managedSocieties.map((society) => (
                            <span
                              key={`managed-${society.societyId}`}
                              className="rounded-full bg-[#e8f5ff] px-2 py-1 text-xs text-[#2563eb]"
                            >
                              Admin: {society.name}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(user)}
                        className="flex items-center gap-1 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
        open={Boolean(editTarget)}
        onClose={closeEdit}
        title="Edit user"
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
              form="admin-edit-user"
              className="flex items-center gap-2 rounded-xl bg-[#6a509b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b4586] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving || !editForm.firstName.trim() || !editForm.lastName.trim()}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}
            </button>
          </div>
        )}
      >
        <form id="admin-edit-user" className="space-y-4" onSubmit={handleEditSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">First name</label>
              <input
                type="text"
                value={editForm.firstName}
                onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                required
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Last name</label>
              <input
                type="text"
                value={editForm.lastName}
                onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                required
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Phone number</label>
              <input
                type="tel"
                value={editForm.phoneNumber}
                onChange={(event) => setEditForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Campus</label>
              <select
                value={editForm.campus}
                onChange={(event) => setEditForm((prev) => ({ ...prev, campus: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
              >
                <option value="">Unspecified</option>
                {campusOptions.map((campus) => (
                  <option key={campus} value={campus}>
                    {campus}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Major</label>
            <input
              type="text"
              value={editForm.major}
              onChange={(event) => setEditForm((prev) => ({ ...prev, major: event.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Role</label>
            <select
              value={editForm.role}
              onChange={(event) => setEditForm((prev) => ({ ...prev, role: event.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            >
              {roleOptions
                .filter((role) => role.value !== "all")
                .map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
            </select>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete user"
        description={`Are you sure you want to delete ${deleteTarget?.firstName ?? "this user"}? This action cannot be undone.`}
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