import { api, asApiError } from "./apis.jsx";

export async function toggleSocietyLike(societyId, shouldLike) {
  try {
    if (shouldLike) {
      const res = await api.post(`/societies/${societyId}/likes`);
      return res.data;
    }
    const res = await api.delete(`/societies/${societyId}/likes`);
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function toggleEventRsvp(eventId, attending) {
  try {
    if (attending) {
      const res = await api.post(`/events/${eventId}/rsvp`, { status: 'going' });
      return res.data;
    }
    const res = await api.delete(`/events/${eventId}/rsvp`);
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function fetchHomeRecommendations() {
  try {
    const response = await api.get("/recommendations");
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function leaveSociety(societyId) {
  try {
    const response = await api.post(`/memberships/societies/${societyId}/leave`);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function joinSociety(societyId) {
  try {
    const response = await api.post(`/societies/${societyId}/memberships`);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function updateMembershipStatus(societyId, status) {
  try {
    const response = await api.patch(`/memberships/societies/${societyId}`, { status });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function listEvents({ page, limit, campus, startsAfter, startsBefore, societyId } = {}) {
  try {
    const response = await api.get("/events", {
      params: {
        page,
        limit,
        campus,
        starts_after: startsAfter,
        starts_before: startsBefore,
        society_id: societyId,
      },
    });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function listStudentMemberships(studentIdentifier) {
  try {
    const normalized = studentIdentifier != null ? String(studentIdentifier).trim() : '';
    const encoded = encodeURIComponent(normalized);
    const response = await api.get(`/memberships/students/${encoded}/societies`);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function fetchSocietyDetail(societyId) {
  try {
    const response = await api.get(`/societies/${societyId}`);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function listSocieties({ q, category, campus, page, limit } = {}) {
  try {
    const response = await api.get("/societies", {
      params: {
        q,
        category,
        campus,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function fetchMembershipStatus(studentIdentifier, societyId) {
  try {
    const response = await api.get(`/memberships/students/${studentIdentifier}/societies/${societyId}/status`);
    return response.data;
  } catch (error) {
    throw asApiError(error);
  }
}
