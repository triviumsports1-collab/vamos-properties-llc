export const leadStatuses = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "under_contract", label: "Under contract" },
  { value: "closed", label: "Closed" },
  { value: "lost", label: "Lost" },
] as const;

export const lostReasons = [
  { value: "price", label: "Price" },
  { value: "timing", label: "Timing" },
  { value: "already_listed", label: "Already listed" },
  { value: "not_a_fit", label: "Not a fit" },
  { value: "no_response", label: "No response" },
] as const;

export type LeadStatus = (typeof leadStatuses)[number]["value"];
export type LostReason = (typeof lostReasons)[number]["value"];

const statusLabels = new Map(leadStatuses.map((item) => [item.value, item.label]));
const reasonLabels = new Map(lostReasons.map((item) => [item.value, item.label]));

export function canonicalStatus(value: string): LeadStatus {
  if (value === "new" || value === "closed" || value === "lost" || value === "contacted") return value;
  if (value === "contract" || value === "under_contract") return "under_contract";
  if (value === "no_answer" || value === "talking" || value === "visited" || value === "offer_sent") {
    return "contacted";
  }
  return "new";
}

export function statusLabel(value: string) {
  return statusLabels.get(canonicalStatus(value)) ?? value;
}

export function lostReasonLabel(value: string | null) {
  if (!value) return "";
  return reasonLabels.get(value as LostReason) ?? value;
}

export function isLeadStatus(value: string): value is LeadStatus {
  return statusLabels.has(value as LeadStatus);
}

export function isLostReason(value: string): value is LostReason {
  return reasonLabels.has(value as LostReason);
}
