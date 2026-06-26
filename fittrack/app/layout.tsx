import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitTrack — Theo dõi tập luyện',
  description: 'Theo dõi tiến độ giảm mỡ tăng cơ cá nhân',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}
