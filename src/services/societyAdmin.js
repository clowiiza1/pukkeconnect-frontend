import { api } from './apis.jsx';

// ============================================
// SOCIETY MANAGEMENT
// ============================================

/**
 * Get the current user's managed society
 * @returns {Promise} Society details
 */
export async function getMySociety() {
  try {
    const response = await api.get('/societies/my-society');
    return response.data;
  } catch (error) {
    // Don't log 404 errors - they're expected for unassigned admins
    if (error?.response?.status !== 404 && error?.status !== 404) {
      console.error('Error fetching my society:', error);
    }
    throw error;
  }
}

/**
 * Get society details by ID
 * @param {string} societyId - Society ID
 * @returns {Promise} Society details
 */
export async function getSocietyDetails(societyId) {
  try {
    const response = await api.get(`/societies/${societyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching society details:', error);
    throw error;
  }
}

/**
 * Update society profile
 * @param {string} societyId - Society ID
 * @param {object} data - Updated society data (name, description, category, campus)
 * @returns {Promise} Updated society
 */
export async function updateSociety(societyId, data) {
  try {
    const response = await api.put(`/societies/${societyId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating society:', error);
    throw error;
  }
}

/**
 * Update society category
 * @param {string} societyId - Society ID
 * @param {string} category - New category
 * @returns {Promise} Updated society
 */
export async function updateSocietyCategory(societyId, category) {
  try {
    const response = await api.patch(`/societies/${societyId}/category`, { category });
    return response.data;
  } catch (error) {
    console.error('Error updating society category:', error);
    throw error;
  }
}

/**
 * Delete society (soft delete)
 * @param {string} societyId - Society ID
 * @returns {Promise} Deletion confirmation
 */
export async function deleteSociety(societyId) {
  try {
    const response = await api.delete(`/societies/${societyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting society:', error);
    throw error;
  }
}

/**
 * Assign a society admin to a society (university_admin only)
 * @param {string} societyId - Society ID
 * @param {string} adminUserId - User ID of the society admin to assign
 * @returns {Promise} Assignment confirmation
 */
export async function assignSocietyAdmin(societyId, adminUserId) {
  try {
    const response = await api.put(`/societies/${societyId}/assign-admin`, {
      adminUserId
    });
    return response.data;
  } catch (error) {
    console.error('Error assigning society admin:', error);
    throw error;
  }
}

// ============================================
// MEMBERSHIP MANAGEMENT
// ============================================

/**
 * Get all society members
 * @param {string} societyId - Society ID
 * @param {string|null} status - Filter by status (pending, active, rejected, suspended, left)
 * @returns {Promise} List of members
 */
export async function getSocietyMembers(societyId, status = null) {
  try {
    const params = status ? { status } : {};
    const response = await api.get(`/societies/${societyId}/members`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching society members:', error);
    throw error;
  }
}

/**
 * Update member status (approve, reject, suspend, etc.)
 * @param {string} societyId - Society ID
 * @param {string} studentId - Student ID
 * @param {string} status - New status (pending, active, rejected, suspended, left)
 * @returns {Promise} Updated membership
 */
export async function updateMembershipStatus(societyId, studentId, status) {
  try {
    const response = await api.put(`/societies/${societyId}/memberships/${studentId}`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating membership status:', error);
    throw error;
  }
}

/**
 * Request to join society (for students)
 * @param {string} societyId - Society ID
 * @returns {Promise} Membership request
 */
export async function requestMembership(societyId) {
  try {
    const response = await api.post(`/societies/${societyId}/memberships`);
    return response.data;
  } catch (error) {
    console.error('Error requesting membership:', error);
    throw error;
  }
}

// ============================================
// EVENTS MANAGEMENT
// ============================================

/**
 * Get all events for a society
 * @param {string} societyId - Society ID
 * @param {object} params - Query parameters (page, limit, campus, starts_after, starts_before)
 * @returns {Promise} List of events
 */
export async function getSocietyEvents(societyId, params = {}) {
  try {
    const response = await api.get('/events', {
      params: { society_id: societyId, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching society events:', error);
    throw error;
  }
}

/**
 * Get single event details
 * @param {string} eventId - Event ID
 * @returns {Promise} Event details
 */
export async function getEventDetails(eventId) {
  try {
    const response = await api.get(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event details:', error);
    throw error;
  }
}

/**
 * Create new event
 * @param {string} societyId - Society ID
 * @param {object} eventData - Event data (title, description, startsAt, endsAt, location, capacity)
 * @returns {Promise} Created event
 */
export async function createEvent(societyId, eventData) {
  try {
    // Transform frontend data to backend format
    const payload = {
      title: eventData.title,
      description: eventData.description,
      startsAt: eventData.startsAt, // Should be ISO string
      endsAt: eventData.endsAt || null,
      location: eventData.location,
      capacity: eventData.capacity ? parseInt(eventData.capacity) : null
    };

    if (eventData.poster !== undefined) {
      payload.poster = eventData.poster;
    }

    const response = await api.post(`/societies/${societyId}/events`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

/**
 * Update existing event
 * @param {string} eventId - Event ID
 * @param {object} eventData - Updated event data
 * @returns {Promise} Updated event
 */
export async function updateEvent(eventId, eventData) {
  try {
    const payload = {
      title: eventData.title,
      description: eventData.description,
      startsAt: eventData.startsAt,
      endsAt: eventData.endsAt || null,
      location: eventData.location,
      capacity: eventData.capacity ? parseInt(eventData.capacity) : null
    };

    if (eventData.poster !== undefined) {
      payload.poster = eventData.poster;
    }

    const response = await api.put(`/events/${eventId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

/**
 * Delete event (soft delete)
 * @param {string} eventId - Event ID
 * @returns {Promise} Deletion confirmation
 */
export async function deleteEvent(eventId) {
  try {
    const response = await api.delete(`/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

/**
 * Cancel an event and notify RSVP'd students
 * @param {string} eventId - Event ID
 * @returns {Promise} Cancelled event info with number of notified students
 */
export async function cancelEvent(eventId) {
  try {
    const response = await api.post(`/events/${eventId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling event:', error);
    throw error;
  }
}

/**
 * Get event RSVP list (admin only)
 * @param {string} eventId - Event ID
 * @param {object} params - Query parameters (page, limit, status)
 * @returns {Promise} List of RSVPs
 */
export async function getEventRsvps(eventId, params = {}) {
  try {
    const response = await api.get(`/events/${eventId}/rsvps`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching event RSVPs:', error);
    throw error;
  }
}

// ============================================
// POSTS MANAGEMENT
// ============================================

/**
 * Get all posts for a society
 * @param {string} societyId - Society ID
 * @param {object} params - Query parameters (page, limit)
 * @returns {Promise} List of posts
 */
export async function getSocietyPosts(societyId, params = {}) {
  try {
    const response = await api.get(`/societies/${societyId}/posts`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching society posts:', error);
    throw error;
  }
}

/**
 * Get single post details
 * @param {string} postId - Post ID
 * @returns {Promise} Post details
 */
export async function getPostDetails(postId) {
  try {
    const response = await api.get(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching post details:', error);
    throw error;
  }
}

/**
 * Create new post
 * @param {string} societyId - Society ID
 * @param {object} postData - Post data (content)
 * @returns {Promise} Created post
 */
export async function createPost(societyId, postData) {
  try {
    const payload = {
      content: postData.content,
    };

    if (Array.isArray(postData.media)) {
      payload.media = postData.media;
    }

    const response = await api.post(`/societies/${societyId}/posts`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

/**
 * Update existing post
 * @param {string} postId - Post ID
 * @param {object} postData - Updated post data
 * @returns {Promise} Updated post
 */
export async function updatePost(postId, postData) {
  try {
    const payload = {
      content: postData.content,
    };

    if (Array.isArray(postData.media)) {
      payload.media = postData.media;
    }

    const response = await api.put(`/posts/${postId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

/**
 * Delete post
 * @param {string} postId - Post ID
 * @returns {Promise} Deletion confirmation
 */
export async function deletePost(postId) {
  try {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Send notification to members
 * @param {object} notificationData - Notification data (recipient_id, type, message, link_url)
 * @returns {Promise} Sent notification
 */
export async function sendNotification(notificationData) {
  try {
    const response = await api.post('/notifications/send', notificationData);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Get all notifications for current user
 * @param {object} params - Query parameters (page, limit, seen)
 * @returns {Promise} List of notifications
 */
export async function getNotifications(params = {}) {
  try {
    const response = await api.get('/notifications', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as seen
 * @param {string} notificationId - Notification ID
 * @returns {Promise} Updated notification
 */
export async function markNotificationAsSeen(notificationId) {
  try {
    const response = await api.put(`/notifications/${notificationId}/seen`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as seen:', error);
    throw error;
  }
}

// ============================================
// ANNOUNCEMENTS
// ============================================

/**
 * Get all announcements
 * @param {string|null} campus - Filter by campus
 * @returns {Promise} List of announcements
 */
export async function getAnnouncements(campus = null) {
  try {
    const params = campus ? { campus } : {};
    const response = await api.get('/announcements', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
}

/**
 * Create announcement (admin only)
 * @param {object} announcementData - Announcement data (title, description)
 * @returns {Promise} Created announcement
 */
export async function createAnnouncement(announcementData) {
  try {
    const response = await api.post('/announcements', announcementData);
    return response.data;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
}

/**
 * Get single announcement
 * @param {string} announcementId - Announcement ID
 * @returns {Promise} Announcement details
 */
export async function getAnnouncementDetails(announcementId) {
  try {
    const response = await api.get(`/announcements/${announcementId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching announcement details:', error);
    throw error;
  }
}
