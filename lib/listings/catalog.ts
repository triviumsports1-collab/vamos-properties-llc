export const propertyTypes = [
  { value: "house", label: "House" },
  { value: "townhouse", label: "Townhouse" },
  { value: "condo", label: "Condo" },
  { value: "manufactured", label: "Manufactured" },
  { value: "land", label: "Land" },
] as const;

export type PropertyType = (typeof propertyTypes)[number]["value"];

export function propertyTypeLabel(value: string | null) {
  if (!value) return "";
  return propertyTypes.find((item) => item.value === value)?.label ?? value;
}

export function isPropertyType(value: string): value is PropertyType {
  return propertyTypes.some((item) => item.value === value);
}
