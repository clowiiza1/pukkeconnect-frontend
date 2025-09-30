import { api, asApiError } from "./api";

// GET /api/announcements?university=potch (optional)
export async function listAnnouncements(params = {}) {
  try {
    const res = await api.get("/announcements", { params });
    return res.data; // expect: [{announcement_id, title, description, created_at, ...}]
  } catch (e) { throw asApiError(e); }
}

// GET /api/announcements/:id
export async function getAnnouncement(id) {
  try {
    const res = await api.get(`/announcements/${id}`);
    return res.data;
  } catch (e) { throw asApiError(e); }
}
