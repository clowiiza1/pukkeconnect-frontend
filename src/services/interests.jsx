import { api, asApiError } from "./apis.jsx";

// GET /api/interests
export async function listInterests() {
  try {
    const res = await api.get("/interests");
    return res.data; // [{ id, name }, ...]
  } catch (error) {
    throw asApiError(error);
  }
}

// GET /api/students/:student_id/interests
export async function getStudentInterests(studentId) {
  try {
    const normalized = studentId != null ? String(studentId).trim() : "";
    const encoded = encodeURIComponent(normalized);
    const res = await api.get(`/students/${encoded}/interests`);
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}

// POST /api/students/:student_id/interests  body: { interestIds: [id, ...] }
export async function setStudentInterests(studentId, interestIds) {
  try {
    const normalized = studentId != null ? String(studentId).trim() : "";
    const encoded = encodeURIComponent(normalized);
    const res = await api.post(`/students/${encoded}/interests`, { interestIds });
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}

// DELETE /api/students/:student_id/interests/:interest_id
export async function removeStudentInterest(studentId, interestId) {
  try {
    const normalizedStudentId = studentId != null ? String(studentId).trim() : "";
    const encodedStudentId = encodeURIComponent(normalizedStudentId);
    const normalizedInterestId = interestId != null ? String(interestId).trim() : "";
    const encodedInterestId = encodeURIComponent(normalizedInterestId);
    const res = await api.delete(`/students/${encodedStudentId}/interests/${encodedInterestId}`);
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}
