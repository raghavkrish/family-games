import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev-only: allow phones / LAN hosts to load /_next assets.
  // Bare "*" is rejected by Next; these wildcards cover IPv4 + .local names.
  allowedDevOrigins: ["*.*.*.*", "*.*.*", "*.*", "*.local", "**.local"],
};

export default nextConfig;
