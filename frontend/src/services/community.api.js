import { apiRequest } from "./api";

export const communityApi = {
  listPosts: ({ q = "", category = "" } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const suffix = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/community/posts${suffix}`);
  },
  getPost: (id) => apiRequest(`/community/posts/${encodeURIComponent(id)}`),
  createPost: (payload) => apiRequest("/community/posts", { method: "POST", body: payload }),
  toggleLike: (id) => apiRequest(`/community/posts/${encodeURIComponent(id)}/like`, { method: "POST" }),
  toggleBookmark: (id) => apiRequest(`/community/posts/${encodeURIComponent(id)}/bookmark`, { method: "POST" }),
  listComments: (id) => apiRequest(`/community/posts/${encodeURIComponent(id)}/comments`),
  createComment: (id, text) => apiRequest(`/community/posts/${encodeURIComponent(id)}/comments`, { method: "POST", body: { text } }),
  reportPost: (id, reason) => apiRequest(`/community/posts/${encodeURIComponent(id)}/report`, { method: "POST", body: { reason } }),
};

export const COMMUNITY_CATEGORIES = [
  ["", "All scams"], ["FAKE_JOB", "Fake job"], ["FAKE_RECRUITER", "Fake recruiter"],
  ["REGISTRATION_FEE", "Registration fee"], ["WORK_FROM_HOME", "Work from home"],
  ["PAYMENT_SCAM", "Payment scam"], ["PHISHING", "Phishing"], ["FAKE_WEBSITE", "Fake website"],
  ["IDENTITY_SCAM", "Identity / document"], ["OTHER", "Other"],
];

export const CONTACT_METHODS = ["WHATSAPP", "TELEGRAM", "EMAIL", "PHONE", "LINKEDIN", "JOB_WEBSITE", "SMS", "OTHER"];
