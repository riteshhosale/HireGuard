import { apiRequest } from "./api";

export const jobPostApi = {
  analyze: (url, description = "") =>
    apiRequest("/job-posts/analyze", {
      method: "POST",
      body: { url, description },
    }),
  getAll: () => apiRequest("/job-posts"),
};
