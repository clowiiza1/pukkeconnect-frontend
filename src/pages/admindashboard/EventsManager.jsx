import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { Edit3, Filter, Loader2, RotateCw, Search, Trash2, X } from "lucide-react";
import { fetchAdminEvents, updateAdminEvent, deleteAdminEvent } from "@/services/admin.js";
import {
  presignUpload,
  uploadFileToPresignedUrl,
  getCachedDownloadUrl,
  invalidateDownloadUrl,
} from "@/services/uploads.jsx";

const pageSize = 20;

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

export default function EventsManager({ campusOptions = [] }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [campusFilter, setCampusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState({ total: 0, limit: pageSize, page: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    campus: "",
    eventDate: "",
  });
  const [originalEditForm, setOriginalEditForm] = useState({
    title: "",
    description: "",
    location: "",
    campus: "",
    eventDate: "",
  });
  const [posterState, setPosterState] = useState({
    file: null,
    preview: null,
    isObjectUrl: false,
    existingKey: null,
    loading: false,
    removed: false,
    error: null,
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [banner, setBanner] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const timeoutRef = useRef(null);

  const resetPosterState = () => {
    setPosterState((prev) => {
      if (prev.isObjectUrl && prev.preview) {
        URL.revokeObjectURL(prev.preview);
      }
      return {
        file: null,
        preview: null,
        isObjectUrl: false,
        existingKey: null,
        loading: false,
        removed: false,
        error: null,
      };
    });
  };

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
    if (campusFilter !== "all") params.campus = campusFilter;

    fetchAdminEvents(params)
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
        if (!cancelled) setError(err?.message || "Failed to load events");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, campusFilter, page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || pageSize)));
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const showBanner = (type, message) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setBanner({ type, message });
    timeoutRef.current = setTimeout(() => setBanner(null), 4000);
  };

  const openEdit = (event) => {
    setEditTarget(event);
    const initialForm = {
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      campus: event.campus || "",
      eventDate: event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : "",
    };
    setEditForm(initialForm);
    setOriginalEditForm(initialForm);
    setPosterState((prev) => {
      if (prev.isObjectUrl && prev.preview) {
        URL.revokeObjectURL(prev.preview);
      }
      const existingKey = event?.poster?.key ?? null;
      return {
        file: null,
        preview: null,
        isObjectUrl: false,
        existingKey,
        loading: Boolean(existingKey),
        removed: false,
        error: null,
      };
    });
  };

  const closeEdit = () => {
    if (saving) return;
    resetPosterState();
    setEditTarget(null);
  };

  const hasFormChanges = () => {
    return (
      editForm.title.trim() !== originalEditForm.title.trim() ||
      editForm.description.trim() !== originalEditForm.description.trim() ||
      editForm.location.trim() !== originalEditForm.location.trim() ||
      editForm.campus !== originalEditForm.campus ||
      editForm.eventDate !== originalEditForm.eventDate ||
      Boolean(posterState.file) ||
      posterState.removed
    );
  };

  useEffect(() => {
    let cancelled = false;

    const loadPosterPreview = async () => {
      if (!posterState.existingKey || posterState.file || posterState.removed) return;
      setPosterState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const url = await getCachedDownloadUrl(posterState.existingKey);
        if (cancelled) return;
        setPosterState((prev) => ({
          ...prev,
          preview: url,
          loading: false,
          error: null,
        }));
      } catch (error) {
        if (cancelled) return;
        setPosterState((prev) => ({
          ...prev,
          preview: null,
          loading: false,
          error: "Unable to load current poster.",
        }));
      }
    };

    if (posterState.existingKey && !posterState.file) {
      loadPosterPreview();
    }

    return () => {
      cancelled = true;
    };
  }, [posterState.existingKey, posterState.file, posterState.removed]);

  const handlePosterSelect = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type || !file.type.startsWith("image/")) {
      setPosterState((prev) => ({ ...prev, error: "Please choose an image file." }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPosterState((prev) => ({ ...prev, error: "Images must be 10MB or smaller." }));
      return;
    }
    setPosterState((prev) => {
      if (prev.isObjectUrl && prev.preview) URL.revokeObjectURL(prev.preview);
      return {
        file,
        preview: URL.createObjectURL(file),
        isObjectUrl: true,
        existingKey: prev.existingKey,
        loading: false,
        removed: false,
        error: null,
      };
    });
  };

  const handlePosterRemove = () => {
    setPosterState((prev) => {
      if (prev.isObjectUrl && prev.preview) URL.revokeObjectURL(prev.preview);
      return {
        file: null,
        preview: null,
        isObjectUrl: false,
        existingKey: null,
        loading: false,
        removed: Boolean(prev.existingKey) || prev.removed,
        error: null,
      };
    });
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editTarget) return;
    setSaving(true);
    try {
      let posterReference;
      if (posterState.file) {
        const presign = await presignUpload({
          scope: "event",
          folder: "posters/admin",
          fileName: posterState.file.name,
          contentType: posterState.file.type || "application/octet-stream",
          size: posterState.file.size,
        });
        await uploadFileToPresignedUrl(presign.uploadUrl, posterState.file);
        posterReference = { key: presign.key };
        if (posterState.existingKey && posterState.existingKey !== presign.key) {
          invalidateDownloadUrl(posterState.existingKey);
        }
      } else if (posterState.removed) {
        posterReference = null;
        if (posterState.existingKey) invalidateDownloadUrl(posterState.existingKey);
      }

      const payload = {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        startsAt: editForm.eventDate ? new Date(editForm.eventDate).toISOString() : null,
      };

      if (posterReference !== undefined) {
        payload.poster = posterReference;
      }

      await updateAdminEvent(editTarget.eventId, payload);

      showBanner("success", "Event updated successfully");
      setReloadKey((value) => value + 1);
      closeEdit();
    } catch (err) {
      showBanner("error", err?.message || "Unable to update event");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAdminEvent(deleteTarget.eventId);
      showBanner("success", "Event deleted");
      setDeleteTarget(null);
      if (records.length <= 1 && page > 1) {
        setPage((value) => Math.max(1, value - 1));
      } else {
        setReloadKey((value) => value + 1);
      }
    } catch (err) {
      showBanner("error", err?.message || "Unable to delete event");
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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

      <div className="rounded-2xl border border-gray-200 bg-white p-3 text-center">
        <div className="text-2xl font-semibold text-gray-900">{meta.total || 0}</div>
        <div className="text-xs uppercase tracking-wide text-gray-500">Total Events</div>
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
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Society</th>
              <th className="px-4 py-3">Date & Location</th>
              <th className="px-4 py-3">Attendees</th>
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
                  No events match the selected filters.
                </td>
              </tr>
            ) : (
              records.map((event) => (
                <tr key={event.eventId} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{event.title}</div>
                    <div className="text-xs text-gray-500 line-clamp-2">{event.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-700">{event.society?.name || "Unknown"}</div>
                    <div className="text-xs text-gray-500">{event.society?.category || ""}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{formatDate(event.startsAt)}</div>
                    <div className="text-xs text-gray-500">{event.location || "No location"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {event.rsvps || 0} attending
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(event)}
                        className="flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(event)}
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
        title="Edit event"
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
              form="admin-edit-event"
              className="flex items-center gap-2 rounded-xl bg-[#6a509b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5b4586] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving || !editForm.title.trim() || !hasFormChanges()}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Save changes"}
            </button>
          </div>
        )}
      >
        <form id="admin-edit-event" className="space-y-4" onSubmit={handleEditSubmit}>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Event poster</label>
            <div className="flex flex-col gap-3">
              <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50">
                {posterState.loading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-xs">Loading current poster…</span>
                  </div>
                ) : posterState.preview ? (
                  <img
                    src={posterState.preview}
                    alt="Event poster preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-xs text-gray-500">
                    <span>No poster selected</span>
                    <span>Upload or change the event artwork below.</span>
                  </div>
                )}
              </div>
              {posterState.error && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  {posterState.error}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePosterSelect} />
                  Upload photo
                </label>
                {(posterState.preview || posterState.existingKey) && (
                  <button
                    type="button"
                    onClick={handlePosterRemove}
                    className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    {posterState.removed && !posterState.file ? "Removed" : "Remove"}
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Title</label>
            <input
              type="text"
              value={editForm.title}
              onChange={(event) => setEditForm((prev) => ({ ...prev, title: event.target.value }))}
              required
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</label>
            <textarea
              value={editForm.description}
              onChange={(event) => setEditForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(event) => setEditForm((prev) => ({ ...prev, location: event.target.value }))}
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
            <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">Event Date</label>
            <input
              type="datetime-local"
              value={editForm.eventDate}
              onChange={(event) => setEditForm((prev) => ({ ...prev, eventDate: event.target.value }))}
              className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#ac98cd]"
            />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete event"
        description={`Are you sure you want to delete "${deleteTarget?.title ?? "this event"}"? This action cannot be undone.`}
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
