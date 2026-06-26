import Nav from '@/components/Nav'
import WorkoutClient from './WorkoutClient'

export default function WorkoutPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="md:ml-56 pb-20 md:pb-0">
        <WorkoutClient />
      </main>
    </div>
  )
}
