import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  agentRules: false,
  transpilePackages: ["@thesvg/icons"],
  outputFileTracingIncludes: {
    "/*": ["./architecture/**/*", "./umami/**/*"],
  },
}

export default nextConfig
