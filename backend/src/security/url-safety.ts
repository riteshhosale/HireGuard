import { promises as dns } from "node:dns";
import { isIP } from "node:net";

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
]);

function blockedIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [first = 0, second = 0] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51) ||
    (first === 203 && second === 0) ||
    first >= 224
  );
}

function parseIpv6Groups(address: string): number[] | null {
  const withoutZone = address.split("%")[0]?.toLowerCase();

  if (!withoutZone) {
    return null;
  }

  let normalized = withoutZone;
  const lastColon = normalized.lastIndexOf(":");
  const ipv4Part = normalized.slice(lastColon + 1);

  if (ipv4Part.includes(".")) {
    const ipv4Groups = ipv4Part.split(".").map(Number);

    if (ipv4Groups.length !== 4 || ipv4Groups.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
      return null;
    }

    const first = ((ipv4Groups[0] ?? 0) << 8) | (ipv4Groups[1] ?? 0);
    const second = ((ipv4Groups[2] ?? 0) << 8) | (ipv4Groups[3] ?? 0);
    normalized = `${normalized.slice(0, lastColon + 1)}${first.toString(16)}:${second.toString(16)}`;
  }

  const halves = normalized.split("::");

  if (halves.length > 2) {
    return null;
  }

  const left = halves[0] ? halves[0].split(":") : [];
  const right = halves[1] ? halves[1].split(":") : [];
  const missing = 8 - left.length - right.length;

  if (missing < 0 || (halves.length === 1 && missing !== 0)) {
    return null;
  }

  const groups = [
    ...left,
    ...Array.from({ length: missing }, () => "0"),
    ...right,
  ].map((part) => Number.parseInt(part, 16));

  return groups.length === 8 && groups.every((part) => Number.isInteger(part) && part >= 0 && part <= 0xffff)
    ? groups
    : null;
}

function blockedIp(address: string): boolean {
  if (isIP(address) === 4) {
    return blockedIpv4(address);
  }

  if (isIP(address) !== 6) {
    return true;
  }

  const groups = parseIpv6Groups(address);

  if (!groups) {
    return true;
  }

  const isLoopback = groups.slice(0, 7).every((group) => group === 0) && groups[7] === 1;
  const isUnspecified = groups.every((group) => group === 0);
  const isPrivate = ((groups[0] ?? 0) & 0xfe00) === 0xfc00;
  const isLinkLocal = ((groups[0] ?? 0) & 0xffc0) === 0xfe80;
  const isMappedIpv4 = groups.slice(0, 5).every((group) => group === 0) && groups[5] === 0xffff;

  if (isMappedIpv4) {
    const ipv4 = `${(groups[6] ?? 0) >> 8}.${(groups[6] ?? 0) & 0xff}.${(groups[7] ?? 0) >> 8}.${(groups[7] ?? 0) & 0xff}`;
    return blockedIpv4(ipv4);
  }

  return isLoopback || isUnspecified || isPrivate || isLinkLocal || (groups[0] ?? 0) >= 0xff00;
}

export function isBlockedHostname(value: string): boolean {
  const hostname = value.toLowerCase().replace(/\.$/, "");

  return (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    (isIP(hostname) !== 0 && blockedIp(hostname))
  );
}

export async function assertPublicHttpUrl(
  value: string,
  cache: Map<string, Promise<void>> = new Map(),
): Promise<void> {
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("Scanner target is not a valid URL");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Scanner target must use HTTP or HTTPS");
  }

  const hostname = parsed.hostname.toLowerCase().replace(/\.$/, "");

  if (isBlockedHostname(hostname)) {
    throw new Error("Scanner target resolves to a private or local address");
  }

  const existingCheck = cache.get(hostname);

  if (existingCheck) {
    return existingCheck;
  }

  const check = dns.lookup(hostname, { all: true, verbatim: true }).then((addresses) => {
    if (addresses.length === 0 || addresses.some(({ address }) => blockedIp(address))) {
      throw new Error("Scanner target resolves to a private or local address");
    }
  });

  cache.set(hostname, check);
  return check;
}