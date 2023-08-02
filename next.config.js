/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    VISUALIZER_PATH_TO_PRISMA_SCHEMA:
      process.env.VISUALIZER_PATH_TO_PRISMA_SCHEMA
  }
};

module.exports = nextConfig;
