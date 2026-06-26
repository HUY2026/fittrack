import Nav from '@/components/Nav'
import DashboardClient from './DashboardClient'

export default function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="md:ml-56 pb-20 md:pb-0">
        <DashboardClient />
      </main>
    </div>
  )
}
