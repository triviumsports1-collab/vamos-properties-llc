import { isDriveFolderUrl, listingSlugBase, normalizeAddress, safeHttpUrl } from "@/lib/listings/address";
import { isPropertyType } from "@/lib/listings/catalog";
import { dropAmount, parseFlexiblePrice } from "@/lib/listings/money";
import type { SheetGalleryGroup, SheetListingDraft, SheetParseResult } from "@/lib/gdoc-listings/types";

const COLUMNS = [
  "sourceMessageId",
  "addressKey",
  "title",
  "address",
  "city",
  "listPrice",
  "arv",
  "beds",
  "baths",
  "sqft",
  "propertyType",
  "description",
  "photos",
  "extraPhotos",
  "driveFolderUrl",
  "status",
  "hoa",
  "ac",
  "roof",
  "waterHeater",
  "titleCompany",
  "extraNotes",
  "previousPrice",
  "priceDropFlag",
  "updatedFlag",
  "listedAt",
  "sheetUpdatedAt",
  "priceHistory",
  "updateNotes",
  "listingCode",
  "sheetSlug",
  "metaTitle",
  "metaDescription",
  "metaKeywords",
  "localTargetArea",
  "canonicalUrl",
  "schemaJsonLd",
  "latitude",
  "longitude",
  "sheetSyncStatus",
  "sheetSyncedAt",
] as const;

type ColumnKey = (typeof COLUMNS)[number];

const HEADER_ALIASES: Record<string, ColumnKey> = {
  sourcemessageid: "sourceMessageId",
  messageid: "sourceMessageId",
  messageidstring: "sourceMessageId",
  emailidzohouid: "sourceMessageId",
  emailid: "sourceMessageId",
  sourceemailids: "sourceMessageId",
  sourceemailid: "sourceMessageId",
  zohouid: "sourceMessageId",
  addresskey: "addressKey",
  title: "title",
  name: "title",
  headline: "title",
  propertytitle: "title",
  address: "address",
  street: "address",
  streetaddress: "address",
  fulladdress: "address",
  city: "city",
  locality: "city",
  listprice: "listPrice",
  price: "listPrice",
  asking: "listPrice",
  askingprice: "listPrice",
  arv: "arv",
  afterrepairvalue: "arv",
  beds: "beds",
  bed: "beds",
  bedrooms: "beds",
  br: "beds",
  bedsbaths: "beds",
  baths: "baths",
  bath: "baths",
  bathrooms: "baths",
  ba: "baths",
  sqft: "sqft",
  sq_ft: "sqft",
  squarefeet: "sqft",
  squarefootage: "sqft",
  squarefootagesqft: "sqft",
  propertytype: "propertyType",
  type: "propertyType",
  description: "description",
  summary: "description",
  notes: "description",
  remarks: "description",
  keyfeaturesnotes: "description",
  photos: "photos",
  photourls: "photos",
  images: "photos",
  imageurls: "photos",
  gallery: "photos",
  exterior: "photos",
  coverimageurl: "photos",
  cover: "photos",
  extraphotos: "extraPhotos",
  morephotos: "extraPhotos",
  gallery2: "extraPhotos",
  interior: "extraPhotos",
  interiors: "extraPhotos",
  galleryimageurls: "extraPhotos",
  drivefolderurl: "driveFolderUrl",
  folder: "driveFolderUrl",
  drive: "driveFolderUrl",
  photofolder: "driveFolderUrl",
  status: "status",
  listingstatus: "status",
  listingstate: "status",
  previousprice: "previousPrice",
  originalprice: "previousPrice",
  oldprice: "previousPrice",
  lastprice: "previousPrice",
  priorprice: "previousPrice",
  previousaskingprice: "previousPrice",
  pricedrop: "priceDropFlag",
  pricedropped: "priceDropFlag",
  pricedropflag: "priceDropFlag",
  drop: "priceDropFlag",
  updated: "updatedFlag",
  isupdated: "updatedFlag",
  pricechange: "updatedFlag",
  pricechanged: "updatedFlag",
  recentlyupdated: "updatedFlag",
  hoa: "hoa",
  hoafee: "hoa",
  hoadues: "hoa",
  monthlyhoa: "hoa",
  ac: "ac",
  hvac: "ac",
  airconditioning: "ac",
  airconditioner: "ac",
  roof: "roof",
  roofage: "roof",
  rooftype: "roof",
  waterheater: "waterHeater",
  titlecompany: "titleCompany",
  escrow: "titleCompany",
  emailnotes: "extraNotes",
  additionalnotes: "extraNotes",
  listed: "listedAt",
  listedist: "listedAt",
  listedat: "listedAt",
  lastupdated: "sheetUpdatedAt",
  lastupdatedist: "sheetUpdatedAt",
  sheetupdatedat: "sheetUpdatedAt",
  pricehistory: "priceHistory",
  updatenotes: "updateNotes",
  listingid: "listingCode",
  listingcode: "listingCode",
  vpid: "listingCode",
  slug: "sheetSlug",
  urlslug: "sheetSlug",
  metatitle: "metaTitle",
  metadesc: "metaDescription",
  metadescription: "metaDescription",
  metakeywords: "metaKeywords",
  keywords: "metaKeywords",
  localtargetarea: "localTargetArea",
  localtags: "localTargetArea",
  localtargeting: "localTargetArea",
  canonicalurl: "canonicalUrl",
  canonical: "canonicalUrl",
  schemajsonld: "schemaJsonLd",
  jsonld: "schemaJsonLd",
  schema: "schemaJsonLd",
  latitude: "latitude",
  lat: "latitude",
  longitude: "longitude",
  lng: "longitude",
  lon: "longitude",
  syncstatus: "sheetSyncStatus",
  lastsyncedat: "sheetSyncedAt",
};

export function parseSheetRows(rows: string[][]): SheetParseResult {
  if (rows.length === 0) return { drafts: [], skipped: {}, rows: 0 };

  const headerRow = rows[0] ?? [];
  const keyed = looksLikeHeader(headerRow);
  const keys = keyed ? headerKeys(headerRow) : [...COLUMNS];
  const dataRows = keyed ? rows.slice(1) : rows;
  const skipped: Record<string, number> = {};
  const drafts: SheetListingDraft[] = [];

  dataRows.forEach((row, index) => {
    const sheetRow = index + (keyed ? 2 : 1);
    const draft = toDraft(row, keys, sheetRow);
    if (draft) {
      drafts.push(draft);
      return;
    }
    const reason = skipReason(row, keys);
    skipped[reason] = (skipped[reason] ?? 0) + 1;
  });

  return { drafts, skipped, rows: dataRows.length };
}

export function foldSheetDrafts(drafts: SheetListingDraft[]) {
  const byKey = new Map<string, SheetListingDraft>();
  for (const draft of drafts) {
    const prior = byKey.get(draft.sheetKey);
    if (!prior) {
      byKey.set(draft.sheetKey, draft);
      continue;
    }
    byKey.set(draft.sheetKey, mergeSameAddress(prior, draft));
  }
  return [...byKey.values()];
}

function mergeSameAddress(prior: SheetListingDraft, draft: SheetListingDraft): SheetListingDraft {
  const keepPrior = prior.status === "active" && draft.status !== "active";
  if (keepPrior) {
    return {
      ...prior,
      listingCode: prior.listingCode || draft.listingCode,
      sheetSlug: prior.sheetSlug || draft.sheetSlug,
      listedAt: prior.listedAt || draft.listedAt,
      sheetUpdatedAt: prior.sheetUpdatedAt || draft.sheetUpdatedAt,
      priceHistory: prior.priceHistory || draft.priceHistory,
      updateNotes: prior.updateNotes || draft.updateNotes,
      metaTitle: prior.metaTitle || draft.metaTitle,
      metaDescription: prior.metaDescription || draft.metaDescription,
      metaKeywords: prior.metaKeywords || draft.metaKeywords,
      localTargetArea: prior.localTargetArea || draft.localTargetArea,
      canonicalUrl: prior.canonicalUrl || draft.canonicalUrl,
      schemaJsonLd: prior.schemaJsonLd || draft.schemaJsonLd,
      latitude: prior.latitude ?? draft.latitude,
      longitude: prior.longitude ?? draft.longitude,
      sourceMessageId: prior.sourceMessageId || draft.sourceMessageId,
    };
  }

  const priceChanged = prior.listPrice != null && draft.listPrice != null && prior.listPrice !== draft.listPrice;
  const drop = priceChanged ? dropAmount(prior.listPrice, draft.listPrice) : null;
  return {
    ...draft,
    listingCode: draft.listingCode || prior.listingCode,
    sheetSlug: draft.sheetSlug || prior.sheetSlug,
    listedAt: draft.listedAt || prior.listedAt,
    sheetUpdatedAt: draft.sheetUpdatedAt || prior.sheetUpdatedAt,
    priceHistory: draft.priceHistory || prior.priceHistory,
    updateNotes: draft.updateNotes || prior.updateNotes,
    metaTitle: draft.metaTitle || prior.metaTitle,
    metaDescription: draft.metaDescription || prior.metaDescription,
    metaKeywords: draft.metaKeywords || prior.metaKeywords,
    localTargetArea: draft.localTargetArea || prior.localTargetArea,
    canonicalUrl: draft.canonicalUrl || prior.canonicalUrl,
    schemaJsonLd: draft.schemaJsonLd || prior.schemaJsonLd,
    latitude: draft.latitude ?? prior.latitude,
    longitude: draft.longitude ?? prior.longitude,
    sourceMessageId: draft.sourceMessageId || prior.sourceMessageId,
    previousPrice: priceChanged ? (draft.previousPrice ?? prior.listPrice) : (draft.previousPrice ?? prior.previousPrice),
    flaggedDrop: draft.flaggedDrop || drop != null,
    flaggedUpdated: draft.flaggedUpdated || (priceChanged && drop == null),
  };
}

function toDraft(row: string[], keys: Array<ColumnKey | "">, sheetRow: number): SheetListingDraft | null {
  const cells = cellsFromRow(row, keys);
  const address = publicAddress(cells.address, cells.title);
  if (!address) return null;

  const city = cityFromAddress(address, cells.city.replace(/\s+/g, " ").trim().slice(0, 80));
  const title = cells.title.replace(/\s+/g, " ").trim() || address;
  const mainPhotos = uniquePhotos(splitUrls(cells.photos));
  const extraPhotos = uniquePhotos(splitUrls(cells.extraPhotos), mainPhotos);
  const photos = uniquePhotos([...mainPhotos, ...extraPhotos]);
  const driveFolderUrl = driveFolder(cells.driveFolderUrl) || driveFolder(cells.extraPhotos);
  const galleries = galleryGroups(mainPhotos, extraPhotos);
  const addressKey = cells.addressKey || normalizeAddress(address);
  const sourceMessageId = cells.sourceMessageId;
  const bedsBaths = parseBedsBaths(cells.beds) ?? parseBedsBaths(cells.baths);
  const notes = [cells.description, cells.updateNotes, cells.extraNotes].map((value) => value.trim()).filter(Boolean);
  const description = uniqueNotes(notes).join("\n\n");
  const listingCode = parseListingCode(cells.listingCode);
  const sheetSlug = parseSheetSlug(cells.sheetSlug);
  const hoa = cells.hoa.trim() || labeledSpec(description, ["hoa", "hoa fee", "hoa dues"]);
  const ac = cells.ac.trim() || labeledSpec(description, ["a\\/c", "hvac", "air conditioning", "air conditioner"]);
  const roof = cells.roof.trim() || labeledSpec(description, ["roof"]);
  const waterHeater = cells.waterHeater.trim() || labeledSpec(description, ["water heater"]);
  const titleCompany = cells.titleCompany.trim() || labeledSpec(description, ["title company", "escrow"]);

  return {
    sheetKey: addressKey,
    slugBase: listingSlugBase(address, city && !address.toLowerCase().includes(city.toLowerCase()) ? city : "", title),
    sheetSlug,
    listingCode,
    title,
    address,
    addressKey,
    city,
    listPrice: parseSheetNumber(cells.listPrice),
    previousPrice: parseSheetNumber(cells.previousPrice),
    arv: parseSheetNumber(cells.arv),
    beds: parseBeds(cells.beds) ?? bedsBaths?.beds ?? null,
    baths: parseBaths(cells.baths) || bedsBaths?.baths || "",
    sqft: parseSqft(cells.sqft),
    propertyType: normalizePropertyType(cells.propertyType),
    status: normalizeStatus(cells.status) || "active",
    description,
    photos,
    galleries,
    coverPhoto: photos[0] ?? "",
    driveFolderUrl,
    hoa,
    ac,
    roof,
    waterHeater,
    titleCompany,
    sourceMessageId,
    listedAt: cells.listedAt.replace(/\s+/g, " ").trim().slice(0, 80),
    sheetUpdatedAt: cells.sheetUpdatedAt.replace(/\s+/g, " ").trim().slice(0, 80),
    priceHistory: cells.priceHistory.trim().slice(0, 4000),
    updateNotes: cells.updateNotes.trim().slice(0, 4000),
    metaTitle: cells.metaTitle.replace(/\s+/g, " ").trim().slice(0, 120),
    metaDescription: cells.metaDescription.replace(/\s+/g, " ").trim().slice(0, 320),
    metaKeywords: cells.metaKeywords.replace(/\s+/g, " ").trim().slice(0, 400),
    localTargetArea: cells.localTargetArea.replace(/\s+/g, " ").trim().slice(0, 160),
    canonicalUrl: parseCanonical(cells.canonicalUrl),
    schemaJsonLd: parseSchemaJsonLd(cells.schemaJsonLd),
    latitude: parseLatitude(cells.latitude),
    longitude: parseLongitude(cells.longitude),
    sheetSyncStatus: cells.sheetSyncStatus.replace(/\s+/g, " ").trim().slice(0, 40).toLowerCase(),
    sheetSyncedAt: cells.sheetSyncedAt.replace(/\s+/g, " ").trim().slice(0, 80),
    sheetRow,
    flaggedDrop: parseSheetFlag(cells.priceDropFlag) || notesSuggestPriceDrop(description),
    flaggedUpdated: parseSheetFlag(cells.updatedFlag) || notesSuggestUpdated(description),
  };
}

function cellsFromRow(row: string[], keys: Array<ColumnKey | "">) {
  const cells = Object.fromEntries(COLUMNS.map((key) => [key, ""])) as Record<ColumnKey, string>;
  keys.forEach((key, column) => {
    if (!key) return;
    const value = (row[column] ?? "").trim();
    if (value) cells[key] = value;
  });
  return cells;
}

function skipReason(row: string[], keys: Array<ColumnKey | "">) {
  const cells = cellsFromRow(row, keys);
  if (!publicAddress(cells.address, cells.title)) return "missing_address";
  return "unmapped";
}

function galleryGroups(photos: string[], extraPhotos: string[]): SheetGalleryGroup[] {
  const groups: SheetGalleryGroup[] = [];
  if (photos.length > 0) {
    groups.push({ id: "photos", label: photos.length === 1 ? "Cover photo" : "Photos", photos });
  }
  if (extraPhotos.length > 0) {
    groups.push({ id: "more-photos", label: "Gallery", photos: extraPhotos });
  }
  return groups;
}

function headerKeys(row: string[]): Array<ColumnKey | ""> {
  return row.map((cell, index) => {
    const token = normalizeHeader(cell);
    if (token && token in HEADER_ALIASES) return HEADER_ALIASES[token];
    if (token) return "";
    return COLUMNS[index] ?? "";
  });
}

function looksLikeHeader(row: string[]) {
  const tokens = row.map((cell) => normalizeHeader(cell)).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.some((token) => token in HEADER_ALIASES);
}

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function splitUrls(value: string) {
  return value
    .split(/[\n,|;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniquePhotos(values: string[], existing: string[] = []) {
  const unique = [...existing];
  const seen = new Set(existing.map(photoKey));
  for (const item of values) {
    const url = normalizeSheetPhoto(item);
    if (!url || !isSheetPhoto(url)) continue;
    const key = photoKey(url);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(url);
    if (unique.length >= 40) break;
  }
  return unique.slice(existing.length);
}

function isSheetPhoto(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    const host = parsed.hostname.toLowerCase();
    if (host === "drive.google.com") {
      if (parsed.pathname.includes("/folders/")) return false;
      return Boolean(parsed.searchParams.get("id") || /\/file\/d\//.test(parsed.pathname) || parsed.pathname === "/thumbnail");
    }
    if (host === "lh3.googleusercontent.com" || host.endsWith(".googleusercontent.com")) return true;
    if (isDriveFolderUrl(url)) return false;
    return true;
  } catch {
    return false;
  }
}

function normalizeSheetPhoto(value: string) {
  const url = safeHttpUrl(value) || value.trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (parsed.hostname.toLowerCase() === "drive.google.com") {
      const id = parsed.searchParams.get("id") || parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
      if (id) return `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1600`;
    }
    return parsed.toString().slice(0, 2000);
  } catch {
    return "";
  }
}

function photoKey(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("id") || parsed.pathname.match(/\/file\/d\/([^/]+)/)?.[1] || parsed.toString();
  } catch {
    return url;
  }
}

function driveFolder(value: string) {
  const url = safeHttpUrl(value);
  if (!url || !isDriveFolderUrl(url) || !url.includes("/folders/")) return "";
  return url;
}

function parseSheetNumber(value: string) {
  const fromFlexible = parseFlexiblePrice(value);
  if (fromFlexible != null) return fromFlexible;
  const compact = value.trim().replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(compact)) return null;
  const amount = Math.round(Number(compact));
  if (!Number.isFinite(amount) || amount < 1 || amount > 100_000_000) return null;
  return amount;
}

function parseBeds(value: string) {
  const match = /^(\d{1,2})(?:\.0+)?(?:\s*(?:bd|beds|bedrooms)?)?$/i.exec(value.trim());
  if (!match) return null;
  const beds = Number(match[1]);
  if (!Number.isInteger(beds) || beds < 0 || beds > 20) return null;
  return beds;
}

function parseBaths(value: string) {
  const text = value.trim();
  if (!text) return "";
  if (/^\d+(\.\d)?$/.test(text)) return text.slice(0, 8);
  const match = /^(\d+(?:\.\d)?)\s*(?:ba|baths|bathrooms)?$/i.exec(text);
  return match ? match[1].slice(0, 8) : "";
}

function parseBedsBaths(value: string) {
  const match = /(\d{1,2})\s*(?:bd|bed|beds|bedrooms)?\s*[\/,]\s*(\d+(?:\.\d)?)\s*(?:ba|bath|baths|bathrooms)?/i.exec(value.trim());
  if (!match) return null;
  const beds = Number(match[1]);
  const baths = match[2] ?? "";
  if (!Number.isInteger(beds) || beds < 0 || beds > 20) return null;
  return { beds, baths: baths.slice(0, 8) };
}

function parseSqft(value: string) {
  const compact = value.trim().replace(/[, ]/g, "").replace(/sqft|sf/gi, "");
  if (!/^\d+$/.test(compact)) return null;
  const sqft = Number(compact);
  if (!Number.isInteger(sqft) || sqft < 100 || sqft > 50_000) return null;
  return sqft;
}

function normalizePropertyType(value: string) {
  const raw = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (raw === "townhome" || raw === "town_home") return "townhouse";
  if (isPropertyType(raw)) return raw;
  return value.trim();
}

function cityFromAddress(address: string, city: string) {
  if (city) return city;
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    const maybe = parts.length >= 3 ? (parts[parts.length - 2] ?? "") : (parts[1] ?? "");
    if (maybe && !/^(az|arizona)$/i.test(maybe) && !/^\d/.test(maybe) && maybe.length <= 80) return maybe;
  }
  return "";
}

function normalizeStatus(value: string) {
  const text = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (!text) return "";
  if (text === "available" || text === "active" || text === "for_sale") return "active";
  if (text === "under_contract" || text === "pending" || text === "undercontract") return "under_contract";
  if (text === "sold" || text === "closed") return "sold";
  if (
    text === "inactive" ||
    text === "cancelled" ||
    text === "canceled" ||
    text === "expired" ||
    text === "off_market" ||
    text === "withdrawn" ||
    text === "draft"
  ) {
    return "inactive";
  }
  return text;
}

function publicAddress(address: string, title: string) {
  const street = address.replace(/\s+/g, " ").trim();
  if (street.length >= 5 && street.length <= 200) return street;
  const fallback = title.replace(/\s+/g, " ").trim();
  if (fallback.length >= 5 && fallback.length <= 200) return fallback;
  return "";
}

function uniqueNotes(values: string[]) {
  const seen = new Set<string>();
  const notes: string[] = [];
  for (const value of values) {
    const key = value.replace(/\s+/g, " ").trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    notes.push(value);
  }
  return notes;
}

function labeledSpec(text: string, labels: string[]) {
  if (!text) return "";
  const pattern = new RegExp(
    `(?:^|[\\n;,])\\s*(?:${labels.join("|")})\\s*(?:[:\\-–]\\s*|\\s+)([^\\n;,]+)`,
    "i",
  );
  return text.match(pattern)?.[1]?.trim().slice(0, 80) ?? "";
}

function parseSheetFlag(value: string) {
  const text = value.trim().toLowerCase();
  if (!text) return false;
  return /^(y|yes|true|1|x|drop|price\s*drop|updated|changed)$/i.test(text);
}

function notesSuggestPriceDrop(text: string) {
  return /\bprice\s*drop(?:ped)?\b/i.test(text);
}

function notesSuggestUpdated(text: string) {
  return /\b(?:price\s*change(?:d)?|updated\s*price|price\s*update(?:d)?)\b/i.test(text);
}

function parseListingCode(value: string) {
  const code = value.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z]{2,4}-[A-Z]{2}-[A-Z]{2,6}-\d{4,8}$/.test(code)) return "";
  return code.slice(0, 40);
}

function parseSheetSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
  return slug.length >= 3 ? slug : "";
}

function parseCanonical(value: string) {
  const text = value.trim();
  if (!text) return "";
  if (text.startsWith("/")) return text.slice(0, 300);
  return safeHttpUrl(text).slice(0, 300);
}

function parseSchemaJsonLd(value: string) {
  const text = value.trim();
  if (!text) return "";
  try {
    const parsed = JSON.parse(text) as unknown;
    if (!parsed || typeof parsed !== "object") return "";
    return JSON.stringify(parsed).slice(0, 20_000);
  } catch {
    return "";
  }
}

function parseLatitude(value: string) {
  return parseCoord(value, -90, 90);
}

function parseLongitude(value: string) {
  return parseCoord(value, -180, 180);
}

function parseCoord(value: string, min: number, max: number) {
  const compact = value.trim().replace(/[°NSEW\s]/gi, "");
  if (!/^-?\d+(\.\d+)?$/.test(compact)) return null;
  const amount = Number(compact);
  if (!Number.isFinite(amount) || amount < min || amount > max) return null;
  return amount;
}
