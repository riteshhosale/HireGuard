import type {
  ScanEvidence,
} from "../scanner/types.js";

export interface DockerScanResult {
  success: boolean;

  evidence?: ScanEvidence;

  error?: string;
}