/** @type {import('next').NextConfig} */
// const nodeExternals = require('webpack-node-externals')

const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.externals = [{
      canvas: {}
    }];
    // config.externals.push(nodeExternals()); - TODO: causes error: "Currently React only supports one RSC renderer at a time.""
    config.externals.push({
      bufferutil: "bufferutil",
      "utf-8-validate": "utf-8-validate",
    });
    return config
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
