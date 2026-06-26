/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.mixkit.co' },
      { protocol: 'https', hostname: '**.giphy.com' },
      { protocol: 'https', hostname: 'wger.de' },
      { protocol: 'https', hostname: 'media.giphy.com' },
      { protocol: 'https', hostname: 'api.exercisedb.io' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "img-src 'self' data: blob: https://api.exercisedb.io https://assets.mixkit.co https://media.giphy.com https://wger.de; media-src 'self' blob: https://assets.mixkit.co;",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
