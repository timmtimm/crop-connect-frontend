/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APP_DOMAIN: process.env.APP_DOMAIN,
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
};

module.exports = nextConfig;
