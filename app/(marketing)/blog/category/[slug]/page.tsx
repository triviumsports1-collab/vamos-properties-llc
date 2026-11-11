import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/marketing/post-card";
import { Section } from "@/components/marketing/section";
import { BLOG_TAG, getCategoryArchive } from "@/lib/dal/blog";

export const instant = false;

type CategoryParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CategoryParams): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const { slug } = await params;
  const category = await getCategoryArchive(slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description || `Articles filed under ${category.name}.`,
    alternates: { canonical: `/blog/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: CategoryParams) {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const { slug } = await params;
  const category = await getCategoryArchive(slug);
  if (!category) notFound();

  return (
    <Section>
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-link">
        <Link href="/blog">Blog</Link>
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight text-ink">{category.name}</h1>
      {category.description ? <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{category.description}</p> : null}
      {category.children.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <li key={child.slug}>
              <Link href={`/blog/category/${child.slug}`} className="inline-flex min-h-11 items-center border border-line px-3 text-sm text-ink">
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      {category.posts.length === 0 ? (
        <p className="mt-10 text-base text-ink">No articles in this category yet.</p>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {category.posts.map((post) => (
            <li key={post.slug}>
              <PostCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
