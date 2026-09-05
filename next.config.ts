import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Set NEXT_PUBLIC_CDN_URL to the HTTPS origin of your CDN when it is ready.
  // This sends Next's hashed static bundles through that CDN without changing
  // local development or requiring a client-side CDN script.
  ...(cdnUrl ? { assetPrefix: cdnUrl } : {}),
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [{ protocol: "http", hostname: "backendweb.eollinea.com", pathname: "/parse/files/**" }, { protocol: "https", hostname: "a-us.storyblok.com", pathname: "/f/**" }, { protocol: "https", hostname: "undergrad.stanford.edu", pathname: "/**" }],
  },
  // Keep Turbopack's file watcher within this app instead of allowing it to
  // infer the drive root on Windows (which includes System Volume Information).
  turbopack: {
    root: process.cwd(),
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
