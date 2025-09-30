import axios from "axios";

const RETRYABLE_METHODS = new Set(["get", "head"]);
const RETRY_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504]);
const MAX_RETRIES = 2;

let logoutHandler = null;
let toastEmitter = null;

export function registerAuthLogout(handler) {
  logoutHandler = handler;
}

export function registerToastEmitter(fn) {
  toastEmitter = fn;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;
    if (!config) {
      return Promise.reject(asApiError(error));
    }

    const status = error.response?.status;
    const method = (config.method || "get").toLowerCase();
    const isRetryable = RETRYABLE_METHODS.has(method);
    const isNetworkError = !error.response && (error.code === "ERR_NETWORK" || error.message === "Network Error");
    const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;

    const priorRetries = config.__retryCount || 0;

    if (isRetryable && isNetworkError && isOffline && typeof window !== "undefined") {
      if (priorRetries >= MAX_RETRIES) {
        const formatted = asApiError(error);
        emitToast({
          title: "Still offline",
          description: formatted.message,
          tone: "error",
        });
        return Promise.reject(formatted);
      }

      emitToast({
        title: "You appear offline",
        description: "Retrying when you reconnect…",
        tone: "info",
      });
      return retryWhenOnline(config, priorRetries + 1);
    }

    const shouldRetry =
      isRetryable &&
      (isNetworkError || (status && RETRY_STATUS_CODES.has(status))) &&
      !isOffline;

    if (shouldRetry) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      if (config.__retryCount <= MAX_RETRIES) {
        const delay = 300 * config.__retryCount ** 2;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    const formatted = asApiError(error);

    if (status === 401 && logoutHandler) {
      logoutHandler();
      emitToast({
        title: "Session expired",
        description: "Please sign in again.",
        tone: "warning",
      });
    } else if (!isNetworkError || !isOffline) {
      emitToast({
        title: "Request failed",
        description: formatted.message,
        tone: "error",
      });
    }

    return Promise.reject(formatted);
  }
);

function emitToast(payload) {
  if (toastEmitter) {
    toastEmitter(payload);
  }
}

function retryWhenOnline(config, nextRetryCount) {
  return new Promise((resolve, reject) => {
    const handler = () => {
      window.removeEventListener("online", handler);
      config.__retryCount = nextRetryCount;
      api(config).then(resolve).catch(reject);
    };

    window.addEventListener("online", handler, { once: true });
  });
}

export function asApiError(err) {
  if (err.response) {
    return {
      status: err.response.status,
      message: err.response.data?.message || err.message,
      data: err.response.data,
    };
  }
  if (err?.message) {
    return { status: null, message: err.message };
  }
  return { status: null, message: "Network request failed" };
}
