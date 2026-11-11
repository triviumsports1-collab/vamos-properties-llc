import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CommentThread } from "@/components/marketing/comment-thread";
import { JsonLd } from "@/components/marketing/json-ld";
import { LeadForm } from "@/components/marketing/lead-form";
import { PostBody } from "@/components/marketing/post-body";
import { Section } from "@/components/marketing/section";
import { formatBlogDate, readingMinutes } from "@/lib/blog/content";
import { BLOG_TAG, getPublicPost, listPublishedPosts } from "@/lib/dal/blog";
import { site } from "@/lib/site";

export const instant = false;

export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  if (posts.length > 0) return posts.map((post) => ({ slug: post.slug }));
  return [{ slug: "what-a-cash-offer-actually-covers" }];
}

type PostParams = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PostParams): Promise<Metadata> {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) return {};
  const canonical = post.canonicalUrl || `/blog/${post.slug}`;
  const image = post.ogImageUrl || post.featuredImageUrl || undefined;
  return {
    title: post.metaTitle,
    description: post.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      type: "article",
      url: canonical.startsWith("http") ? canonical : `/blog/${post.slug}`,
      images: image ? [{ url: image }] : undefined,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
    },
  };
}

export default async function BlogPostPage({ params }: PostParams) {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);
  const { slug } = await params;
  const post = await getPublicPost(slug);
  if (!post) notFound();
  const pageUrl = `${site.url}/blog/${post.slug}`;
  const category = post.categories[0];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    ...(category ? [{ name: category.name, path: `/blog/category/${category.slug}` }] : []),
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.metaDescription,
          datePublished: post.publishedAt ?? post.updatedAt,
          dateModified: post.updatedAt,
          author: { "@type": "Person", name: post.authorName },
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          image: post.ogImageUrl || post.featuredImageUrl || undefined,
          mainEntityOfPage: pageUrl,
          articleSection: category?.name,
          keywords: post.tags.map((tag) => tag.name).join(", ") || undefined,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: `${site.url}${crumb.path}`,
          })),
        }}
      />
      <Section>
        <nav aria-label="Breadcrumb" className="text-sm text-muted">
          <ol className="flex flex-wrap gap-x-2 gap-y-1">
            {crumbs.slice(0, -1).map((crumb) => (
              <li key={crumb.path}>
                <Link href={crumb.path} className="text-link">
                  {crumb.name}
                </Link>
                <span aria-hidden="true"> / </span>
              </li>
            ))}
            <li className="text-ink">{post.title}</li>
          </ol>
        </nav>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-sm text-muted">
          {post.authorName}
          {post.publishedAt ? ` · ${formatBlogDate(post.publishedAt)}` : ""}
          {` · ${readingMinutes(post.html)} min read`}
        </p>
        {post.featuredImageUrl ? (
          <img src={post.featuredImageUrl} alt={post.featuredImageAlt || ""} className="mt-8 w-full max-w-3xl border border-line" />
        ) : null}
        <PostBody html={post.html} />
        {post.tags.length > 0 ? (
          <ul className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag.slug}>
                <Link href={`/blog/tag/${tag.slug}`} className="inline-flex min-h-11 items-center border border-line px-3 text-sm text-ink">
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        <CommentThread slug={post.slug} comments={post.comments} />
      </Section>
      <Section tone="mist">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
          <div>
            <h2 className="text-3xl font-semibold text-ink">Want this looked at for your house?</h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted">Send the address. A person reads it. You can still say no.</p>
          </div>
          <LeadForm sourcePath={`/blog/${post.slug}`} language="en" />
        </div>
      </Section>
    </>
  );
}
