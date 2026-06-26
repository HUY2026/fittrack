'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GOAL, WORKOUT_PLAN } from '@/lib/workout-data'
import { format, startOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'

export default function DashboardClient() {
  const [latestWeight, setLatestWeight] = useState<number | null>(null)
  const [weekWorkouts, setWeekWorkouts] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const today = new Date()
  const todayKey = format(today, 'yyyy-MM-dd')

  useEffect(() => {
    async function load() {
      const [w, wk] = await Promise.all([
        supabase.from('weight_logs').select('weight_kg').order('date', { ascending: false }).limit(1),
        supabase.from('workout_logs').select('workout_day,completed').gte('date', format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd')).lte('date', todayKey),
      ])
      if (w.data?.[0]) setLatestWeight(w.data[0].weight_kg)
      const map: Record<string, boolean> = {}
      wk.data?.forEach(r => { map[r.workout_day] = r.completed })
      setWeekWorkouts(map)
      setLoading(false)
    }
    load()
  }, [])

  const currentWeight = latestWeight ?? GOAL.start_weight
  const lost = GOAL.start_weight - currentWeight
  const totalToLose = GOAL.start_weight - GOAL.target_weight
  const progress = Math.min((lost / totalToLose) * 100, 100)

  const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const dayLabels: Record<string, string> = { T2: 'Ngực+Vai', T3: 'Lưng+Tay sau', T4: 'Chân+Core', T5: 'Tay+Vai', T6: 'HIIT', T7: 'Nhảy dây' }

  const todayDayMap: Record<number, string> = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6', 6: 'T7' }
  const todayWorkoutDay = todayDayMap[today.getDay()]

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="text-sm mb-1" style={{ color: 'var(--text-3)' }}>
          {format(today, "EEEE, d MMMM yyyy", { locale: vi })}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>
          Dashboard 🔥
        </h1>
      </div>

      {/* Main progress */}
      <div className="card glow-orange">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-3)' }}>HÀNH TRÌNH GIẢM CÂN</div>
            <div className="flex items-baseline gap-2">
              <span className="stat-num">{currentWeight}kg</span>
              <span className="text-sm" style={{ color: 'var(--text-2)' }}>→ {GOAL.target_weight}kg</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs mb-1" style={{ color: 'var(--text-3)' }}>ĐÃ GIẢM</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--orange)', fontFamily: 'var(--font-display)' }}>
              {lost > 0 ? `-${lost.toFixed(1)}kg` : '0kg'}
            </div>
          </div>
        </div>
        <div className="progress-bar mb-2">
          <div className="progress-bar-fill" style={{ width: `${Math.max(progress, 2)}%` }} />
        </div>
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-3)' }}>
          <span>{GOAL.start_weight}kg (bắt đầu)</span>
          <span className="font-medium" style={{ color: 'var(--orange)' }}>{progress.toFixed(0)}% hoàn thành</span>
          <span>{GOAL.target_weight}kg (mục tiêu)</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Cân hiện tại', value: `${currentWeight}kg`, unit: `mục tiêu ${GOAL.target_weight}kg`, color: 'var(--orange)' },
          { label: 'Đã giảm', value: lost > 0 ? `-${lost.toFixed(1)}kg` : '0kg', unit: `còn ${Math.max(0, GOAL.start_weight - GOAL.target_weight - lost).toFixed(1)}kg nữa`, color: '#16a34a' },
          { label: 'BF mục tiêu', value: `${GOAL.target_bodyfat_min}–${GOAL.target_bodyfat_max}%`, unit: 'body fat', color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="text-xs mb-2" style={{ color: 'var(--text-3)' }}>{s.label.toUpperCase()}</div>
            <div className="text-xl font-bold mb-0.5" style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Today's workout */}
      {todayWorkoutDay && (
        <div className="card card-hover" style={{ borderColor: 'var(--orange)', borderLeftWidth: '3px' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs mb-1" style={{ color: 'var(--orange)' }}>HÔM NAY · {todayWorkoutDay}</div>
              <div className="font-bold text-base" style={{ fontFamily: 'var(--font-display)' }}>
                {WORKOUT_PLAN.find(w => w.day === todayWorkoutDay)?.muscle_groups}
              </div>
              <div className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
                {WORKOUT_PLAN.find(w => w.day === todayWorkoutDay)?.duration_min} phút ·{' '}
                {WORKOUT_PLAN.find(w => w.day === todayWorkoutDay)?.exercises.length} bài
              </div>
            </div>
            <Link href="/workout" className="btn-primary text-sm">Bắt đầu →</Link>
          </div>
        </div>
      )}
      {!todayWorkoutDay && (
        <div className="card" style={{ borderLeft: '3px solid #16a34a' }}>
          <div className="text-xs mb-1" style={{ color: '#16a34a' }}>HÔM NAY · CHỦ NHẬT</div>
          <div className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>Ngày nghỉ 😴</div>
          <div className="text-sm" style={{ color: 'var(--text-2)' }}>Recovery quan trọng như việc tập luyện</div>
        </div>
      )}

      {/* Weekly calendar */}
      <div className="card">
        <div className="text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Lịch tuần này</div>
        <div className="grid grid-cols-6 gap-2">
          {weekDays.map(day => {
            const done = weekWorkouts[day]
            const isToday = day === todayWorkoutDay
            return (
              <div key={day} className="text-center">
                <div className="text-xs mb-2" style={{ color: isToday ? 'var(--orange)' : 'var(--text-3)' }}>{day}</div>
                <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: done ? 'var(--orange)' : isToday ? 'var(--orange-glow)' : 'var(--surface-3)',
                    color: done ? 'white' : isToday ? 'var(--orange)' : 'var(--text-3)',
                    border: isToday ? '2px solid var(--orange)' : '2px solid transparent',
                  }}>
                  {done ? '✓' : '·'}
                </div>
                <div className="text-xs mt-1 hidden md:block" style={{ color: 'var(--text-3)', fontSize: '10px' }}>{dayLabels[day]}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
