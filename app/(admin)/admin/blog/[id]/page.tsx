import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlogDeskNav } from "@/components/admin/blog-nav";
import { PostEditor } from "@/components/admin/post-editor";
import { getAdminPost, listCategories, listTags } from "@/lib/dal/blog";
import { listMedia } from "@/lib/dal/media";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Edit post" };

type EditParams = { params: Promise<{ id: string }> };

export default function EditPostPage({ params }: EditParams) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading the post…</p>}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: EditParams) {
  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId)) notFound();
  const [post, categories, tags, media] = await Promise.all([
    getAdminPost(postId),
    listCategories(),
    listTags(),
    listMedia({ q: "", kind: "", folder: "" }),
  ]);
  if (!post) notFound();

  return (
    <AdminShell current="/admin/blog">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-sm text-muted">
          <Link href="/admin/blog" className="font-semibold text-link">← All posts</Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Edit post</h1>
        <BlogDeskNav current="posts" />
        {/* key: remount with fresh server data after a save refreshes the route */}
        <PostEditor
          key={`${post.id}:${post.updatedAt}`}
          post={post}
          categories={categories}
          tagSuggestions={tags.map((tag) => tag.name)}
          siteHost={new URL(site.url).host}
          media={media.map((item) => ({ id: item.id, url: item.url, fileName: item.fileName, kind: item.kind, alt: item.alt }))}
        />
      </main>
    </AdminShell>
  );
}
