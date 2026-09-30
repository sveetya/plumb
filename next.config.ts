import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ["@thesvg/icons"],
  outputFileTracingIncludes: {
    "/*": ["./architecture/**/*", "./umami/**/*"],
  },
  outputFileTracingExcludes: {
    "/*": [
      "./umami/node_modules/**",
      "./umami/.git/**",
      "./umami/.next/**",
    ],
  },
}

export default nextConfig
