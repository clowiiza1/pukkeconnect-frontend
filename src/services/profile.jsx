import { api, asApiError } from "./apis.jsx";

export async function getMyProfile() {
  try {
    const res = await api.get("/students/me/profile");
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function updateMyProfile(payload) {
  try {
    const res = await api.put("/students/me/profile", payload);
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function getCurrentUser() {
  try {
    const res = await api.get("/users/me");
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function updateCurrentUser(payload) {
  try {
    const res = await api.patch("/users/me", payload);
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}
