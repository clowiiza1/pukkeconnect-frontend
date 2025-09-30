import { api, asApiError } from "./apis.jsx";

export async function listNotifications({ page = 1, limit = 20 } = {}) {
  try {
    const response = await api.get("/notifications", {
      params: { page, limit },
    });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function markNotificationSeen(notificationId) {
  try {
    const response = await api.put(`/notifications/${notificationId}/seen`);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}
