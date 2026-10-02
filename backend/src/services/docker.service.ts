import {
  spawn,
  type ChildProcess,
} from "node:child_process";

import type {
  DockerScanResult,
} from "../types/docker.types.js";

export interface DockerScanOptions {
  scanId: string;
  jobUrl: string;
}

const SCANNER_TIMEOUT_MS = 60_000;
const CLEANUP_TIMEOUT_MS = 10_000;

const MAX_STDOUT_BYTES = 5 * 1024 * 1024;
const MAX_STDERR_BYTES = 2 * 1024 * 1024;

export class DockerService {
  async runScan(
    options: DockerScanOptions,
  ): Promise<DockerScanResult> {
    const containerName =
      `jobguard-scan-${options.scanId}`;

    const args = [
      "run",
      "--rm",
      "--name",
      containerName,
      "--init",
      "--memory",
      "1g",
      "--cpus",
      "1",
      "--pids-limit",
      "256",
      "--network",
      "bridge",
      "jobguard-scanner:latest",
      "node",
      "dist/scanner-entry.js",
      options.jobUrl,
    ];

    return new Promise(
      (resolve, reject) => {
        let child: ChildProcess;

        try {
          child = spawn(
            "docker",
            args,
            {
              stdio: [
                "ignore",
                "pipe",
                "pipe",
              ],
            },
          );
        } catch (error) {
          reject(
            new Error(
              `Unable to start Docker process: ${
                error instanceof Error
                  ? error.message
                  : "Unknown error"
              }`,
            ),
          );

          return;
        }

        let stdout = "";
        let stderr = "";

        let stdoutBytes = 0;
        let stderrBytes = 0;

        let settled = false;
        let timedOut = false;

        const cleanup = async (): Promise<void> => {
          clearTimeout(timeout);

          if (!child.killed) {
            try {
              child.kill("SIGTERM");
            } catch {
            }
          }

          await this.stopContainer(
            containerName,
          );
        };

        const fail = async (
          error: Error,
        ): Promise<void> => {
          if (settled) {
            return;
          }

          settled = true;

          await cleanup();

          reject(error);
        };

        const timeout =
          setTimeout(
            () => {
              if (settled) {
                return;
              }

              timedOut = true;

              void fail(
                new Error(
                  `Scanner container timed out after ${
                    SCANNER_TIMEOUT_MS / 1000
                  } seconds: ${containerName}`,
                ),
              );
            },
            SCANNER_TIMEOUT_MS,
          );

        child.stdout?.on(
          "data",
          (data: Buffer) => {
            if (settled) {
              return;
            }

            stdoutBytes +=
              data.byteLength;

            if (
              stdoutBytes >
              MAX_STDOUT_BYTES
            ) {
              void fail(
                new Error(
                  "Scanner stdout exceeded the maximum allowed size",
                ),
              );

              return;
            }

            stdout +=
              data.toString("utf8");
          },
        );

        child.stderr?.on(
          "data",
          (data: Buffer) => {
            if (settled) {
              return;
            }

            stderrBytes +=
              data.byteLength;

            if (
              stderrBytes >
              MAX_STDERR_BYTES
            ) {
              void fail(
                new Error(
                  "Scanner stderr exceeded the maximum allowed size",
                ),
              );

              return;
            }

            stderr +=
              data.toString("utf8");
          },
        );

        child.on(
          "error",
          (error) => {
            if (settled) {
              return;
            }

            void fail(
              new Error(
                `Docker process error: ${error.message}`,
              ),
            );
          },
        );

        child.on(
          "close",
          (code, signal) => {
            if (settled) {
              return;
            }

            settled = true;

            clearTimeout(timeout);

            if (timedOut) {
              return;
            }

            if (signal) {
              reject(
                new Error(
                  `Scanner process terminated by signal ${signal}`,
                ),
              );

              return;
            }

            if (code === 0) {
              try {
                const result =
                  this.parseResult(
                    stdout,
                  );

                resolve(result);
              } catch (error) {
                reject(error);
              }

              return;
            }

            const errorDetails =
              stderr.trim();

            try {
              const result =
                this.parseResult(stdout);

              if (!result.success) {
                reject(
                  new Error(
                    result.error ??
                      "Scanner reported failure",
                  ),
                );

                return;
              }
            } catch {
            }

            reject(
              new Error(
                `Scanner failed with code ${code}: ${
                  errorDetails ||
                  "Unknown scanner error"
                }`,
              ),
            );
          },
        );
      },
    );
  }

  private parseResult(
    output: string,
  ): DockerScanResult {
    const trimmed =
      output.trim();

    if (!trimmed) {
      throw new Error(
        "Scanner returned empty output",
      );
    }

    let parsed: unknown;

    try {
      parsed =
        JSON.parse(trimmed);
    } catch {
      throw new Error(
        "Scanner returned invalid JSON",
      );
    }

    if (
      typeof parsed !==
        "object" ||
      parsed === null
    ) {
      throw new Error(
        "Scanner returned an invalid result object",
      );
    }

    if (
      !("success" in parsed) ||
      typeof (
        parsed as {
          success?: unknown;
        }
      ).success !== "boolean"
    ) {
      throw new Error(
        "Scanner result is missing a valid success field",
      );
    }

    const result =
      parsed as DockerScanResult;

    if (
      result.success &&
      !result.evidence
    ) {
      throw new Error(
        "Scanner reported success without evidence",
      );
    }

    if (
      !result.success &&
      !result.error
    ) {
      throw new Error(
        "Scanner reported failure without an error message",
      );
    }

    return result;
  }

  private async stopContainer(
    containerName: string,
  ): Promise<void> {
    return new Promise(
      (resolve) => {
        let settled =
          false;

        const finish = (): void => {
          if (settled) {
            return;
          }

          settled = true;

          clearTimeout(
            cleanupTimeout,
          );

          resolve();
        };

        const cleanupTimeout =
          setTimeout(
            finish,
            CLEANUP_TIMEOUT_MS,
          );

        let process: ChildProcess;

        try {
          process = spawn(
            "docker",
            [
              "stop",
              containerName,
            ],
            {
              stdio: "ignore",
            },
          );
        } catch {
          finish();
          return;
        }

        process.on(
          "close",
          finish,
        );

        process.on(
          "error",
          finish,
        );
      },
    );
  }
}