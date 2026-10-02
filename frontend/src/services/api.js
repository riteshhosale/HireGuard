const rawApiUrl = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api/v1"
    : "https://jobguard-backend-6luk.onrender.com/api/v1")
)
  .trim()
  .replace(/\/+$/, "");

export const API_BASE_URL = rawApiUrl.endsWith("/api/v1")
  ? rawApiUrl
  : `${rawApiUrl}/api/v1`;

const ACCESS_TOKEN = "jobguard_access_token";
const REFRESH_TOKEN = "jobguard_refresh_token";
const USER = "jobguard_user";

export const api = {
  getToken: () => localStorage.getItem(ACCESS_TOKEN),

  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN),

  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(USER) || "null");
    } catch {
      return null;
    }
  },

  isAuthenticated: () => Boolean(localStorage.getItem(ACCESS_TOKEN)),

  setAuthSession(tokens, user) {
    if (tokens?.accessToken) {
      localStorage.setItem(ACCESS_TOKEN, tokens.accessToken);
    }

    if (tokens?.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN, tokens.refreshToken);
    }

    if (user) {
      localStorage.setItem(USER, JSON.stringify(user));
    }
  },

  clearAuthSession() {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(USER);
  },

  async request(endpoint, options = {}, canRefresh = true) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const token = this.getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === "object") {
      config.body = JSON.stringify(config.body);
    }

    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}${
          endpoint.startsWith("/") ? endpoint : `/${endpoint}`
        }`,
        config,
      );
    } catch {
      throw new Error(
        "Unable to connect to HireGuard backend. If the backend is waking up (Render free tier), please wait 30-50 seconds and try again.",
      );
    }

    /*
     * Automatically refresh expired access token.
     */
    if (
      response.status === 401 &&
      canRefresh &&
      this.getRefreshToken() &&
      !endpoint.includes("/auth/")
    ) {
      const refreshed = await this.refreshToken();

      if (refreshed) {
        return this.request(endpoint, options, false);
      }

      this.clearAuthSession();

      throw new Error("Your session has expired. Please log in again.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errors = data?.errors
        ? Object.values(data.errors).flat().join(", ")
        : "";

      const error = new Error(
        data?.message || errors || `Request failed (${response.status})`,
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  },

  async login(email, password) {
    const data = await this.request("/auth/login", {
      method: "POST",
      body: {
        email,
        password,
      },
    });

    this.setAuthSession(data.data?.tokens, data.data?.user);

    return data;
  },

  async register(name, email, password) {
    const data = await this.request("/auth/register", {
      method: "POST",
      body: {
        name,
        email,
        password,
      },
    });

    this.setAuthSession(data.data?.tokens, data.data?.user);

    return data;
  },

  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      const data = await this.request(
        "/auth/refresh",
        {
          method: "POST",
          body: {
            refreshToken,
          },
        },
        false,
      );

      this.setAuthSession(data.data?.tokens);

      return Boolean(data.data?.tokens?.accessToken);
    } catch {
      return false;
    }
  },

  logout() {
    this.clearAuthSession();
    window.location.assign("/login");
  },

  getMe: () => api.request("/auth/me"),

  createScan: (jobUrl) =>
    api.request("/scans", {
      method: "POST",
      body: {
        jobUrl,
      },
    }),

  getScan: (id) => api.request(`/scans/${encodeURIComponent(id)}`),

  getUserScans: () => api.request("/scans"),

  getReport: (id) => api.request(`/reports/${encodeURIComponent(id)}`),

  getScanFindings: (id) =>
    api.request(`/scans/${encodeURIComponent(id)}/findings`),
};

/*
 * Compatibility wrapper
 *
 * New service files use:
 *
 * import { apiRequest } from "./api";
 *
 * This keeps those files compatible with
 * the existing `api` architecture.
 */
export const apiRequest = (endpoint, options = {}) => {
  return api.request(endpoint, options);
};
