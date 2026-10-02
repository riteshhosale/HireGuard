import { apiRequest } from "./api";

export const authApi = {
  register: (name, email, password) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        password,
      }),
    }),

  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    }),

  refresh: (refreshToken) =>
    apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({
        refreshToken,
      }),
    }),

  me: () => apiRequest("/auth/me"),

  logout: () =>
    apiRequest("/auth/logout", {
      method: "POST",
    }),
};