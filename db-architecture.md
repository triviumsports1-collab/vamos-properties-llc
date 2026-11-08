# Vamos Properties LLC — database architecture

PostgreSQL via Prisma 5 (`@prisma/client`). The schema lives in `prisma/schema.prisma`. `src/prisma/db.ts` opens one lazy client with `getDb()`.

Pages and actions never import a live client at module scope. Writes go through `lib/dal`. Callers get `{ id }` or DTOs, never a Prisma row.

## Connection

| Variable | Use |
| --- | --- |
| `DATABASE_URL` | Pooled Prisma Postgres URL (`pooled.db.prisma.io`) for the Next.js runtime |
| `DATABASE_URL_POOLED` | Optional override for the runtime URL |
| `DIRECT_URL` | Direct Prisma Postgres URL (`db.prisma.io`) for `prisma db push` / migrate |

`getDb()` always talks to the pooler. If `DATABASE_URL` still points at `db.prisma.io`, the host is rewritten to `pooled.db.prisma.io` before Prisma opens a socket. `connection_limit=1` is added when missing so each Vercel isolate uses one client connection. Do not log the URL, the phone number, or the consent body.

Apply schema:

```bash
npx prisma generate
npx prisma db push
```

## What is in the schema now

User, Lead, Consent, LeadEvent, Listing, ListingPrice, SheetListing, MediaAsset, Post, Category, Tag, PostCategory, PostTag, Comment.

`SheetListing` is the Google Sheet catalog mirror. It is not related to `Listing`. Public `/sheet-listings` reads this table. Sync upserts on `listingCode` (`listing_id`, like VP-AZ-PHX-000001) when present, otherwise `sheetKey` (normalized address), and soft-inactivates rows that leave the sheet. SEO, local targeting, and coordinates come from sheet columns R–AC. Admins trigger a copy from `/admin` or `/admin/sheet-listings`. Cron and scripts use `POST /api/sheet-listings/sync` with `SHEET_SYNC_SECRET`. We do not write `sync_status` back to the sheet (read-only Google access).

Prisma `String` maps to Postgres `text`. Long copy (post body, listing description, consent text, comments) is `@db.Text`. There is no MySQL `LONGTEXT` or `VARCHAR(191)` in this schema.

A new lead write is one transaction: lead + consent rows + the `created` event. Status changes append a `LeadEvent` and update `Lead.status` together.

Email-created listings set `source = "email"`, store `arv` and `driveFolderUrl` when present, and skip insert when `addressKey` or `sourceMessageId` already exists. Manual admin saves keep `source = "manual"`. The webhook is `POST /api/webhooks/listing-email`.
