import Nav from '@/components/Nav'
import NutritionClient from './NutritionClient'

export default function NutritionPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Nav />
      <main className="md:ml-56 pb-20 md:pb-0">
        <NutritionClient />
      </main>
    </div>
  )
}
