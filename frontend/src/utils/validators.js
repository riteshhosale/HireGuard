export function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value || "").trim()
  );
}

export function validateJobUrl(rawUrl) {
  const value = String(rawUrl || "").trim();

  if (!value) {
    return {
      valid: false,
      message: "Job URL daalo.",
    };
  }

  if (value.includes(" ")) {
    return {
      valid: false,
      message: "URL mein spaces nahi hone chahiye.",
    };
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return {
        valid: false,
        message: "Sirf HTTP ya HTTPS URL allow hai.",
      };
    }

    const hostname = url.hostname.toLowerCase();

    if (
      !hostname.includes(".") ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]"
    ) {
      return {
        valid: false,
        message:
          "Ye public job URL nahi lag raha. Local ya private URL allow nahi hai.",
      };
    }

    return {
      valid: true,
      message: "",
    };
  } catch {
    return {
      valid: false,
      message:
        "Valid job URL enter karein, jaise https://example.com/job",
    };
  }
}