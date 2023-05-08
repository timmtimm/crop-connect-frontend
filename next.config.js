/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
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
