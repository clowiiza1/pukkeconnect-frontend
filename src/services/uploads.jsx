import { api } from "./apis.jsx";

const DOWNLOAD_CACHE = new Map();
const CACHE_BUFFER_MS = 5_000;

export async function presignUpload({ scope = "post", fileName, contentType, size, folder }) {
  const payload = {
    scope,
    fileName,
    contentType,
    size,
    folder,
  };
  const res = await api.post("/uploads/presign", payload);
  return res.data;
}

export async function uploadFileToPresignedUrl(uploadUrl, file) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

export async function presignDownload(key) {
  const res = await api.get("/uploads/presign-download", { params: { key } });
  return res.data;
}

export function primeDownloadCache(key, url, expiresInSeconds = 120) {
  if (!key || !url) return;
  const ttl = Math.max(0, (expiresInSeconds * 1000) - CACHE_BUFFER_MS);
  DOWNLOAD_CACHE.set(key, {
    url,
    expiresAt: Date.now() + ttl,
  });
}

export async function getCachedDownloadUrl(key) {
  if (!key) return null;
  const cached = DOWNLOAD_CACHE.get(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now + CACHE_BUFFER_MS) {
    return cached.url;
  }

  const { url, expiresIn } = await presignDownload(key);
  primeDownloadCache(key, url, expiresIn);
  return url;
}

export function invalidateDownloadUrl(key) {
  DOWNLOAD_CACHE.delete(key);
}
