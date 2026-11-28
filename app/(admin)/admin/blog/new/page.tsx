import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlogDeskNav } from "@/components/admin/blog-nav";
import { PostEditor } from "@/components/admin/post-editor";
import { listCategories, listTags } from "@/lib/dal/blog";
import { listMedia } from "@/lib/dal/media";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading the editor…</p>}>
      <Editor />
    </Suspense>
  );
}

async function Editor() {
  const [categories, tags, media] = await Promise.all([listCategories(), listTags(), listMedia({ q: "", kind: "", folder: "" })]);
  return (
    <AdminShell current="/admin/blog">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-sm text-muted">
          <Link href="/admin/blog" className="font-semibold text-link">← All posts</Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">New post</h1>
        <BlogDeskNav current="posts" />
        <PostEditor
          post={null}
          categories={categories}
          tagSuggestions={tags.map((tag) => tag.name)}
          siteHost={new URL(site.url).host}
          media={media.map((item) => ({ id: item.id, url: item.url, fileName: item.fileName, kind: item.kind, alt: item.alt }))}
        />
      </main>
    </AdminShell>
  );
}
