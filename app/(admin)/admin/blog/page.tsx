import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { BlogDeskNav } from "@/components/admin/blog-nav";
import { formatBlogDate } from "@/lib/blog/content";
import { listAdminPosts, type PostStatus } from "@/lib/dal/blog";

export const metadata: Metadata = { title: "Blog" };

type ListProps = { searchParams: Promise<{ status?: string; q?: string }> };

const filters: Array<{ value: "" | PostStatus; label: string }> = [
  { value: "", label: "All" },
  { value: "draft", label: "Drafts" },
  { value: "scheduled", label: "Scheduled" },
  { value: "published", label: "Published" },
];

const badge: Record<PostStatus, string> = {
  draft: "bg-mist text-ink",
  scheduled: "bg-amber text-amber-ink",
  published: "bg-navy text-white",
};

const label: Record<PostStatus, string> = { draft: "Draft", scheduled: "Scheduled", published: "Published" };

export default function AdminBlogPage(props: ListProps) {
  return (
    <Suspense fallback={<p className="px-4 py-16 text-base text-muted">Loading posts…</p>}>
      <Posts {...props} />
    </Suspense>
  );
}

function arizonaTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

async function Posts({ searchParams }: ListProps) {
  const { status = "", q = "" } = await searchParams;
  const posts = await listAdminPosts();
  const query = q.trim().toLowerCase();
  const shown = posts.filter(
    (post) => (!status || post.status === status) && (!query || post.title.toLowerCase().includes(query) || post.slug.includes(query)),
  );
  const count = (value: "" | PostStatus) => (value ? posts.filter((post) => post.status === value).length : posts.length);
  const href = (value: string) => {
    const params = new URLSearchParams();
    if (value) params.set("status", value);
    if (q) params.set("q", q);
    const text = params.toString();
    return text ? `/admin/blog?${text}` : "/admin/blog";
  };

  return (
    <AdminShell current="/admin/blog">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-ink">Blog</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
              Drafts and scheduled posts stay off the public site. Scheduled posts go live on their own within 15 minutes of their time.
            </p>
          </div>
          <Link href="/admin/blog/new" className="inline-flex min-h-12 items-center bg-amber px-4 text-base font-semibold text-amber-ink">
            New post
          </Link>
        </div>
        <BlogDeskNav current="posts" />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Filter posts" className="flex flex-wrap gap-1">
            {filters.map((filter) => (
              <Link
                key={filter.value || "all"}
                href={href(filter.value)}
                aria-current={status === filter.value ? "page" : undefined}
                className={`inline-flex min-h-11 items-center px-3 text-sm font-semibold ${status === filter.value ? "bg-navy text-white" : "text-ink"}`}
              >
                {filter.label} ({count(filter.value)})
              </Link>
            ))}
          </nav>
          <form action="/admin/blog" className="flex gap-2">
            {status ? <input type="hidden" name="status" value={status} /> : null}
            <label className="sr-only" htmlFor="post-search">
              Search posts
            </label>
            <input
              id="post-search"
              name="q"
              defaultValue={q}
              placeholder="Search titles"
              className="min-h-11 border border-line bg-paper px-3 text-base text-ink"
            />
            <button type="submit" className="inline-flex min-h-11 items-center border border-line px-3 text-sm font-semibold text-ink">
              Search
            </button>
          </form>
        </div>

        {shown.length === 0 ? (
          <p className="mt-6 border border-line bg-panel px-4 py-6 text-base text-ink">
            {posts.length === 0 ? "No posts yet." : "No posts match this filter."}
          </p>
        ) : (
          <ul className="mt-6 grid gap-3">
            {shown.map((post) => (
              <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 border border-line bg-panel px-4 py-4">
                <div className="min-w-0">
                  <Link href={`/admin/blog/${post.id}`} className="text-lg font-semibold text-ink hover:text-link">
                    {post.title}
                  </Link>
                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span className={`inline-flex min-h-6 items-center px-2 text-xs font-semibold ${badge[post.status]}`}>{label[post.status]}</span>
                    {post.status === "scheduled" && post.publishedAt ? <span>Goes live {arizonaTime(post.publishedAt)}</span> : null}
                    {post.status === "published" && post.publishedAt ? <span>Published {formatBlogDate(post.publishedAt)}</span> : null}
                    <span>Edited {formatBlogDate(post.updatedAt)}</span>
                    {post.categories.length ? <span>{post.categories.join(", ")}</span> : null}
                  </p>
                </div>
                <div className="flex gap-2 text-sm font-semibold">
                  <Link href={`/admin/blog/${post.id}`} className="inline-flex min-h-11 items-center px-3 text-link">
                    Edit
                  </Link>
                  <Link href={`/admin/blog/${post.id}/preview`} target="_blank" className="inline-flex min-h-11 items-center px-3 text-link">
                    Preview
                  </Link>
                  {post.status === "published" ? (
                    <Link href={`/blog/${post.slug}`} target="_blank" className="inline-flex min-h-11 items-center px-3 text-link">
                      View ↗
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </AdminShell>
  );
}
