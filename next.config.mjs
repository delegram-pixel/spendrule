import 'dotenv/config';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
      // Disable React Strict Mode during development to avoid double-rendering issues
  reactStrictMode: false,
  // Custom webpack configuration to ensure it's being used
  webpack: (config, { isServer }) => {
    console.log("Using custom Webpack config for development.");
    // Fixes "Module not found: Can't resolve 'fs'" error in browser
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }
    // You can add custom webpack rules here if needed
    return config;
  },
  // Explicitly disable SWC minification to avoid any caching interactions with SWC
  swcMinify: false,
}

export default nextConfig
