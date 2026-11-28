"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { excerptFromHtml, plainText, slugify } from "@/lib/blog/content";
import { sanitizePostHtml } from "@/lib/blog/html";
import { BLOG_TAG } from "@/lib/dal/blog";
import { getDb } from "@/src/prisma/db";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Use a full link, or leave it blank.");

const canonical = z
  .string()
  .trim()
  .max(500)
  .refine((value) => {
    if (!value) return true;
    if (value.startsWith("/") && !value.startsWith("//")) return true;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Use a path or a full canonical link.");

const postSchema = z.object({
  id: z.number().int().positive().nullable(),
  title: z.string().trim().min(1).max(180),
  slug: z.string().trim().max(80),
  excerpt: z.string().trim().max(300),
  status: z.enum(["draft", "scheduled", "published"]),
  /** ISO date-time. Required for "scheduled"; optional backdate for "published". */
  publishAt: z.string().trim().max(40).default(""),
  /** Background autosave: only ever writes to a post that is still a draft. */
  autosave: z.boolean().default(false),
  html: z.string().max(100_000),
  featuredImageUrl: optionalUrl,
  featuredImageAlt: z.string().trim().max(180),
  metaTitle: z.string().trim().max(180),
  metaDescription: z.string().trim().max(300),
  canonicalUrl: canonical,
  ogImageUrl: optionalUrl,
  categoryIds: z.array(z.number().int().positive()).max(8),
  tagNames: z.array(z.string().trim().min(1).max(40)).max(12),
});

const categorySchema = z.object({
  id: z.number().int().positive().nullable(),
  name: z.string().trim().min(1).max(80),
  description: z.string().trim().max(300),
  parentId: z.number().int().positive().nullable(),
});

function refreshBlog(paths: string[]) {
  revalidateTag(BLOG_TAG, "max");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
  for (const path of paths) revalidatePath(path);
}

async function uniqueSlug(base: string, ignoreId: number | null) {
  const db = getDb();
  const posts = await db.post.findMany({ select: { id: true, slug: true } });
  const taken = new Set(posts.filter((post) => post.id !== ignoreId).map((post) => post.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 50; n += 1) {
    const next = `${base.slice(0, 76)}-${n}`;
    if (!taken.has(next)) return next;
  }
  return `${base.slice(0, 70)}-${Date.now().toString(36)}`;
}

export async function savePost(input: z.input<typeof postSchema>) {
  const actor = await requireAdmin();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Check the post and try again." };
  }
  const data = parsed.data;
  if (data.autosave && (!data.id || data.status !== "draft")) {
    return { ok: false as const, message: "Autosave only runs on saved drafts." };
  }
  let publishAt: Date | null = null;
  if (data.publishAt) {
    publishAt = new Date(data.publishAt);
    if (Number.isNaN(publishAt.getTime())) return { ok: false as const, message: "Pick a valid publish date and time." };
  }
  if (data.status === "scheduled" && (!publishAt || publishAt.getTime() <= Date.now() + 60_000)) {
    return { ok: false as const, message: "Pick a publish time in the future to schedule this post." };
  }
  if (data.status !== "draft" && !plainText(sanitizePostHtml(data.html))) {
    return { ok: false as const, message: "Write the article before publishing it." };
  }
  const db = getDb();
  const slug = await uniqueSlug(slugify(data.slug || data.title), data.id);
  const body = sanitizePostHtml(data.html);
  const excerpt = data.excerpt || excerptFromHtml(body);
  const nowIso = new Date().toISOString();

  const saved = await db.$transaction(
    async (tx) => {
      const categories = await tx.category.findMany({ select: { id: true } });
      const allowed = new Set(categories.map((category) => category.id));
      const categoryIds = [...new Set(data.categoryIds.filter((id) => allowed.has(id)))];
      let postId = data.id;
      let previousSlug = slug;

      if (postId) {
        const current = await tx.post.findFirst({
          where: { id: postId },
          select: { id: true, slug: true, publishedAt: true, status: true },
        });
        if (!current) return null;
        if (data.autosave && current.status !== "draft") return "not-draft" as const;
        previousSlug = current.slug;
        const publishedAt = resolvePublishedAt(data.status, publishAt, current, nowIso);
        await tx.post.update({
          where: { id: postId },
          data: {
            slug,
            title: data.title,
            excerpt: excerpt || null,
            body,
            status: data.status,
            featuredImageUrl: data.featuredImageUrl || null,
            featuredImageAlt: data.featuredImageAlt || null,
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            canonicalUrl: data.canonicalUrl || null,
            ogImageUrl: data.ogImageUrl || null,
            publishedAt,
          },
        });
        await tx.postCategory.deleteMany({ where: { postId } });
        await tx.postTag.deleteMany({ where: { postId } });
      } else {
        const created = await tx.post.create({
          data: {
            slug,
            title: data.title,
            excerpt: excerpt || null,
            body,
            status: data.status,
            featuredImageUrl: data.featuredImageUrl || null,
            featuredImageAlt: data.featuredImageAlt || null,
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            canonicalUrl: data.canonicalUrl || null,
            ogImageUrl: data.ogImageUrl || null,
            publishedAt: resolvePublishedAt(data.status, publishAt, null, nowIso),
            authorId: actor.id,
          },
        });
        postId = created.id;
      }

      for (const categoryId of categoryIds) {
        await tx.postCategory.create({ data: { postId: postId!, categoryId } });
      }

      const existingTags = await tx.tag.findMany();
      const tagIds: number[] = [];
      const seen = new Set<string>();
      for (const name of data.tagNames) {
        const tagSlug = slugify(name);
        if (seen.has(tagSlug)) continue;
        seen.add(tagSlug);
        const found = existingTags.find((tag) => tag.slug === tagSlug);
        if (found) {
          tagIds.push(found.id);
          continue;
        }
        const created = await tx.tag.create({ data: { slug: tagSlug, name: name.trim() } });
        tagIds.push(created.id);
        existingTags.push(created);
      }
      for (const tagId of tagIds) {
        await tx.postTag.create({ data: { postId: postId!, tagId } });
      }

      const categorySlugs = (await tx.category.findMany({ select: { id: true, slug: true } }))
        .filter((category) => categoryIds.includes(category.id))
        .map((category) => category.slug);
      const tagSlugs = existingTags.filter((tag) => tagIds.includes(tag.id)).map((tag) => tag.slug);
      const stored = await tx.post.findFirst({ where: { id: postId! }, select: { updatedAt: true, publishedAt: true } });
      return {
        id: postId!,
        slug,
        previousSlug,
        categorySlugs,
        tagSlugs,
        updatedAt: stored?.updatedAt.toISOString() ?? nowIso,
        publishedAt: stored?.publishedAt?.toISOString() ?? null,
      };
    },
    { timeout: 30_000 },
  );

  if (!saved) return { ok: false as const, message: "That post is no longer on the desk." };
  if (saved === "not-draft") return { ok: false as const, message: "This post is live, so autosave is paused. Save changes yourself." };
  const result = {
    ok: true as const,
    message: "Post saved.",
    id: saved.id,
    slug: saved.slug,
    status: data.status,
    updatedAt: saved.updatedAt,
    publishedAt: saved.publishedAt,
  };
  // A background autosave of a draft changes nothing public.
  if (data.autosave) return result;
  refreshBlog([
    `/blog/${saved.slug}`,
    `/blog/${saved.previousSlug}`,
    `/admin/blog/${saved.id}`,
    ...saved.categorySlugs.map((item) => `/blog/category/${item}`),
    ...saved.tagSlugs.map((item) => `/blog/tag/${item}`),
  ]);
  return result;
}

/**
 * - draft: keeps any earlier date (so unpublishing and republishing keeps the original date).
 * - scheduled: the future time picked in the editor.
 * - published: a picked past time (backdating), else the original publish date, else now.
 */
function resolvePublishedAt(
  status: "draft" | "scheduled" | "published",
  picked: Date | null,
  current: { status: string; publishedAt: Date | null } | null,
  nowIso: string,
) {
  const now = new Date(nowIso);
  if (status === "scheduled") return picked;
  if (status === "draft") return picked ?? current?.publishedAt ?? null;
  if (picked && picked.getTime() <= now.getTime() + 60_000) return picked;
  if (current?.status === "published" && current.publishedAt) return current.publishedAt;
  return now;
}

export async function deletePost(id: number) {
  await requireAdmin();
  if (!Number.isInteger(id) || id < 1) return { ok: false as const, message: "That post is not on the desk." };
  const db = getDb();
  const current = await db.post.findFirst({ where: { id }, select: { id: true, slug: true } });
  if (!current) return { ok: false as const, message: "That post is not on the desk." };
  await db.$transaction(
    async (tx) => {
      const comments = await tx.comment.findMany({ where: { postId: id }, select: { id: true, parentId: true } });
      const remaining = new Set(comments.map((comment) => comment.id));
      while (remaining.size > 0) {
        const leaves = [...remaining].filter(
          (commentId) => !comments.some((comment) => comment.parentId === commentId && remaining.has(comment.id)),
        );
        if (leaves.length === 0) break;
        for (const commentId of leaves) {
          await tx.comment.delete({ where: { id: commentId } });
          remaining.delete(commentId);
        }
      }
      await tx.postCategory.deleteMany({ where: { postId: id } });
      await tx.postTag.deleteMany({ where: { postId: id } });
      await tx.post.delete({ where: { id } });
    },
    { timeout: 30_000 },
  );
  refreshBlog([`/blog/${current.slug}`]);
  return { ok: true as const, message: "Post removed." };
}

function parentCycle(rows: { id: number; parentId: number | null }[], id: number | null, parentId: number | null) {
  if (!id || !parentId) return false;
  let current: number | null = parentId;
  const seen = new Set<number>();
  while (current) {
    if (current === id || seen.has(current)) return true;
    seen.add(current);
    current = rows.find((row) => row.id === current)?.parentId ?? null;
  }
  return false;
}

export async function saveCategory(input: z.input<typeof categorySchema>) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: parsed.error.issues[0]?.message ?? "Check the category name." };
  }
  const db = getDb();
  const rows = await db.category.findMany({ select: { id: true, slug: true, parentId: true } });
  if (parsed.data.parentId && !rows.some((row) => row.id === parsed.data.parentId)) {
    return { ok: false as const, message: "Choose a parent that already exists." };
  }
  if (parentCycle(rows, parsed.data.id, parsed.data.parentId)) {
    return { ok: false as const, message: "A category cannot sit inside itself." };
  }
  const base = slugify(parsed.data.name);
  const taken = new Set(rows.filter((row) => row.id !== parsed.data.id).map((row) => row.slug));
  let slug = base;
  if (taken.has(slug)) slug = `${base.slice(0, 76)}-2`;
  const payload = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    parentId: parsed.data.parentId,
  };
  if (parsed.data.id) {
    const current = rows.find((row) => row.id === parsed.data.id);
    if (!current) return { ok: false as const, message: "That category is gone." };
    await db.category.update({
      where: { id: parsed.data.id },
      data: { ...payload, slug: current.slug },
    });
  } else {
    await db.category.create({ data: payload });
  }
  refreshBlog(["/admin/blog/categories"]);
  return { ok: true as const, message: "Category saved." };
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  const db = getDb();
  const children = await db.category.findMany({ where: { parentId: id }, select: { id: true } });
  if (children.length > 0) return { ok: false as const, message: "Move the nested categories first." };
  const used = await db.postCategory.findFirst({ where: { categoryId: id }, select: { id: true } });
  if (used) return { ok: false as const, message: "That category is still on a post." };
  const current = await db.category.findFirst({ where: { id }, select: { id: true } });
  if (!current) return { ok: false as const, message: "That category is gone." };
  await db.category.delete({ where: { id } });
  refreshBlog(["/admin/blog/categories"]);
  return { ok: true as const, message: "Category removed." };
}

export async function deleteTag(id: number) {
  await requireAdmin();
  const db = getDb();
  const current = await db.tag.findFirst({ where: { id }, select: { id: true, slug: true } });
  if (!current) return { ok: false as const, message: "That tag is gone." };
  await db.postTag.deleteMany({ where: { tagId: id } });
  await db.tag.delete({ where: { id } });
  refreshBlog(["/admin/blog/categories", `/blog/tag/${current.slug}`]);
  return { ok: true as const, message: "Tag removed." };
}

async function commentPaths(commentId: number) {
  const db = getDb();
  const comment = await db.comment.findFirst({ where: { id: commentId }, select: { id: true, postId: true } });
  if (!comment) return null;
  const post = await db.post.findFirst({ where: { id: comment.postId }, select: { id: true, slug: true } });
  return post ? `/blog/${post.slug}` : null;
}

export async function setCommentStatus(id: number, status: "pending" | "approved" | "flagged") {
  await requireAdmin();
  const path = await commentPaths(id);
  if (!path) return { ok: false as const, message: "That comment is gone." };
  const db = getDb();
  await db.comment.update({ where: { id }, data: { status } });
  refreshBlog([path, "/admin/blog/comments"]);
  return { ok: true as const, message: status === "approved" ? "Comment is on the post." : "Comment updated." };
}

export async function deleteComment(id: number) {
  await requireAdmin();
  const path = await commentPaths(id);
  if (!path) return { ok: false as const, message: "That comment is gone." };
  const db = getDb();
  const rows = await db.comment.findMany({ select: { id: true, parentId: true } });
  const drop = new Set<number>();
  function collect(current: number) {
    drop.add(current);
    for (const row of rows) {
      if (row.parentId === current) collect(row.id);
    }
  }
  collect(id);
  const ordered = [...drop].sort((a, b) => {
    const aChild = rows.some((row) => row.parentId === a && drop.has(row.id));
    const bChild = rows.some((row) => row.parentId === b && drop.has(row.id));
    return Number(aChild) - Number(bChild);
  });
  for (const commentId of ordered) {
    await db.comment.delete({ where: { id: commentId } });
  }
  refreshBlog([path, "/admin/blog/comments"]);
  return { ok: true as const, message: "Comment removed." };
}

const replySchema = z.object({
  commentId: z.number().int().positive(),
  body: z.string().trim().min(1).max(2000),
});

export async function replyToComment(input: z.input<typeof replySchema>) {
  const actor = await requireAdmin();
  const parsed = replySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, message: "Write a reply first." };
  const db = getDb();
  const parent = await db.comment.findFirst({ where: { id: parsed.data.commentId }, select: { id: true, postId: true } });
  if (!parent) return { ok: false as const, message: "That comment is gone." };
  const post = await db.post.findFirst({ where: { id: parent.postId }, select: { slug: true } });
  await db.comment.create({
    data: {
      postId: parent.postId,
      parentId: parent.id,
      authorId: actor.id,
      authorName: actor.name,
      body: parsed.data.body,
      status: "approved",
      isStaff: true,
    },
  });
  if (post) refreshBlog([`/blog/${post.slug}`, "/admin/blog/comments"]);
  return { ok: true as const, message: "Reply published." };
}
