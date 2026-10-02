import { apiRequest } from "./api";

export const scanApi = {
  // Create a new job scan
  create: (jobUrl) =>
    apiRequest("/scans", {
      method: "POST",
      body: JSON.stringify({
        jobUrl,
      }),
    }),

  // Get scan status/result
  get: (scanId) =>
    apiRequest(`/scans/${encodeURIComponent(scanId)}`),

  // Get user's scan history
  getAll: () => apiRequest("/scans"),

  // Get scanner events
  getEvents: (scanId) =>
    apiRequest(
      `/scans/${encodeURIComponent(scanId)}/events`
    ),
};