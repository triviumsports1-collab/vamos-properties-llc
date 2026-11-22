/**
 * One-time (idempotent) rollout for listing expiry: gives every Active sheet home that has no
 * active window yet a fresh window starting now, so nothing disappears at launch.
 *
 *   node scripts/backfill-listing-windows.cjs           # dry run: prints what would change
 *   node scripts/backfill-listing-windows.cjs --apply   # writes activatedAt/expiresAt + audit events
 */
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");

const DAY_MS = 24 * 60 * 60 * 1000;

async function main() {
  const apply = process.argv.includes("--apply");
  const db = new PrismaClient();
  try {
    const setting = await db.listingLifecycleSetting.findUnique({ where: { id: 1 } });
    const days = Math.min(365, Math.max(1, setting?.expiryDays ?? 14));
    const rows = await db.sheetListing.findMany({
      where: { status: "active", removedAt: null, activatedAt: null },
      select: { id: true, slug: true },
    });
    const now = new Date();
    const expiresAt = new Date(now.getTime() + days * DAY_MS);
    console.log(`${rows.length} active homes without a window; window = ${days} days (until ${expiresAt.toISOString()}).`);
    if (!apply) {
      console.log("Dry run. Re-run with --apply to write.");
      return;
    }
    for (const row of rows) {
      await db.$transaction([
        db.sheetListing.update({ where: { id: row.id }, data: { activatedAt: now, expiresAt } }),
        db.sheetListingStatusEvent.create({
          data: { listingId: row.id, slug: row.slug, action: "window_started", reason: "backfill_now", actorEmail: "rollout", expiresAt },
        }),
      ]);
    }
    console.log(`Started ${rows.length} windows.`);
  } finally {
    await db.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
