import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { ClosingBand } from "@/components/marketing/closing-band";
import { LeadForm } from "@/components/marketing/lead-form";
import { PostCard } from "@/components/marketing/post-card";
import { Section } from "@/components/marketing/section";
import { BLOG_TAG, listPublishedPosts } from "@/lib/dal/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes from Vamos Properties on selling a Phoenix house, a cash offer, and a mortgage that is behind.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const posts = await listPublishedPosts();

  return (
    <>
      <Section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">Blog</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">Notes on selling a house in Phoenix.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
          Plain writing from Patrick and Jaime. If you already know the address, skip the reading and send it.
        </p>
        {posts.length === 0 ? (
          <p className="mt-10 border border-line px-4 py-6 text-base text-ink">Nothing published yet. Call if you would rather talk it through.</p>
        ) : (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {posts.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        )}
      </Section>
      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink sm:text-4xl">The address still does more than an article.</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">You can say no after we call. Asking does not put the house under contract.</p>
          </div>
          <LeadForm sourcePath="/blog" language="en" />
        </div>
      </Section>
      <ClosingBand title="When you are ready, send the address." body="Patrick or Jaime read it. You are not signing anything by asking." />
    </>
  );
}
