import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['shiki'],
  serverExternalPackages: ['langium', '@mermaid-js/parser'],
  reactCompiler: true,
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'vscode-jsonrpc': false,
        langium: false,
      }
    }
    return config
  },
}

export default nextConfig
