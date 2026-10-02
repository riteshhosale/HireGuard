import { apiRequest } from "./api";

export const reportApi = {
  // Get the final report for a scan
  get: (scanId) =>
    apiRequest(
      `/reports/${encodeURIComponent(scanId)}`
    ),
};