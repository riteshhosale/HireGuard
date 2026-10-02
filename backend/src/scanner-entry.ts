import { scanUrl } from "./scanner/playwright.js";

interface ScannerResult {
  success: boolean;
  evidence?: unknown;
  error?: string;
}

async function main(): Promise<void> {
  const targetUrl =
    process.argv[2];

  if (!targetUrl) {
    const result:
      ScannerResult = {
        success: false,

        error:
          "Target URL is required",
      };

    console.log(
      JSON.stringify(result),
    );

    process.exitCode = 1;

    return;
  }

  try {
    const evidence =
      await scanUrl(
        targetUrl,
      );

    const result:
      ScannerResult = {
        success: true,

        evidence,
      };

    console.log(
      JSON.stringify(result),
    );
  } catch (error) {
    const result:
      ScannerResult = {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Unknown scanner error",
      };

    console.log(
      JSON.stringify(result),
    );

    process.exitCode = 1;
  }
}

void main();