// iebc-voting-system-frontend/next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  optimizeFonts: true,
  experimental: {
    optimizePackageImports: ["sonner"],
  },
};
export default nextConfig;   