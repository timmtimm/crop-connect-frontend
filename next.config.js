/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APP_DOMAIN: process.env.APP_DOMAIN,
    BACKEND_BASE_URL: process.env.BACKEND_BASE_URL,
  },
  eslint: {
    dirs: ["src"],
  },
  images: {
    domains: ["res.cloudinary.com"],
  },
};

module.exports = nextConfig;
