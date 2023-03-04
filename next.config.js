/** @type {import('next').NextConfig} */
const nodeExternals = require('webpack-node-externals');

const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    // Important: return the modified config
    if (!isServer) {
      config.externals = [nodeExternals()];
    } else {
      config.externals = {
        canvas: {}
      };
    }
    return config
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
