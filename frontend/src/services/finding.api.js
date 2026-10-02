import { apiRequest } from "./api";

export const findingApi = {
  // Get all findings for a scan
  get: (scanId) =>
    apiRequest(
      `/scans/${encodeURIComponent(scanId)}/findings`
    ),
};