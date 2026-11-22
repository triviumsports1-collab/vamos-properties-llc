import type { NextConfig } from "next";

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

/** Hosts that serve media-library uploads (S3 bucket host and optional CDN base URL). */
function mediaRemotePatterns(): RemotePattern[] {
  const hosts = new Set<string>();
  const bucket = process.env.AWS_BUCKET_NAME?.trim();
  const region = process.env.AWS_REGION?.trim();
  if (bucket && region) hosts.add(`${bucket}.s3.${region}.amazonaws.com`);
  const base = process.env.AWS_S3_PUBLIC_BASE_URL?.trim();
  if (base) {
    try {
      hosts.add(new URL(base).hostname);
    } catch {
      // ignore a malformed base URL; uploads fall back to the bucket host
    }
  }
  return [...hosts].map((hostname) => ({ protocol: "https", hostname, pathname: "/**" }));
}

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "drive.google.com", pathname: "/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "*.googleusercontent.com", pathname: "/**" },
      ...mediaRemotePatterns(),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
