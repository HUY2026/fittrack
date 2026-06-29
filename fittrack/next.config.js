/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.mixkit.co' },
      { protocol: 'https', hostname: '**.giphy.com' },
      { protocol: 'https', hostname: 'wger.de' },
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'commons.wikimedia.org' },
    ],
  },
}

module.exports = nextConfig
