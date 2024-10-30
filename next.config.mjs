/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY,
    API_SECRET: process.env.API_SECRET,
  },
};

// module.exports = nextConfig;
export default nextConfig;