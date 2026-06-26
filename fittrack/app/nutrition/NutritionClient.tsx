'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MEAL_PLAN, DAILY_TARGET } from '@/lib/workout-data'
import { format, subDays } from 'date-fns'
import { vi } from 'date-fns/locale'

type NutritionLog = {
  id?: string
  date: string
  calories: number
  protein_g: number
  is_cheat_day: boolean
  note: string
}

export default function NutritionClient() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [log, setLog] = useState<Partial<NutritionLog>>({
    calories: DAILY_TARGET.calories,
    protein_g: DAILY_TARGET.protein,
    is_cheat_day: false,
    note: '',
  })
  const [mode, setMode] = useState<'plan' | 'custom'>('plan')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [history, setHistory] = useState<NutritionLog[]>([])

  useEffect(() => {
    loadLog(selectedDate)
    loadHistory()
  }, [selectedDate])

  async function loadLog(date: string) {
    const { data } = await supabase.from('nutrition_logs').select('*').eq('date', date).maybeSingle()
    if (data) {
      setLog(data)
      setMode('custom')
    } else {
      setLog({ calories: DAILY_TARGET.calories, protein_g: DAILY_TARGET.protein, is_cheat_day: false, note: '' })
      setMode('plan')
    }
  }

  async function loadHistory() {
    const { data } = await supabase.from('nutrition_logs')
      .select('*')
      .order('date', { ascending: false })
      .limit(14)
    if (data) setHistory(data as NutritionLog[])
  }

  async function save() {
    setSaving(true)
    const payload = { date: selectedDate, calories: log.calories!, protein_g: log.protein_g!, is_cheat_day: log.is_cheat_day!, note: log.note || '' }
    const { error } = await supabase.from('nutrition_logs').upsert(payload, { onConflict: 'date' })
    setSaving(false)
    if (!error) {
      setSaved(true)
      loadHistory()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  function fillFromPlan() {
    setLog({ ...log, calories: DAILY_TARGET.calories, protein_g: DAILY_TARGET.protein, is_cheat_day: false })
    setMode('plan')
  }

  const calPct = Math.min(((log.calories || 0) / DAILY_TARGET.calories) * 100, 130)
  const protPct = Math.min(((log.protein_g || 0) / DAILY_TARGET.protein) * 100, 130)
  const calOver = (log.calories || 0) > DAILY_TARGET.calories

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>
        🥗 Dinh dưỡng
      </h1>

      {/* Date picker */}
      <div className="card mb-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Ngày</label>
          <input type="date" value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="input-dark" style={{ width: 'auto' }} />
          <button onClick={() => setSelectedDate(format(new Date(), 'yyyy-MM-dd'))}
            className="btn-ghost text-xs py-1 px-3">Hôm nay</button>
        </div>
      </div>

      {/* Cheat day toggle */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-sm">Cheat Day? 🍕</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
              Bật lên để nhập tự do, không tính vào streak
            </div>
          </div>
          <button onClick={() => setLog(l => ({ ...l, is_cheat_day: !l.is_cheat_day }))}
            className="relative w-12 h-6 rounded-full transition-all"
            style={{ background: log.is_cheat_day ? 'var(--orange)' : 'var(--surface-3)' }}>
            <div className="absolute top-1 w-4 h-4 bg-white rounded-full transition-all"
              style={{ left: log.is_cheat_day ? '26px' : '4px' }} />
          </button>
        </div>
      </div>

      {/* Log form */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            {log.is_cheat_day ? '🍕 Cheat day — nhập tự do' : 'Ghi nhận dinh dưỡng'}
          </div>
          <button onClick={fillFromPlan} className="text-xs" style={{ color: 'var(--orange)' }}>
            Dùng kế hoạch chuẩn
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>CALO (kcal)</label>
            <input type="number" value={log.calories || ''}
              onChange={e => { setLog(l => ({ ...l, calories: +e.target.value })); setMode('custom') }}
              className="input-dark" placeholder={`${DAILY_TARGET.calories}`} />
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{
                width: `${calPct}%`,
                background: calOver ? 'linear-gradient(90deg,#f87171,#ef4444)' : undefined
              }} />
            </div>
            <div className="text-xs mt-1" style={{ color: calOver ? '#f87171' : 'var(--text-3)' }}>
              {calOver ? `+${(log.calories || 0) - DAILY_TARGET.calories} kcal vượt` : `/ ${DAILY_TARGET.calories} kcal`}
            </div>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>PROTEIN (g)</label>
            <input type="number" value={log.protein_g || ''}
              onChange={e => { setLog(l => ({ ...l, protein_g: +e.target.value })); setMode('custom') }}
              className="input-dark" placeholder={`${DAILY_TARGET.protein}`} />
            <div className="progress-bar mt-2">
              <div className="progress-bar-fill" style={{ background: 'linear-gradient(90deg,#60a5fa,#3b82f6)', width: `${protPct}%` }} />
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>/ {DAILY_TARGET.protein}g</div>
          </div>
        </div>

        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-3)' }}>GHI CHÚ (tùy chọn)</label>
          <textarea value={log.note || ''}
            onChange={e => setLog(l => ({ ...l, note: e.target.value }))}
            className="input-dark resize-none" rows={2}
            placeholder="VD: Ăn thêm bún bò buổi tối, uống thêm whey..." />
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full mt-4 py-3">
          {saving ? 'Đang lưu...' : saved ? '✓ Đã lưu!' : 'Lưu hôm nay'}
        </button>
      </div>

      {/* Meal plan reference */}
      <div className="card mb-4">
        <div className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
          📋 Thực đơn kế hoạch
        </div>
        <div className="space-y-2">
          {MEAL_PLAN.map(m => (
            <div key={m.meal} className="flex items-center justify-between py-2 border-b text-sm"
              style={{ borderColor: 'var(--border)' }}>
              <div>
                <span className="font-medium mr-2" style={{ color: 'var(--orange)' }}>{m.meal}</span>
                <span style={{ color: 'var(--text-2)' }}>{m.items}</span>
              </div>
              <div className="flex gap-3 flex-shrink-0 ml-4">
                <span style={{ color: 'var(--text-3)' }}>{m.calories} kcal</span>
                <span style={{ color: '#60a5fa' }}>{m.protein}g P</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between pt-1 font-semibold text-sm">
            <span>Tổng</span>
            <div>
              <span style={{ color: 'var(--orange)' }}>~1920 kcal</span>
              <span className="ml-3" style={{ color: '#60a5fa' }}>~130g protein</span>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card">
          <div className="text-sm font-semibold mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            📅 14 ngày gần đây
          </div>
          <div className="space-y-2">
            {history.map(h => (
              <button key={h.id} onClick={() => setSelectedDate(h.date)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg transition-all text-left"
                style={{
                  background: h.date === selectedDate ? 'var(--orange-glow)' : 'var(--surface-2)',
                  border: `1px solid ${h.date === selectedDate ? 'var(--orange)' : 'transparent'}`
                }}>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: 'var(--text-3)' }}>
                    {format(new Date(h.date + 'T00:00:00'), 'EEE dd/MM', { locale: vi })}
                  </span>
                  {h.is_cheat_day && <span className="badge text-xs" style={{ background: 'rgba(249,115,22,0.1)', color: 'var(--orange)' }}>🍕 Cheat</span>}
                </div>
                <div className="flex gap-4 text-sm">
                  <span style={{ color: h.calories > DAILY_TARGET.calories ? '#f87171' : 'var(--text-2)' }}>
                    {h.calories} kcal
                  </span>
                  <span style={{ color: '#60a5fa' }}>{h.protein_g}g P</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
