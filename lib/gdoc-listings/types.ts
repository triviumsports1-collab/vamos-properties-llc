export const SHEET_LISTINGS_TAG = "sheet-listings";

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
  listingCode: string;
  sourceMessageId: string;
  addressKey: string;
  title: string;
  address: string;
  city: string;
  listPrice: number | null;
  displayPrice: number | null;
  marginAmount: number | null;
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
  listedAt: string;
  sheetUpdatedAt: string;
  priceHistory: string;
  updateNotes: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  localTargetArea: string;
  canonicalUrl: string;
  schemaJsonLd: string;
  latitude: number | null;
  longitude: number | null;
  specs: SheetListingSpec[];
};

export type SheetListingCardView = {
  id: string;
  title: string;
  address: string;
  city: string;
  listPrice: number | null;
  displayPrice: number | null;
  marginAmount: number | null;
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

export type SheetListingDraft = {
  sheetKey: string;
  slugBase: string;
  sheetSlug: string;
  listingCode: string;
  title: string;
  address: string;
  addressKey: string;
  city: string;
  listPrice: number | null;
  previousPrice: number | null;
  arv: number | null;
  beds: number | null;
  baths: string;
  sqft: number | null;
  propertyType: string;
  status: string;
  description: string;
  photos: string[];
  galleries: SheetGalleryGroup[];
  coverPhoto: string;
  driveFolderUrl: string;
  hoa: string;
  ac: string;
  roof: string;
  waterHeater: string;
  titleCompany: string;
  sourceMessageId: string;
  listedAt: string;
  sheetUpdatedAt: string;
  priceHistory: string;
  updateNotes: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  localTargetArea: string;
  canonicalUrl: string;
  schemaJsonLd: string;
  latitude: number | null;
  longitude: number | null;
  sheetSyncStatus: string;
  sheetSyncedAt: string;
  sheetRow: number;
  flaggedDrop: boolean;
  flaggedUpdated: boolean;
};

export type SheetParseResult = {
  drafts: SheetListingDraft[];
  skipped: Record<string, number>;
  rows: number;
};

export type SheetListingAdminSummary = {
  total: number;
  active: number;
  inactive: number;
  sold: number;
  underContract: number;
  hidden: number;
  withMargin: number;
  customMargins: number;
  lastSyncedAt: string | null;
  sheetsReady: boolean;
};

export type SheetListingAdminRow = {
  id: string;
  listingCode: string;
  title: string;
  address: string;
  city: string;
  region: string;
  listPrice: number | null;
  marginAmount: number | null;
  marginPercentBps: number | null;
  marginOverride: boolean;
  finalDisplayPrice: number | null;
  previousPrice: number | null;
  status: string;
  removed: boolean;
  held: boolean;
  syncedAt: string;
  priceDropped: boolean;
  updated: boolean;
};

export type SheetListingAdminPlaces = {
  cities: string[];
  regions: string[];
};

export type SheetListingMarginEventView = {
  slug: string;
  listingCode: string;
  actorEmail: string;
  action: string;
  mode: string;
  previousAmount: number | null;
  nextAmount: number | null;
  previousPercentBps: number | null;
  nextPercentBps: number | null;
  listPrice: number | null;
  previousDisplay: number | null;
  nextDisplay: number | null;
  createdAt: string;
};

export type SheetMarginFormState = {
  ok: boolean;
  message: string;
  stamp: number;
  updated: number;
  skipped: number;
};

export const idleSheetMargin: SheetMarginFormState = { ok: false, message: "", stamp: 0, updated: 0, skipped: 0 };

export type SheetPricingFormState = {
  ok: boolean;
  message: string;
  stamp: number;
  updated: number;
  skipped: number;
  held: number;
};

export const idleSheetPricing: SheetPricingFormState = {
  ok: false,
  message: "",
  stamp: 0,
  updated: 0,
  skipped: 0,
  held: 0,
};

export type SheetPricingTierView = {
  minPrice: number | null;
  maxPrice: number | null;
  mode: "flat" | "percent";
  flatAmount: number | null;
  percentBps: number | null;
  matchCount: number;
};

export type SheetPricingRuleView = {
  enabled: boolean;
  mode: "flat" | "percent";
  flatAmount: number | null;
  percentBps: number | null;
  tiers: SheetPricingTierView[];
  unmatchedCount: number;
  noPriceCount: number;
  updatedAt: string | null;
  updatedByEmail: string;
  eligibleCount: number;
  customCount: number;
};

export type SheetPricingRuleEventView = {
  actorEmail: string;
  action: string;
  nextEnabled: boolean;
  nextMode: string;
  nextFlatAmount: number | null;
  nextPercentBps: number | null;
  updatedCount: number;
  skippedCount: number;
  heldCount: number;
  createdAt: string;
};

export type SheetMarginAuditDraft = {
  slug: string;
  listingCode: string;
  action: string;
  mode: string;
  previousAmount: number | null;
  nextAmount: number | null;
  previousPercentBps: number | null;
  nextPercentBps: number | null;
  listPrice: number | null;
  previousDisplay: number | null;
  nextDisplay: number | null;
  reason: string;
};

export type SheetListingAdminDetail = SheetListingAdminRow & {
  arv: number | null;
  beds: number | null;
  baths: string;
  sqft: number | null;
  propertyType: string;
  description: string;
  hoa: string;
  ac: string;
  roof: string;
  waterHeater: string;
  titleCompany: string;
  listedAt: string;
  sheetUpdatedAt: string;
  priceHistory: string;
  updateNotes: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  localTargetArea: string;
  canonicalUrl: string;
  schemaJsonLd: string;
  latitude: number | null;
  longitude: number | null;
  sheetSyncStatus: string;
  removedAt: string | null;
};

export type SheetListingAdminFilters = {
  view: "all" | "active" | "inactive" | "under_contract" | "sold";
  query: string;
  minPrice: number | null;
  maxPrice: number | null;
  city: string;
  region: string;
  margin: "all" | "with" | "without";
};

export type SheetSyncFormState = {
  ok: boolean;
  message: string;
  stamp: number;
};

export const idleSheetSync: SheetSyncFormState = { ok: false, message: "", stamp: 0 };

export type SheetSyncTrigger = "admin" | "webhook";

export type SheetSyncEventDraft = {
  listingCode: string;
  sheetKey: string;
  slug: string;
  action: "created" | "updated" | "held" | "inactivated";
  reason: string;
};

export type SheetSyncRunView = {
  errorId: string;
  trigger: string;
  status: string;
  startedAt: string;
  finishedAt: string | null;
  rows: number;
  uniqueCount: number;
  createdCount: number;
  updatedCount: number;
  unchangedCount: number;
  heldCount: number;
  inactivatedCount: number;
  skipped: Record<string, number>;
  error: string;
  events: SheetSyncEventView[];
};

export type SheetSyncEventView = {
  listingCode: string;
  slug: string;
  action: string;
  reason: string;
  createdAt: string;
};
