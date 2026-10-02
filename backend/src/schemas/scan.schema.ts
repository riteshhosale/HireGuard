import { z } from "zod";
import { isBlockedHostname } from "../security/url-safety.js";

export const createScanSchema = z.object({
  jobUrl: z
    .string()
    .trim()
    .url("A valid job URL is required")
    .refine(
      (value) => {
        try {
          const url = new URL(value);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      {
        message: "Only HTTP and HTTPS URLs are allowed",
      },
    )
    .refine(
      (value) => {
        try {
          return !isBlockedHostname(
            new URL(value).hostname,
          );
        } catch {
          return false;
        }
      },
      {
        message: "Private or local scanner targets are not allowed",
      },
    ),
});

export type CreateScanInput = z.infer<typeof createScanSchema>;