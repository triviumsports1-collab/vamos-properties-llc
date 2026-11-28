import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/marketing/post-body";
import { formatBlogDate, readingMinutes } from "@/lib/blog/content";
import { getAdminPost } from "@/lib/dal/blog";

export const metadata: Metadata = { title: "Preview post", robots: { index: false, follow: false } };

type PreviewParams = { params: Promise<{ id: string }> };

const statusLabel = { draft: "Draft", scheduled: "Scheduled", published: "Published" } as const;

export default function PreviewPostPage({ params }: PreviewParams) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading the preview…</p>}>
      <Preview params={params} />
    </Suspense>
  );
}

/** Renders the last saved version of a post the way /blog/[slug] shows it. Admin only. */
async function Preview({ params }: PreviewParams) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();
  const post = await getAdminPost(postId);
  if (!post) notFound();

  return (
    <>
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-amber px-4 py-3 text-amber-ink">
        <p className="text-sm font-semibold">
          Preview · {statusLabel[post.status]}
          {post.status === "scheduled" && post.publishedAt ? ` for ${formatBlogDate(post.publishedAt)}` : ""} · last saved version
        </p>
        <Link href={`/admin/blog/${post.id}`} className="inline-flex min-h-11 items-center text-sm font-semibold underline">
          Back to the editor
        </Link>
      </div>
      <main className="mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
        <p className="text-sm text-muted">Blog / {post.title}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-muted">
          Vamos Properties
          {post.publishedAt ? ` · ${formatBlogDate(post.publishedAt)}` : ""}
          {` · ${readingMinutes(post.html)} min read`}
        </p>
        {post.featuredImageUrl ? (
          <img src={post.featuredImageUrl} alt={post.featuredImageAlt || ""} className="mt-8 w-full max-w-3xl border border-line" />
        ) : null}
        <PostBody html={post.html} />
        {post.tagNames.length > 0 ? (
          <ul className="mt-8 flex flex-wrap gap-2">
            {post.tagNames.map((tag) => (
              <li key={tag} className="inline-flex min-h-11 items-center border border-line px-3 text-sm text-ink">
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </main>
    </>
  );
}
