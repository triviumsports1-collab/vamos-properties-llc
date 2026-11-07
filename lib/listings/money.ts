export function formatMoney(dollars: number | null | undefined) {
  if (dollars == null) return "";
  const sign = dollars < 0 ? "-" : "";
  const digits = Math.abs(dollars).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sign}$${grouped}`;
}

export function parseDollars(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\$?\d{1,3}(,\d{3})*$|^\$?\d+$/.test(trimmed)) return null;
  const amount = Number(trimmed.replace(/[$,]/g, ""));
  if (!Number.isInteger(amount) || amount < 1 || amount > 100_000_000) return null;
  return amount;
}

export function dropAmount(previous: number | null, current: number | null) {
  if (previous == null || current == null || previous <= current) return null;
  return previous - current;
}

export function parseFlexiblePrice(value: string | number | null | undefined) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value < 1 || value > 100_000_000) return null;
    return Math.round(value);
  }
  if (!value) return null;
  const compact = value.trim().toLowerCase().replace(/[,$\s]/g, "");
  if (!compact) return null;
  const thousand = /^(\d+(?:\.\d+)?)k$/.exec(compact);
  if (thousand) {
    const amount = Math.round(Number(thousand[1]) * 1000);
    return amount >= 1 && amount <= 100_000_000 ? amount : null;
  }
  const million = /^(\d+(?:\.\d+)?)m$/.exec(compact);
  if (million) {
    const amount = Math.round(Number(million[1]) * 1_000_000);
    return amount >= 1 && amount <= 100_000_000 ? amount : null;
  }
  const exact = parseDollars(value.trim());
  if (exact != null) return exact;
  if (!/^\d+(\.\d+)?$/.test(compact)) return null;
  const amount = Math.round(Number(compact));
  if (!Number.isFinite(amount) || amount < 1 || amount > 100_000_000) return null;
  return amount;
}
