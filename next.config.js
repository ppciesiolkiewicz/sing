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
    config.externals = [{
      canvas: {}
    }];
    if (isServer) {
      config.externals.push({ bufferutil: "bufferutil", "utf-8-validate": "utf-8-validate", });
    }
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
