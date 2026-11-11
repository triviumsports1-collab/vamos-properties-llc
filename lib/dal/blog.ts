import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/src/prisma/db";
import { requireAdmin } from "@/lib/admin/auth";
import { editorHtml, excerptFromHtml } from "@/lib/blog/content";
import { sanitizePostHtml } from "@/lib/blog/html";

export const BLOG_TAG = "blog";

export type TermRef = { id: number; slug: string; name: string };

export type PublicComment = {
  id: number;
  parentId: number | null;
  authorName: string;
  body: string;
  createdAt: string;
  isStaff: boolean;
};

export type PostCard = {
  slug: string;
  title: string;
  excerpt: string;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  publishedAt: string | null;
  updatedAt: string;
  categories: TermRef[];
  tags: TermRef[];
};

export type PublicPost = PostCard & {
  html: string;
  authorName: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string | null;
  ogImageUrl: string | null;
  comments: PublicComment[];
};

export type AdminPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  html: string;
  status: "draft" | "published";
  featuredImageUrl: string;
  featuredImageAlt: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  ogImageUrl: string;
  categoryIds: number[];
  tagNames: string[];
  publishedAt: string | null;
  updatedAt: string;
};

export type CategoryView = {
  id: number;
  slug: string;
  name: string;
  description: string;
  parentId: number | null;
};

export type TagView = { id: number; slug: string; name: string };

export type AdminComment = {
  id: number;
  postId: number;
  postTitle: string;
  postSlug: string;
  parentId: number | null;
  authorName: string;
  authorEmail: string;
  body: string;
  status: string;
  isStaff: boolean;
  createdAt: string;
};

const termSelect = { id: true, slug: true, name: true } as const;

const publishedCardSelect = {
  slug: true,
  title: true,
  excerpt: true,
  body: true,
  featuredImageUrl: true,
  featuredImageAlt: true,
  publishedAt: true,
  updatedAt: true,
  categories: { select: { category: { select: termSelect } } },
  tags: { select: { tag: { select: termSelect } } },
} as const;

type PublishedCardRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  featuredImageUrl: string | null;
  featuredImageAlt: string | null;
  publishedAt: Date | string | null;
  updatedAt: Date | string;
  categories: { category: TermRef }[];
  tags: { tag: TermRef }[];
};

function toIso(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  return d instanceof Date ? d.toISOString() : d;
}

function card(post: PublishedCardRow): PostCard {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt?.trim() || excerptFromHtml(editorHtml(post.body)),
    featuredImageUrl: post.featuredImageUrl,
    featuredImageAlt: post.featuredImageAlt,
    publishedAt: toIso(post.publishedAt),
    updatedAt: toIso(post.updatedAt) ?? "",
    categories: post.categories.map((link) => link.category),
    tags: post.tags.map((link) => link.tag),
  };
}

function byPublishedAt(left: PostCard, right: PostCard) {
  return (right.publishedAt ?? "").localeCompare(left.publishedAt ?? "");
}

export async function listPublishedPosts() {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const rows = await getDb().post.findMany({
    where: { status: "published" },
    select: publishedCardSelect,
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 60,
  });
  return rows.map(card).sort(byPublishedAt);
}

export async function getPublicPost(slug: string): Promise<PublicPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const post = await getDb().post.findFirst({
    where: { slug, status: "published" },
    select: {
      ...publishedCardSelect,
      metaTitle: true,
      metaDescription: true,
      canonicalUrl: true,
      ogImageUrl: true,
      author: { select: { name: true } },
      comments: {
        where: { status: "approved" },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          parentId: true,
          authorName: true,
          body: true,
          createdAt: true,
          isStaff: true,
        },
      },
    },
  });
  if (!post) return null;
  const summary = card(post);
  return {
    ...summary,
    html: sanitizePostHtml(post.body),
    authorName: post.author?.name ?? "Vamos Properties",
    metaTitle: post.metaTitle?.trim() || post.title,
    metaDescription: post.metaDescription?.trim() || summary.excerpt,
    canonicalUrl: post.canonicalUrl,
    ogImageUrl: post.ogImageUrl || post.featuredImageUrl,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      parentId: comment.parentId,
      authorName: comment.authorName,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      isStaff: comment.isStaff,
    })),
  };
}

export async function getCategoryArchive(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const db = getDb();
  const category = await db.category.findFirst({
    where: { slug },
    select: { id: true, slug: true, name: true, description: true },
  });
  if (!category) return null;
  const [children, rows] = await Promise.all([
    db.category.findMany({
      where: { parentId: category.id },
      select: { slug: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.post.findMany({
      where: { status: "published", categories: { some: { categoryId: category.id } } },
      select: publishedCardSelect,
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 60,
    }),
  ]);
  return {
    slug: category.slug,
    name: category.name,
    description: category.description ?? "",
    children,
    posts: rows.map(card).sort(byPublishedAt),
  };
}

export async function getTagArchive(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const db = getDb();
  const tag = await db.tag.findFirst({
    where: { slug },
    select: { id: true, slug: true, name: true },
  });
  if (!tag) return null;
  const rows = await db.post.findMany({
    where: { status: "published", tags: { some: { tagId: tag.id } } },
    select: publishedCardSelect,
    orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
    take: 60,
  });
  return { slug: tag.slug, name: tag.name, posts: rows.map(card).sort(byPublishedAt) };
}

export async function blogSitemapEntries() {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const posts = await getDb().post.findMany({
    where: { status: "published" },
    select: {
      slug: true,
      updatedAt: true,
      categories: { select: { category: { select: { slug: true } } } },
      tags: { select: { tag: { select: { slug: true } } } },
    },
    orderBy: { updatedAt: "desc" },
    take: 60,
  });
  const categories = new Map<string, string>();
  const tags = new Map<string, string>();
  for (const post of posts) {
    const updatedAt = post.updatedAt.toISOString();
    for (const link of post.categories) {
      const current = categories.get(link.category.slug);
      if (!current || current < updatedAt) categories.set(link.category.slug, updatedAt);
    }
    for (const link of post.tags) {
      const current = tags.get(link.tag.slug);
      if (!current || current < updatedAt) tags.set(link.tag.slug, updatedAt);
    }
  }
  return {
    posts: posts.map((post) => ({ path: `/blog/${post.slug}`, updatedAt: post.updatedAt.toISOString() })),
    categories: [...categories.entries()].map(([slug, updatedAt]) => ({ path: `/blog/category/${slug}`, updatedAt })),
    tags: [...tags.entries()].map(([slug, updatedAt]) => ({ path: `/blog/tag/${slug}`, updatedAt })),
  };
}

export async function listAdminPosts() {
  await requireAdmin();
  const rows = await getDb().post.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      updatedAt: true,
      categories: { select: { category: { select: { name: true } } } },
    },
  });
  return rows.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title,
    status: post.status === "published" ? "published" : "draft",
    updatedAt: toIso(post.updatedAt) ?? "",
    categories: post.categories.map((link) => link.category.name),
  }));
}

export async function getAdminPost(id: number): Promise<AdminPost | null> {
  await requireAdmin();
  const post = await getDb().post.findFirst({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      status: true,
      featuredImageUrl: true,
      featuredImageAlt: true,
      metaTitle: true,
      metaDescription: true,
      canonicalUrl: true,
      ogImageUrl: true,
      publishedAt: true,
      updatedAt: true,
      categories: { select: { categoryId: true } },
      tags: { select: { tag: { select: { name: true } } } },
    },
  });
  if (!post) return null;
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt ?? "",
    html: sanitizePostHtml(post.body),
    status: post.status === "published" ? "published" : "draft",
    featuredImageUrl: post.featuredImageUrl ?? "",
    featuredImageAlt: post.featuredImageAlt ?? "",
    metaTitle: post.metaTitle ?? "",
    metaDescription: post.metaDescription ?? "",
    canonicalUrl: post.canonicalUrl ?? "",
    ogImageUrl: post.ogImageUrl ?? "",
    categoryIds: post.categories.map((link) => link.categoryId),
    tagNames: post.tags.map((link) => link.tag.name),
    publishedAt: toIso(post.publishedAt),
    updatedAt: toIso(post.updatedAt) ?? "",
  };
}

export async function listCategories() {
  await requireAdmin();
  const db = getDb();
  const rows = await db.category.findMany({ orderBy: { name: "asc" } });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    parentId: row.parentId,
  })) satisfies CategoryView[];
}

export async function listTags() {
  await requireAdmin();
  const db = getDb();
  const rows = await db.tag.findMany({ orderBy: { name: "asc" } });
  return rows.map((row) => ({ id: row.id, slug: row.slug, name: row.name })) satisfies TagView[];
}

export async function listAdminComments(status: string) {
  await requireAdmin();
  const db = getDb();
  const [comments, posts] = await Promise.all([
    db.comment.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    db.post.findMany({ select: { id: true, title: true, slug: true } }),
  ]);
  const postById = new Map(posts.map((post) => [post.id, post]));
  return comments.map((comment) => {
    const post = postById.get(comment.postId);
    return {
      id: comment.id,
      postId: comment.postId,
      postTitle: post?.title ?? "Removed post",
      postSlug: post?.slug ?? "",
      parentId: comment.parentId,
      authorName: comment.authorName,
      authorEmail: comment.authorEmail ?? "",
      body: comment.body,
      status: comment.status,
      isStaff: comment.isStaff,
      createdAt: comment.createdAt.toISOString(),
    } satisfies AdminComment;
  });
}
