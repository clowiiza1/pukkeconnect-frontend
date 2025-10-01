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