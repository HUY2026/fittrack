/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'assets.mixkit.co' },
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'https', hostname: 'wger.de' },
    ],
  },
}

module.exports = nextConfig
