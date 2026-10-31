import "server-only";

/**
 * Runtime URL for Prisma Client (pooled).
 * CLI / `prisma db push` uses DIRECT_URL via schema.prisma.
 * Never log the returned string.
 */

const POOL_DEFAULTS: Record<string, string> = {
  connection_limit: "1",
  pool_timeout: "10",
  connect_timeout: "15",
};

function hasParam(url: string, key: string) {
  return new RegExp(`[?&]${key}=`, "i").test(url);
}

function appendParams(url: string, params: string[]) {
  if (params.length === 0) return url;
  return url + (url.includes("?") ? "&" : "?") + params.join("&");
}

function firstSet(...values: (string | undefined)[]) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
}

/** Prisma Postgres: app traffic must use pooled.db.prisma.io, not db.prisma.io. */
function preferPrismaPooler(url: string) {
  return url.replace(/@db\.prisma\.io\b/i, "@pooled.db.prisma.io");
}

export function runtimeDatabaseUrl() {
  const url = firstSet(process.env.DATABASE_URL_POOLED, process.env.DATABASE_URL);
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) {
    throw new Error("DATABASE_URL must be a postgres:// connection string.");
  }

  const pooled = preferPrismaPooler(url);
  const params: string[] = [];
  for (const [key, value] of Object.entries(POOL_DEFAULTS)) {
    if (!hasParam(pooled, key)) params.push(`${key}=${value}`);
  }

  return appendParams(pooled, params);
}
