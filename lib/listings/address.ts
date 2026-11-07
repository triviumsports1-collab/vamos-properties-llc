export function normalizeAddress(value: string) {
  return value
    .toLowerCase()
    .replace(/[.,#]/g, " ")
    .replace(/\b(street|st)\b/g, "st")
    .replace(/\b(avenue|ave)\b/g, "ave")
    .replace(/\b(boulevard|blvd)\b/g, "blvd")
    .replace(/\b(drive|dr)\b/g, "dr")
    .replace(/\b(road|rd)\b/g, "rd")
    .replace(/\b(lane|ln)\b/g, "ln")
    .replace(/\b(court|ct)\b/g, "ct")
    .replace(/\b(place|pl)\b/g, "pl")
    .replace(/\b(arizona|az)\b/g, "az")
    .replace(/\s+/g, " ")
    .trim();
}

export function listingSlugBase(address: string, city: string, title: string) {
  const base = `${address} ${city || title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return base || "home";
}

export function isDriveFolderUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host !== "drive.google.com" && host !== "docs.google.com") return false;
    return true;
  } catch {
    return false;
  }
}

export function safeHttpUrl(value: string, hosts?: string[]) {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    if (hosts && !hosts.includes(url.hostname.toLowerCase())) return "";
    return url.toString().slice(0, 2000);
  } catch {
    return "";
  }
}

export function isGalleryPhoto(url: string) {
  if (!url) return false;
  if (isDriveFolderUrl(url)) return false;
  return /^https?:\/\/\S+$/i.test(url) || /^\/listing-photos\/[a-z0-9-]+\.(jpg|png|webp)$/i.test(url);
}
