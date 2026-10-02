export function formatFindingType(type) {
  const normalized = String(type || "Finding")
    .replaceAll("_", " ")
    .replace(/\bCREDENTIALAL\b/gi, "CREDENTIAL")
    .replace(/\bCREDENTAIL\b/gi, "CREDENTIAL")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || "Finding";
}