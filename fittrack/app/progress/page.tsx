import Nav from '@/components/Nav'
import ProgressClient from './ProgressClient'

export default function ProgressPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="md:ml-56 pb-20 md:pb-0">
        <ProgressClient />
      </main>
    </div>
  )
}
