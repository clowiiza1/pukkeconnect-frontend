import { api, asApiError } from "./apis.jsx";

export async function fetchAdminStats() {
  try {
    const response = await api.get("/admin/stats");
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function fetchAdminSocieties(params = {}) {
  try {
    const response = await api.get("/societies", { params });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function updateAdminSociety(societyId, payload) {
  try {
    const response = await api.put(`/societies/${societyId}`, payload);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function deleteAdminSociety(societyId) {
  try {
    await api.delete(`/societies/${societyId}`);
    return true;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function fetchAdminReports(params = {}) {
  try {
    const response = await api.get("/reports", { params });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function updateAdminReport(reportId, payload) {
  try {
    const response = await api.put(`/reports/${reportId}`, payload);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function fetchAdminUsers(params = {}) {
  try {
    const response = await api.get("/admin/users", { params });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function updateAdminUser(userId, payload) {
  try {
    const response = await api.put(`/admin/users/${userId}`, payload);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function deleteAdminUser(userId) {
  try {
    await api.delete(`/admin/users/${userId}`);
    return true;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function assignSocietyAdmin(societyId, adminUserId) {
  try {
    const response = await api.put(`/societies/${societyId}/assign-admin`, { adminUserId });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function fetchAdminEvents(params = {}) {
  try {
    const response = await api.get("/events", { params });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function updateAdminEvent(eventId, payload) {
  try {
    const response = await api.put(`/events/${eventId}`, payload);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function deleteAdminEvent(eventId) {
  try {
    await api.delete(`/events/${eventId}`);
    return true;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function fetchAdminPosts(params = {}) {
  try {
    const response = await api.get("/admin/posts", { params });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function updateAdminPost(postId, payload) {
  try {
    const response = await api.put(`/posts/${postId}`, payload);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function deleteAdminPost(postId) {
  try {
    await api.delete(`/posts/${postId}`);
    return true;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function approveSociety(societyId) {
  try {
    const response = await api.post(`/societies/${societyId}/approve`);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function rejectSociety(societyId) {
  try {
    const response = await api.post(`/societies/${societyId}/reject`);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}