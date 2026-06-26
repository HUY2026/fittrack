'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { GOAL } from '@/lib/workout-data'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts'

type WeightLog = { id: string; date: string; weight_kg: number; note: string | null }
type WorkoutLog = { id?: string; date: string; workout_day: string; completed: boolean; duration_min: number | null }

export default function ProgressClient() {
  const [weights, setWeights] = useState<WeightLog[]>([])
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([])
  const [newWeight, setNewWeight] = useState('')
  const [newNote, setNewNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [w, wk] = await Promise.all([
      supabase.from('weight_logs').select('*').order('date', { ascending: true }).limit(90),
      supabase.from('workout_logs').select('*').order('date', { ascending: true }).limit(90),
    ])
    if (w.data) setWeights(w.data as WeightLog[])
    if (wk.data) setWorkouts(wk.data as WorkoutLog[])
  }

  async function saveWeight() {
    if (!newWeight) return
    setSaving(true)
    const { error } = await supabase.from('weight_logs').insert({
      date: format(new Date(), 'yyyy-MM-dd'),
      weight_kg: parseFloat(newWeight),
      note: newNote || null,
    })
    setSaving(false)
    if (!error) {
      setSaved(true)
      setNewWeight('')
      setNewNote('')
      loadAll()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const latestWeight = weights.at(-1)?.weight_kg ?? GOAL.start_weight
  const lost = GOAL.start_weight - latestWeight
  const toGo = latestWeight - GOAL.target_weight
  const progress = Math.max(0, Math.min((lost / (GOAL.start_weight - GOAL.target_weight)) * 100, 100))

  const weightChartData = weights.map(w => ({
    date: format(new Date(w.date + 'T00:00:00'), 'dd/MM'),
    weight: w.weight_kg,
  }))

  const workoutStreak = (() => {
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const d = format(new Date(today.getTime() - i * 86400000), 'yyyy-MM-dd')
      const dayOfWeek = new Date(d).getDay()
      if (dayOfWeek === 0) continue
      const found = workouts.find(w => w.date === d && w.completed)
      if (found) streak++
      else if (i > 0) break
    }
    return streak
  })()

  const totalWorkouts = workouts.filter(w => w.completed).length

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#ffffff', border: '1px solid var(--border-strong)', borderRadius: '8px', padding: '10px 14px' }}>
        <p style={{ color: 'var(--text-3)', fontSize: '12px', marginBottom: '4px' }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color, fontSize: '13px', fontWeight: 600 }}>
            {p.name}: {p.value}{p.name === 'weight' ? 'kg' : ''}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
        📈 Tiến độ
      </h1>

      {/* Log weight */}
      <div className="card mb-6">
        <div className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          ⚖️ Cân nặng hôm nay
        </div>
        <div className="flex gap-3">
          <input type="number" step="0.1" value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            className="input-dark" placeholder="VD: 77.5" style={{ maxWidth: '120px' }} />
          <input value={newNote}
            onChange={e => setNewNote(e.target.value)}
            className="input-dark flex-1" placeholder="Ghi chú (tùy chọn)" />
          <button onClick={saveWeight} disabled={saving || !newWeight} className="btn-primary">
            {saving ? '...' : saved ? '✓' : 'Lưu'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Cân hiện tại', value: `${latestWeight}kg`, color: 'var(--orange)' },
          { label: 'Đã giảm', value: lost > 0 ? `-${lost.toFixed(1)}kg` : '0kg', color: '#16a34a' },
          { label: 'Còn phải giảm', value: `${toGo > 0 ? toGo.toFixed(1) : 0}kg`, color: '#2563eb' },
          { label: 'Streak tập', value: `${workoutStreak} ngày`, color: '#d97706' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>{s.label.toUpperCase()}</div>
            <div className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="card mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            Hành trình: {GOAL.start_weight}kg → {GOAL.target_weight}kg
          </div>
          <div className="text-lg font-bold" style={{ color: 'var(--orange)', fontFamily: 'var(--font-display)' }}>
            {progress.toFixed(1)}%
          </div>
        </div>
        <div className="progress-bar" style={{ height: '10px' }}>
          <div className="progress-bar-fill" style={{ width: `${Math.max(progress, 1)}%` }} />
        </div>
        <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-3)' }}>
          <span>{GOAL.start_weight}kg (bắt đầu)</span>
          <span>{GOAL.target_weight}kg (mục tiêu)</span>
        </div>
      </div>

      {/* Weight chart */}
      {weightChartData.length > 1 && (
        <div className="card mb-6">
          <div className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            📉 Cân nặng theo thời gian
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#888888', fontSize: 11 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#888888', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={GOAL.target_weight} stroke="#16a34a" strokeDasharray="4 4"
                label={{ value: `Mục tiêu ${GOAL.target_weight}kg`, fill: '#16a34a', fontSize: 11 }} />
              <Line type="monotone" dataKey="weight" stroke="var(--orange)" strokeWidth={2.5}
                dot={{ fill: 'var(--orange)', r: 3 }} name="weight" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Workout history */}
      {workouts.length > 0 && (
        <div className="card">
          <div className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            📋 Lịch sử tập luyện
          </div>
          <div className="space-y-2">
            {workouts.slice(-20).reverse().map(w => (
              <div key={w.id ?? w.date + w.workout_day}
                className="flex items-center justify-between py-2 px-3 rounded-lg"
                style={{ background: '#ffffff', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: w.completed ? '#16a34a' : '#dc2626' }} />
                  <span className="text-sm">{format(new Date(w.date + 'T00:00:00'), 'EEE dd/MM', { locale: vi })}</span>
                  <span className="badge text-xs" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>
                    {w.workout_day}
                  </span>
                </div>
                <div className="text-sm" style={{ color: 'var(--text-3)' }}>
                  {w.duration_min ? `${w.duration_min} phút` : '—'}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t flex gap-4 text-sm" style={{ borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--text-3)' }}>Tổng: <strong style={{ color: 'var(--text)' }}>{totalWorkouts} buổi</strong></span>
            <span style={{ color: 'var(--text-3)' }}>Streak: <strong style={{ color: '#d97706' }}>{workoutStreak} ngày 🔥</strong></span>
          </div>
        </div>
      )}

      {weights.length === 0 && workouts.length === 0 && (
        <div className="card text-center py-12" style={{ color: 'var(--text-3)' }}>
          <div className="text-4xl mb-3">📊</div>
          <div className="text-base font-medium mb-1">Chưa có dữ liệu</div>
          <div className="text-sm">Bắt đầu bằng cách cân nặng và ghi log bài tập đầu tiên nhé!</div>
        </div>
      )}
    </div>
  )
}
