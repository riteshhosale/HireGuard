import { z } from "zod";

export const analyzeJobPostSchema = z.object({
  url: z.string().trim().url("Enter a valid LinkedIn job URL").max(2048),
  description: z.string().trim().max(30000).optional().default(""),
}).superRefine((data, ctx) => {
  try {
    const parsed = new URL(data.url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (parsed.protocol !== "https:" || host !== "linkedin.com" || !parsed.pathname.startsWith("/jobs/")) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Use a public LinkedIn job URL such as https://www.linkedin.com/jobs/view/...",
      });
    }
  } catch {
    ctx.addIssue({ code: "custom", path: ["url"], message: "Enter a valid LinkedIn job URL" });
  }
});

export type AnalyzeJobPostInput = z.infer<typeof analyzeJobPostSchema>;
