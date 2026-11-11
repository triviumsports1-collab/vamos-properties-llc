import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/marketing/post-card";
import { Section } from "@/components/marketing/section";
import { BLOG_TAG, getTagArchive } from "@/lib/dal/blog";

export const instant = false;

type TagParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: TagParams): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const { slug } = await params;
  const tag = await getTagArchive(slug);
  if (!tag) return {};
  return {
    title: tag.name,
    description: `Articles tagged ${tag.name}.`,
    alternates: { canonical: `/blog/tag/${tag.slug}` },
  };
}

export default async function TagPage({ params }: TagParams) {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const { slug } = await params;
  const tag = await getTagArchive(slug);
  if (!tag) notFound();

  return (
    <Section>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">
        <Link href="/blog">Blog</Link>
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink">{tag.name}</h1>
      {tag.posts.length === 0 ? (
        <p className="mt-10 text-base text-ink">No articles with this tag yet.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {tag.posts.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
