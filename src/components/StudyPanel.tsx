import { useState, type FormEvent } from 'react'
import { levels } from '../data/levels'
import { summarizePairedSessions, type StudySummary } from '../domain/study'
import type { LevelId, ProgressMap, StudySessionRecord } from '../types'
import { Icon } from './Icons'
import './StudyPanel.css'

export interface StudyStartValues {
  participantCode: string
  levelId: LevelId
  confidenceBefore: number
}

interface StudyPanelProps {
  sessions: StudySessionRecord[]
  progress: ProgressMap
  onStart: (values: StudyStartValues) => void
  onBack: () => void
  onExport: () => void
  onClear: () => void
}

function ConfidenceScale({
  name,
  value,
  onChange,
}: {
  name: string
  value: number | null
  onChange: (value: number) => void
}) {
  return (
    <fieldset className="confidence-scale">
      <legend>使用手機的信心（1分最低，5分最高）</legend>
      <div>
        {[1, 2, 3, 4, 5].map((score) => (
          <label key={score} className={value === score ? 'is-selected' : ''}>
            <input
              type="radio"
              name={name}
              value={score}
              checked={value === score}
              onChange={() => onChange(score)}
            />
            <span>{score} 分</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function ComparisonChart({ summary }: { summary: StudySummary }) {
  const maxDuration = Math.max(summary.duration.first, summary.duration.second, 1)
  const firstWidth = (summary.duration.first / maxDuration) * 220
  const secondWidth = (summary.duration.second / maxDuration) * 220
  return (
    <section className="study-chart-card">
      <h2>完成時間比較</h2>
      <svg
        className="study-chart"
        viewBox="0 0 320 120"
        role="img"
        aria-label={`完成時間比較：第一次平均 ${summary.duration.first} 秒，第二次平均 ${summary.duration.second} 秒`}
      >
        <text x="0" y="27">第一次</text>
        <rect x="70" y="10" width={firstWidth} height="28" rx="5" className="bar-first" />
        <text x="75" y="30" className="bar-label">{summary.duration.first}秒</text>
        <text x="0" y="82">第二次</text>
        <rect x="70" y="65" width={secondWidth} height="28" rx="5" className="bar-second" />
        <text x="75" y="85" className="bar-label">{summary.duration.second}秒</text>
      </svg>
      <div className="study-metric-grid">
        <p><span>錯誤</span><strong>{summary.errors.first} → {summary.errors.second}</strong></p>
        <p><span>求助</span><strong>{summary.hints.first} → {summary.hints.second}</strong></p>
        <p><span>信心</span><strong>{summary.confidence.first} → {summary.confidence.second}</strong></p>
        <p><span>有效樣本</span><strong>n = {summary.pairCount}</strong></p>
      </div>
    </section>
  )
}

export function StudyPanel({
  sessions,
  progress,
  onStart,
  onBack,
  onExport,
  onClear,
}: StudyPanelProps) {
  const [participantCode, setParticipantCode] = useState('')
  const [levelId, setLevelId] = useState<LevelId>('registration')
  const [confidenceBefore, setConfidenceBefore] = useState<number | null>(null)
  const [error, setError] = useState('')
  const summary = summarizePairedSessions(sessions, 'registration')
  const unlockedLevels = levels.filter((level) => progress[level.id].unlocked)

  function submit(event: FormEvent) {
    event.preventDefault()
    const code = participantCode.trim().toUpperCase()
    if (!/^P0[1-5]$/.test(code)) {
      setError('請輸入 P01 至 P05 的匿名代碼。')
      return
    }
    if (confidenceBefore === null) {
      setError('請先選擇練習前的信心分數。')
      return
    }
    setError('')
    onStart({ participantCode: code, levelId, confidenceBefore })
  }

  return (
    <main className="study-panel">
      <div className="study-panel__topline">
        <button type="button" className="back-button" onClick={onBack}>返回首頁</button>
        <span className="study-badge">導師模式</span>
      </div>
      <header>
        <Icon name="chart" size={42} />
        <div><h1>匿名測試工具</h1><p>只使用代碼，不輸入長者姓名。</p></div>
      </header>

      <form className="study-form" onSubmit={submit} noValidate>
        <div className="form-field">
          <label htmlFor="participant-code">匿名參加者代碼</label>
          <input
            id="participant-code"
            value={participantCode}
            onChange={(event) => setParticipantCode(event.target.value.toUpperCase())}
            placeholder="例如 P01"
            maxLength={3}
            autoComplete="off"
          />
        </div>
        <div className="form-field">
          <label htmlFor="study-level">測試關卡</label>
          <select id="study-level" value={levelId} onChange={(event) => setLevelId(event.target.value as LevelId)}>
            {unlockedLevels.map((level) => <option key={level.id} value={level.id}>{level.title}</option>)}
          </select>
        </div>
        <ConfidenceScale name="confidence-before" value={confidenceBefore} onChange={setConfidenceBefore} />
        {error && <p className="field-error" role="alert">{error}</p>}
        <button type="submit" className="primary-button">開始匿名測試</button>
      </form>

      <section className="study-results">
        <h2>關卡一前後測結果</h2>
        {summary.pairCount < 2 ? (
          <div className="insufficient-data"><strong>數據不足</strong><span>最少需要2名參加者各完成兩次。</span></div>
        ) : <ComparisonChart summary={summary} />}
      </section>

      <div className="study-actions">
        <button type="button" className="secondary-button" onClick={onExport} disabled={!sessions.length}>匯出 CSV</button>
        <button type="button" className="danger-button" onClick={onClear} disabled={!sessions.length}>清除測試紀錄</button>
      </div>
    </main>
  )
}

export function PostConfidencePanel({
  participantCode,
  onSubmit,
}: {
  participantCode: string
  onSubmit: (score: number) => void
}) {
  const [score, setScore] = useState<number | null>(null)
  const [error, setError] = useState('')
  return (
    <main className="study-panel study-panel--post">
      <span className="study-badge">匿名參加者 {participantCode}</span>
      <Icon name="check" size={64} />
      <h1>完成後小問題</h1>
      <p>完成這次練習後，你現在有多大信心自己再做一次？</p>
      <ConfidenceScale name="confidence-after" value={score} onChange={setScore} />
      {error && <p className="field-error" role="alert">{error}</p>}
      <button
        type="button"
        className="primary-button"
        onClick={() => {
          if (score === null) {
            setError('請選擇完成後的信心分數。')
            return
          }
          onSubmit(score)
        }}
      >
        保存後測結果
      </button>
    </main>
  )
}
