import { api } from './apis.jsx';

/**
 * Get posts feed from all societies the student is a member of
 */
export async function getPostsFeed(page = 1, limit = 20) {
  const res = await api.get('/posts/feed', { params: { page, limit } });
  return res.data;
}

/**
 * Get posts from a specific society
 */
export async function getSocietyPosts(societyId, page = 1, limit = 20) {
  const res = await api.get(`/societies/${societyId}/posts`, { params: { page, limit } });
  return res.data;
}

/**
 * Like a post
 */
export async function likePost(postId) {
  const res = await api.post(`/posts/${postId}/like`);
  return res.data;
}

/**
 * Unlike a post
 */
export async function unlikePost(postId) {
  await api.delete(`/posts/${postId}/like`);
}

/**
 * Toggle like on a post
 */
export async function togglePostLike(postId, currentlyLiked) {
  if (currentlyLiked) {
    await unlikePost(postId);
    return false;
  } else {
    await likePost(postId);
    return true;
  }
}
