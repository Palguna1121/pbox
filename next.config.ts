import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // placehold.co stays for catalog rows that src/lib/catalog-assets.ts cannot map to a local file.
    remotePatterns: [{ protocol: "https", hostname: "placehold.co", port: "" }],
  },
};

export default nextConfig;
