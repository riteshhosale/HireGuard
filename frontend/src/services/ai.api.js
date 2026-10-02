import { apiRequest } from "./api";

export const aiApi = {
  // Run AI analysis for a completed scan
  analyze: (scanId) =>
    apiRequest(
      `/ai/analyze/${encodeURIComponent(scanId)}`,
      {
        method: "POST",
      }
    ),
};