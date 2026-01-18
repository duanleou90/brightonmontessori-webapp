import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Builder.io image CDN (common for assets selected in the Builder editor)
      { protocol: "https", hostname: "cdn.builder.io" },
      // Some Builder setups use img.builder.io
      { protocol: "https", hostname: "img.builder.io" },
    ],
  },
};

export default nextConfig;
