import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";
import { BLOG_TAG } from "@/lib/dal/blog";
import { getDb } from "@/src/prisma/db";

/**
 * Flips scheduled posts whose publish time has passed to "published" and refreshes the
 * public blog. Called from the cron tick (every 15 minutes), so a scheduled post goes live
 * within one tick of its time. Safe to call repeatedly.
 */
export async function publishDueScheduledPosts(now = new Date()) {
  const db = getDb();
  const due = await db.post.findMany({
    where: { status: "scheduled", publishedAt: { lte: now } },
    select: {
      id: true,
      slug: true,
      categories: { select: { category: { select: { slug: true } } } },
      tags: { select: { tag: { select: { slug: true } } } },
    },
  });
  if (due.length === 0) return { published: 0 };

  const updated = await db.post.updateMany({
    where: { id: { in: due.map((post) => post.id) }, status: "scheduled" },
    data: { status: "published" },
  });

  revalidateTag(BLOG_TAG, "max");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const post of due) {
    revalidatePath(`/blog/${post.slug}`);
    for (const link of post.categories) revalidatePath(`/blog/category/${link.category.slug}`);
    for (const link of post.tags) revalidatePath(`/blog/tag/${link.tag.slug}`);
  }
  return { published: updated.count };
}
