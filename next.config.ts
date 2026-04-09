import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * React Compiler adds noticeable dev-time memory use. Keeping it off avoids
   * long `next dev` sessions climbing toward the V8 heap limit (OOM).
   * Enable only when you want to profile compiler output.
   */
  reactCompiler: false,

  /**
   * Tree-shake icon imports so the dev server does less work per page.
   */
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
