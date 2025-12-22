/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: false, // Next.js će optimizovati slike
    // Ako koristiš external slike, dodaj domains ovde:
    // domains: ['example.com'],
  },
}

module.exports = nextConfig

