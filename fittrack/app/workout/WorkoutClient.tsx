'use client'
import { useState, useEffect } from 'react'
import { WORKOUT_PLAN, type Exercise } from '@/lib/workout-data'
import { supabase, type ExerciseLog } from '@/lib/supabase'
import { format } from 'date-fns'

type SetLog = { reps: number; weight_kg: number }

function ExerciseMedia({ url, name }: { url: string; name: string }) {
  const [errored, setErrored] = useState(false)
  if (!url) return null
  return (
    <div className="rounded-xl overflow-hidden mb-4 flex items-center justify-center"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '8px', minHeight: '80px' }}>
      {errored ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
          Chưa có demo cho bài này
        </div>
      ) : (
        <img
          src={url}
          alt={`Demo ${name}`}
          style={{ maxHeight: '320px', maxWidth: '100%', objectFit: 'contain', display: 'block', borderRadius: '8px' }}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  )
}

export default function WorkoutClient() {
  const [activeDay, setActiveDay] = useState<string | null>(null)
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null)
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetLog[]>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  const todayDayMap: Record<number, string> = { 1: 'T2', 2: 'T3', 3: 'T4', 4: 'T5', 5: 'T6' }
  const today = new Date()
  const todayDay = todayDayMap[today.getDay()]

  useEffect(() => {
    if (todayDay) setActiveDay(todayDay)
    else setActiveDay('T2')
  }, [])

  const currentWorkout = WORKOUT_PLAN.find(w => w.day === activeDay)

  function initSets(exercise: Exercise) {
    if (!exerciseLogs[exercise.id]) {
      setExerciseLogs(prev => ({
        ...prev,
        [exercise.id]: Array.from({ length: exercise.sets }, () => ({ reps: 0, weight_kg: 0 }))
      }))
    }
    setActiveExercise(exercise)
    if (!startTime) setStartTime(new Date())
  }

  function updateSet(exerciseId: string, setIdx: number, field: 'reps' | 'weight_kg', val: number) {
    setExerciseLogs(prev => {
      const sets = [...(prev[exerciseId] || [])]
      sets[setIdx] = { ...sets[setIdx], [field]: val }
      return { ...prev, [exerciseId]: sets }
    })
  }

  async function saveWorkout() {
    if (!activeDay || !currentWorkout) return
    setSaving(true)
    const exercises: ExerciseLog[] = Object.entries(exerciseLogs).map(([exercise_id, sets]) => ({
      exercise_id,
      sets: sets.map((s, i) => ({ set_num: i + 1, reps: s.reps, weight_kg: s.weight_kg }))
    }))
    const duration_min = startTime ? Math.round((Date.now() - startTime.getTime()) / 60000) : null
    const { error } = await supabase.from('workout_logs').upsert({
      date: format(today, 'yyyy-MM-dd'),
      workout_day: activeDay,
      completed: true,
      duration_min,
      exercises,
    }, { onConflict: 'date,workout_day' })
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  const completedCount = Object.keys(exerciseLogs).filter(id =>
    exerciseLogs[id].every(s => s.reps > 0)
  ).length

  // Group exercises by superset for display
  const groupedExercises = currentWorkout?.exercises.reduce((acc, ex, idx) => {
    const key = ex.superset ? `ss-${ex.superset}` : `solo-${idx}`
    if (!acc[key]) acc[key] = []
    acc[key].push({ ex, idx })
    return acc
  }, {} as Record<string, { ex: Exercise; idx: number }[]>) ?? {}

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
        💪 Tập luyện
      </h1>

      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {WORKOUT_PLAN.map(w => (
          <button key={w.day}
            onClick={() => { setActiveDay(w.day); setActiveExercise(null) }}
            className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeDay === w.day ? 'var(--orange)' : '#ffffff',
              color: activeDay === w.day ? 'white' : 'var(--text-2)',
              border: `1px solid ${activeDay === w.day ? 'var(--orange)' : 'var(--border-strong)'}`,
              boxShadow: w.day === todayDay && activeDay !== w.day ? '0 0 0 2px rgba(232,98,10,0.25)' : 'none',
            }}>
            {w.day}
            {w.day === todayDay && <span className="ml-1 text-xs">★</span>}
          </button>
        ))}
        <button onClick={() => setActiveDay('T7-CN')}
          className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: '#ffffff', color: 'var(--text-3)', border: '1px solid var(--border-strong)' }}>
          T7–CN
        </button>
      </div>

      {activeDay === 'T7-CN' && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">😴</div>
          <div className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)' }}>Ngày nghỉ</div>
          <div style={{ color: 'var(--text-2)' }}>Cơ bắp phát triển khi nghỉ ngơi, không phải khi tập</div>
          <div className="mt-4 text-sm" style={{ color: 'var(--text-3)' }}>Có thể đi bộ nhẹ 30 phút nếu muốn active recovery</div>
        </div>
      )}

      {currentWorkout && (
        <div>
          {/* Workout header */}
          <div className="card mb-4" style={{ borderLeft: '3px solid var(--orange)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--orange)' }}>{currentWorkout.day_vi}</div>
                <div className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{currentWorkout.muscle_groups}</div>
                <div className="text-sm mt-0.5" style={{ color: 'var(--text-2)' }}>
                  {currentWorkout.duration_min} phút · {currentWorkout.exercises.length} bài
                  {startTime && <span className="ml-2" style={{ color: 'var(--orange)' }}>⏱ đang tập</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold" style={{ color: 'var(--orange)', fontFamily: 'var(--font-display)' }}>
                  {completedCount}/{currentWorkout.exercises.length}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-3)' }}>bài xong</div>
              </div>
            </div>
            {/* Day note */}
            <div className="mt-3 text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>
              ℹ️ {currentWorkout.note}
            </div>
            {completedCount > 0 && (
              <div className="progress-bar mt-3">
                <div className="progress-bar-fill" style={{ width: `${(completedCount / currentWorkout.exercises.length) * 100}%` }} />
              </div>
            )}
          </div>

          {/* Exercise list */}
          <div className="space-y-3">
            {currentWorkout.exercises.map((ex, idx) => {
              const isOpen = activeExercise?.id === ex.id
              const logs = exerciseLogs[ex.id]
              const done = logs?.every(s => s.reps > 0)
              const isSuperset = !!ex.superset
              return (
                <div key={ex.id} className="card card-hover"
                  style={{
                    borderLeft: done ? '3px solid #22c55e' : isSuperset ? '3px solid #7c3aed' : '3px solid transparent',
                  }}>
                  <button className="w-full text-left" onClick={() => isOpen ? setActiveExercise(null) : initSets(ex)}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                        style={{ background: done ? '#22c55e' : 'var(--surface-3)', color: done ? 'white' : 'var(--text-3)' }}>
                        {done ? '✓' : idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                          <span>{ex.name_vi}</span>
                          {ex.superset && (
                            <span className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', border: '1px solid rgba(124,58,237,0.2)', flexShrink: 0 }}>
                              Superset {ex.superset}
                            </span>
                          )}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-3)' }}>
                          {ex.sets} sets × {ex.reps} · nghỉ {ex.rest_sec}s
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded flex-shrink-0" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>
                        {ex.muscle_group}
                      </div>
                      <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-4 space-y-4 animate-slide-up">
                      {ex.gif_url && <ExerciseMedia url={ex.gif_url} name={ex.name_vi} />}

                      <div className="px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(232,98,10,0.08)', border: '1px solid rgba(232,98,10,0.2)', color: 'var(--text-2)' }}>
                        <span className="font-semibold" style={{ color: 'var(--orange)' }}>📊 Khối lượng: </span>{ex.weight_note}
                      </div>

                      <div>
                        <div className="text-xs font-semibold mb-2" style={{ color: '#16a34a' }}>✅ Thực hiện đúng</div>
                        <ul className="space-y-1">
                          {ex.tips.map((tip, i) => (
                            <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-2)' }}>
                              <span style={{ color: '#16a34a', flexShrink: 0 }}>·</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="text-xs font-semibold mb-2" style={{ color: '#dc2626' }}>⚠️ Cần tránh</div>
                        <ul className="space-y-1">
                          {ex.avoid.map((a, i) => (
                            <li key={i} className="text-sm flex gap-2" style={{ color: 'var(--text-2)' }}>
                              <span style={{ color: '#dc2626', flexShrink: 0 }}>·</span>{a}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Set logger */}
                      <div>
                        <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-3)' }}>GHI KẾT QUẢ</div>
                        <div className="space-y-2">
                          {(logs || []).map((set, si) => (
                            <div key={si} className="flex items-center gap-3">
                              <div className="text-xs w-12 text-center py-1 rounded"
                                style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>
                                Set {si + 1}
                              </div>
                              <div className="flex-1">
                                <input type="number" placeholder="Reps"
                                  value={set.reps || ''}
                                  onChange={e => updateSet(ex.id, si, 'reps', +e.target.value)}
                                  className="input-dark text-center"
                                  style={{ height: '36px', padding: '0 8px' }} />
                              </div>
                              <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>×</span>
                              <div className="flex-1">
                                <input type="number" placeholder="kg"
                                  value={set.weight_kg || ''}
                                  onChange={e => updateSet(ex.id, si, 'weight_kg', +e.target.value)}
                                  className="input-dark text-center"
                                  style={{ height: '36px', padding: '0 8px' }} />
                              </div>
                              <div className="text-xs w-8 text-center" style={{ color: 'var(--text-3)' }}>kg</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Save button */}
          <div className="mt-6">
            <button onClick={saveWorkout} disabled={saving || completedCount === 0}
              className="btn-primary w-full py-3 text-base"
              style={{ opacity: completedCount === 0 ? 0.5 : 1 }}>
              {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu!' : `Lưu buổi tập (${completedCount}/${currentWorkout.exercises.length} bài)`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
