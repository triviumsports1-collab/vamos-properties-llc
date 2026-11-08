import "server-only";

import { isDriveFolderUrl, listingSlugBase, normalizeAddress, safeHttpUrl } from "@/lib/listings/address";
import { isPropertyType, propertyTypeLabel } from "@/lib/listings/catalog";
import { dropAmount, formatMoney, parseFlexiblePrice } from "@/lib/listings/money";
import { getGoogleSheetId, getGoogleSheetsClient, googleSheetsConfigured, sheetA1Range } from "@/lib/gdoc-listings/google";

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
] as const;

type ColumnKey = (typeof COLUMNS)[number];

const HEADER_ALIASES: Record<string, ColumnKey> = {
  sourcemessageid: "sourceMessageId",
  messageid: "sourceMessageId",
  messageidstring: "sourceMessageId",
  emailidzohouid: "sourceMessageId",
  emailid: "sourceMessageId",
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
};

export type SheetGalleryGroup = {
  id: string;
  label: string;
  photos: string[];
};

export type SheetListingSpec = {
  label: string;
  value: string;
};

export type SheetListingView = {
  id: string;
  sourceMessageId: string;
  addressKey: string;
  title: string;
  address: string;
  city: string;
  listPrice: number | null;
  arv: number | null;
  beds: number | null;
  baths: string;
  sqft: number | null;
  propertyType: string;
  description: string;
  photos: string[];
  coverPhoto: string;
  galleries: SheetGalleryGroup[];
  driveFolderUrl: string;
  status: string;
  previousPrice: number | null;
  drop: number | null;
  priceDropped: boolean;
  updated: boolean;
  hoa: string;
  ac: string;
  roof: string;
  waterHeater: string;
  titleCompany: string;
  specs: SheetListingSpec[];
};

export type SheetListingCardView = {
  id: string;
  title: string;
  address: string;
  city: string;
  listPrice: number | null;
  arv: number | null;
  beds: number | null;
  baths: string;
  sqft: number | null;
  propertyType: string;
  coverPhoto: string;
  status: string;
  previousPrice: number | null;
  drop: number | null;
  priceDropped: boolean;
  updated: boolean;
};

export async function listSheetListings(): Promise<SheetListingView[]> {
  if (!googleSheetsConfigured()) {
    console.error("[SHEET_LISTINGS]", { skipped: "missing_credentials" });
    return [];
  }

  try {
    const sheets = getGoogleSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: getGoogleSheetId(),
      range: sheetA1Range("A1:Z"),
      majorDimension: "ROWS",
      valueRenderOption: "FORMATTED_VALUE",
    });
    const rows = (response.data.values ?? []).map((row) => row.map((cell) => String(cell ?? "")));
    if (rows.length === 0) return [];

    const headerRow = rows[0] ?? [];
    const keyed = looksLikeHeader(headerRow);
    const keys = keyed ? headerKeys(headerRow) : [...COLUMNS];
    const dataRows = keyed ? rows.slice(1) : rows;

    const skipped: Record<string, number> = {};
    const listings: SheetListingView[] = [];
    dataRows.forEach((row, index) => {
      const listing = toListing(row, keys, index + (keyed ? 2 : 1));
      if (listing) {
        listings.push(listing);
        return;
      }
      const reason = skipReason(row, keys);
      skipped[reason] = (skipped[reason] ?? 0) + 1;
    });
    const unique = applyPriceSignals(uniqueListingIds(listings));
    console.log("[SHEET_LISTINGS]", { rows: dataRows.length, listings: unique.length, skipped });
    return unique;
  } catch (error) {
    console.error("[SHEET_LISTINGS]", {
      name: error instanceof Error ? error.name : "Error",
      status: statusFrom(error),
    });
    return [];
  }
}

function toListing(row: string[], keys: Array<ColumnKey | "">, sheetRow: number): SheetListingView | null {
  const cells = Object.fromEntries(COLUMNS.map((key) => [key, ""])) as Record<ColumnKey, string>;
  keys.forEach((key, column) => {
    if (!key) return;
    const value = (row[column] ?? "").trim();
    if (value) cells[key] = value;
  });

  const address = publicAddress(cells.address, cells.title);
  if (!address) return null;

  const status = normalizeStatus(cells.status) || "active";
  if (!isSheetActiveStatus(status)) return null;

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
  const notes = [cells.description, cells.extraNotes].map((value) => value.trim()).filter(Boolean);
  const description = uniqueNotes(notes).join("\n\n");
  const hoa = cells.hoa.trim() || labeledSpec(description, ["hoa", "hoa fee", "hoa dues"]);
  const ac = cells.ac.trim() || labeledSpec(description, ["a\\/c", "hvac", "air conditioning", "air conditioner"]);
  const roof = cells.roof.trim() || labeledSpec(description, ["roof"]);
  const waterHeater = cells.waterHeater.trim() || labeledSpec(description, ["water heater"]);
  const titleCompany = cells.titleCompany.trim() || labeledSpec(description, ["title company", "escrow"]);
  const listPrice = parseSheetNumber(cells.listPrice);
  const previousPrice = parseSheetNumber(cells.previousPrice);
  const arv = parseSheetNumber(cells.arv);
  const beds = parseBeds(cells.beds) ?? bedsBaths?.beds ?? null;
  const baths = parseBaths(cells.baths) || bedsBaths?.baths || "";
  const sqft = parseSqft(cells.sqft);
  const propertyType = normalizePropertyType(cells.propertyType);
  const flaggedDrop = parseSheetFlag(cells.priceDropFlag) || notesSuggestPriceDrop(description);
  const flaggedUpdated = parseSheetFlag(cells.updatedFlag) || notesSuggestUpdated(description);
  const drop = dropAmount(previousPrice, listPrice);

  return {
    id: listingId(sourceMessageId, address, city, title, sheetRow),
    sourceMessageId,
    addressKey,
    title,
    address,
    city,
    listPrice,
    arv,
    beds,
    baths,
    sqft,
    propertyType,
    description,
    photos,
    coverPhoto: photos[0] ?? "",
    galleries,
    driveFolderUrl,
    status,
    previousPrice,
    drop,
    priceDropped: flaggedDrop || drop != null,
    updated: flaggedUpdated,
    hoa,
    ac,
    roof,
    waterHeater,
    titleCompany,
    specs: listingSpecs({
      listPrice,
      arv,
      beds,
      baths,
      sqft,
      propertyType,
      hoa,
      ac,
      roof,
      waterHeater,
      titleCompany,
    }),
  };
}

export async function getSheetListingById(id: string): Promise<SheetListingView | null> {
  const needle = id.trim();
  if (!needle) return null;
  const listings = await listSheetListings();
  return listings.find((listing) => listing.id === needle || listing.sourceMessageId === needle) ?? null;
}

export function toSheetListingCard(listing: SheetListingView): SheetListingCardView {
  return {
    id: listing.id,
    title: listing.title,
    address: listing.address,
    city: listing.city,
    listPrice: listing.listPrice,
    arv: listing.arv,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    propertyType: listing.propertyType,
    coverPhoto: listing.coverPhoto,
    status: listing.status,
    previousPrice: listing.previousPrice,
    drop: listing.drop,
    priceDropped: listing.priceDropped,
    updated: listing.updated,
  };
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
  if (text === "inactive" || text === "cancelled" || text === "canceled" || text === "expired" || text === "off_market" || text === "withdrawn" || text === "draft") {
    return "inactive";
  }
  return text;
}

function isSheetActiveStatus(status: string) {
  return status === "active";
}

function publicAddress(address: string, title: string) {
  const street = address.replace(/\s+/g, " ").trim();
  if (street.length >= 5 && street.length <= 200) return street;
  const fallback = title.replace(/\s+/g, " ").trim();
  if (fallback.length >= 5 && fallback.length <= 200) return fallback;
  return "";
}

function listingId(sourceMessageId: string, address: string, city: string, title: string, sheetRow: number) {
  const fromEmail = sourceMessageId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  if (fromEmail) return fromEmail;
  const slug = listingSlugBase(
    address,
    city && !address.toLowerCase().includes(city.toLowerCase()) ? city : "",
    title,
  );
  return `${slug}-r${sheetRow}`;
}

function skipReason(row: string[], keys: Array<ColumnKey | "">) {
  const cells = Object.fromEntries(COLUMNS.map((key) => [key, ""])) as Record<ColumnKey, string>;
  keys.forEach((key, column) => {
    if (!key) return;
    const value = (row[column] ?? "").trim();
    if (value) cells[key] = value;
  });
  if (!publicAddress(cells.address, cells.title)) return "missing_address";
  const status = normalizeStatus(cells.status) || "active";
  if (!isSheetActiveStatus(status)) return "not_active";
  return "unmapped";
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

function applyPriceSignals(listings: SheetListingView[]) {
  const lastPriceByAddress = new Map<string, number>();
  return listings.map((listing) => {
    const priorFromHistory = lastPriceByAddress.get(listing.addressKey) ?? null;
    const prior = listing.previousPrice ?? priorFromHistory;
    const drop = listing.drop ?? dropAmount(prior, listing.listPrice);
    const changed = prior != null && listing.listPrice != null && prior !== listing.listPrice;
    const priceDropped = listing.priceDropped || drop != null;
    if (listing.listPrice != null && listing.addressKey) {
      lastPriceByAddress.set(listing.addressKey, listing.listPrice);
    }
    return {
      ...listing,
      previousPrice: priceDropped && prior != null ? prior : listing.previousPrice,
      drop,
      priceDropped,
      updated: listing.updated || (changed && !priceDropped),
    };
  });
}

function uniqueListingIds(listings: SheetListingView[]) {
  const seen = new Map<string, number>();
  return listings.map((listing) => {
    const count = (seen.get(listing.id) ?? 0) + 1;
    seen.set(listing.id, count);
    if (count === 1) return listing;
    return { ...listing, id: `${listing.id}-${count}` };
  });
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

function listingSpecs(input: {
  listPrice: number | null;
  arv: number | null;
  beds: number | null;
  baths: string;
  sqft: number | null;
  propertyType: string;
  hoa: string;
  ac: string;
  roof: string;
  waterHeater: string;
  titleCompany: string;
}): SheetListingSpec[] {
  const typeLabel = propertyTypeLabel(input.propertyType) || input.propertyType.replace(/_/g, " ");
  return [
    input.listPrice != null ? { label: "Asking price", value: formatMoney(input.listPrice) } : null,
    input.arv != null ? { label: "ARV", value: formatMoney(input.arv) } : null,
    input.beds != null ? { label: "Beds", value: String(input.beds) } : null,
    input.baths ? { label: "Baths", value: input.baths } : null,
    input.sqft != null ? { label: "Square feet", value: input.sqft.toLocaleString("en-US") } : null,
    typeLabel ? { label: "Property type", value: typeLabel } : null,
    input.hoa ? { label: "HOA", value: input.hoa } : null,
    input.ac ? { label: "A/C", value: input.ac } : null,
    input.roof ? { label: "Roof", value: input.roof } : null,
    input.waterHeater ? { label: "Water heater", value: input.waterHeater } : null,
    input.titleCompany ? { label: "Title company", value: input.titleCompany } : null,
  ].filter((item): item is SheetListingSpec => item != null);
}

function statusFrom(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  const record = error as { status?: unknown; code?: unknown; response?: { status?: unknown } };
  return record.status ?? record.code ?? record.response?.status;
}
