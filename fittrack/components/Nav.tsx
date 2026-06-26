'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Dashboard', icon: '⚡' },
  { href: '/workout', label: 'Tập luyện', icon: '💪' },
  { href: '/nutrition', label: 'Dinh dưỡng', icon: '🥗' },
  { href: '/progress', label: 'Tiến độ', icon: '📈' },
]

export default function Nav() {
  const path = usePathname()
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 border-r z-40"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="p-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: 'var(--orange)' }}>🔥</div>
            <div>
              <div className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>FitTrack</div>
              <div className="text-xs" style={{ color: 'var(--text-3)' }}>79kg → 64kg</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                color: path === n.href ? 'var(--orange)' : 'var(--text-2)',
                background: path === n.href ? 'var(--orange-glow)' : 'transparent',
              }}>
              <span>{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 m-3 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>Mục tiêu</div>
          <div className="text-sm font-semibold" style={{ color: 'var(--orange)' }}>64kg · BF 10–12%</div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className="flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-all"
              style={{ color: path === n.href ? 'var(--orange)' : 'var(--text-3)' }}>
              <span className="text-lg">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
