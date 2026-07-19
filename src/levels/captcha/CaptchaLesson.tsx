import { useState } from 'react'
import { Icon } from '../../components/Icons'
import { LessonEngine, type LessonController } from '../../components/LessonEngine'
import { LessonLayout } from '../../components/LessonLayout'
import type { LessonMetrics } from '../../types'
import './CaptchaLesson.css'

type Scene = 'bus' | 'traffic-light' | 'tree' | 'car' | 'building' | 'bike' | 'bench'

interface Tile {
  id: string
  scene: Scene
  label: string
  target: boolean
}

const GUIDED_TILES: Tile[] = [
  { id: 'g1', scene: 'bus', label: '巴士', target: true },
  { id: 'g2', scene: 'tree', label: '樹木', target: false },
  { id: 'g3', scene: 'building', label: '大廈', target: false },
  { id: 'g4', scene: 'car', label: '私家車', target: false },
  { id: 'g5', scene: 'bus', label: '巴士', target: true },
  { id: 'g6', scene: 'bike', label: '單車', target: false },
  { id: 'g7', scene: 'bench', label: '長椅', target: false },
  { id: 'g8', scene: 'car', label: '私家車', target: false },
  { id: 'g9', scene: 'bus', label: '巴士', target: true },
]

const INDEPENDENT_TILES: Tile[] = [
  { id: 'i1', scene: 'tree', label: '樹木', target: false },
  { id: 'i2', scene: 'traffic-light', label: '交通燈', target: true },
  { id: 'i3', scene: 'bus', label: '巴士', target: false },
  { id: 'i4', scene: 'traffic-light', label: '交通燈', target: true },
  { id: 'i5', scene: 'car', label: '私家車', target: false },
  { id: 'i6', scene: 'bench', label: '長椅', target: false },
  { id: 'i7', scene: 'bike', label: '單車', target: false },
  { id: 'i8', scene: 'traffic-light', label: '交通燈', target: true },
  { id: 'i9', scene: 'building', label: '大廈', target: false },
]

interface CaptchaLessonProps {
  onBack: () => void
  onComplete: (metrics: LessonMetrics) => void
  onAbandon?: (metrics: LessonMetrics) => void
  onFinish?: () => void
}

function SceneIllustration({ scene }: { scene: Scene }) {
  if (scene === 'bus') return <svg viewBox="0 0 80 60" aria-hidden="true"><rect x="8" y="13" width="64" height="35" rx="7" /><path d="M16 20h13v13H16zm18 0h13v13H34zm18 0h12v13H52z" /><circle cx="23" cy="50" r="5" /><circle cx="58" cy="50" r="5" /></svg>
  if (scene === 'traffic-light') return <svg viewBox="0 0 80 60" aria-hidden="true"><rect x="29" y="4" width="22" height="43" rx="5" /><circle cx="40" cy="14" r="5" /><circle cx="40" cy="25" r="5" /><circle cx="40" cy="36" r="5" /><path d="M40 47v10M28 57h24" /></svg>
  if (scene === 'tree') return <svg viewBox="0 0 80 60" aria-hidden="true"><circle cx="40" cy="23" r="18" /><path d="M40 40v17M30 57h20" /></svg>
  if (scene === 'car') return <svg viewBox="0 0 80 60" aria-hidden="true"><path d="M12 39v-13h10l9-11h23l9 11h6v13Z" /><circle cx="24" cy="42" r="6" /><circle cx="58" cy="42" r="6" /></svg>
  if (scene === 'building') return <svg viewBox="0 0 80 60" aria-hidden="true"><rect x="20" y="6" width="40" height="51" /><path d="M29 16h7M44 16h7M29 26h7M44 26h7M29 36h7M44 36h7M36 57V45h9v12" /></svg>
  if (scene === 'bike') return <svg viewBox="0 0 80 60" aria-hidden="true"><circle cx="20" cy="42" r="12" /><circle cx="60" cy="42" r="12" /><path d="m20 42 14-20 11 20H20l12-15h19M34 22h-7M45 18h10" /></svg>
  return <svg viewBox="0 0 80 60" aria-hidden="true"><path d="M13 30h54M18 30v20M62 30v20M20 20h40l7 10H13Z" /></svg>
}

function ImageChallenge({
  targetName,
  tiles,
  selected,
  onToggle,
}: {
  targetName: string
  tiles: Tile[]
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  return (
    <section className="captcha-card">
      <h2>請選出所有「{targetName}」</h2>
      <p>點一下圖片選取，再點一次可以取消。</p>
      <div className="captcha-grid">
        {tiles.map((tile, index) => {
          const isSelected = selected.has(tile.id)
          return (
            <button
              key={tile.id}
              type="button"
              className={isSelected ? 'captcha-tile is-selected' : 'captcha-tile'}
              aria-pressed={isSelected}
              aria-label={`圖片 ${index + 1}：${tile.label}，${isSelected ? '已選取' : '未選取'}`}
              onClick={() => onToggle(tile.id)}
            >
              <SceneIllustration scene={tile.scene} />
              <span>{tile.label}</span>
              {isSelected && <b aria-hidden="true">✓</b>}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function selectionFeedback(tiles: Tile[], selected: Set<string>): string | null {
  const missing = tiles.some((tile) => tile.target && !selected.has(tile.id))
  const extra = tiles.some((tile) => !tile.target && selected.has(tile.id))
  if (missing && extra) return '請再看看：還有指定圖片未選取，也有一張不是指定物件。'
  if (missing) return '還有圖片需要再看看，請找出餘下的指定物件。'
  if (extra) return '有一張不是指定物件，請取消選取。'
  return null
}

export function CaptchaLesson({ onBack, onComplete, onAbandon, onFinish }: CaptchaLessonProps) {
  return (
    <LessonEngine onComplete={onComplete}>
      {(lesson) => {
        function leave() {
          if (lesson.phase === 'review' || window.confirm('這一關尚未完成，確定返回首頁嗎？')) {
            if (lesson.phase !== 'review') onAbandon?.(lesson.abandon())
            onBack()
          }
        }
        return <CaptchaContent lesson={lesson} onBack={leave} onFinish={onFinish ?? onBack} />
      }}
    </LessonEngine>
  )
}

function CaptchaContent({ lesson, onBack, onFinish }: { lesson: LessonController; onBack: () => void; onFinish: () => void }) {
  const [guidedSelected, setGuidedSelected] = useState<Set<string>>(new Set())
  const [independentSelected, setIndependentSelected] = useState<Set<string>>(new Set())
  const [guidedComplete, setGuidedComplete] = useState(false)
  const [independentStage, setIndependentStage] = useState<'image' | 'text'>('image')
  const [feedback, setFeedback] = useState('')
  const [textCode, setTextCode] = useState('')

  function toggle(selected: Set<string>, setSelected: (value: Set<string>) => void, id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
    setFeedback('')
  }

  function checkImages(tiles: Tile[], selected: Set<string>, success: () => void) {
    const message = selectionFeedback(tiles, selected)
    if (message) {
      lesson.recordError()
      setFeedback(message)
      return
    }
    setFeedback('')
    success()
  }

  if (lesson.phase === 'demo') return (
    <LessonLayout title="關卡二：安全驗證" phase="demo" heading="示範一次" onBack={onBack}>
      <p className="lesson-intro">安全驗證會要求你選出指定圖片。選中的圖片會有藍色外框、剔號和「已選取」狀態。</p>
      <div className="captcha-demo"><SceneIllustration scene="bus" /><Icon name="check" size={40} /><strong>看到巴士，就點一下圖片。</strong></div>
      <p className="a11y-note">這是教學模擬，不是真正保安驗證；屏幕閱讀器可讀出圖片內容。</p>
      <button type="button" className="primary-button" onClick={lesson.finishDemo}>{lesson.isReplay ? '返回練習' : '開始跟着做'}</button>
    </LessonLayout>
  )

  if (lesson.phase === 'guided') {
    if (guidedComplete) return (
      <LessonLayout title="關卡二：安全驗證" phase="guided" heading="準備自己完成" onBack={onBack}>
        <div className="success-card"><Icon name="check" size={46} /><p>你已正確選出全部巴士。下一步請自己完成另一道圖片題和文字題。</p></div>
        <button type="button" className="primary-button" onClick={lesson.beginIndependent}>開始自己完成</button>
        <button type="button" className="secondary-button" onClick={lesson.replayDemo}>再示範一次</button>
      </LessonLayout>
    )
    return (
      <LessonLayout title="關卡二：安全驗證" phase="guided" heading="跟着做" onBack={onBack}>
        <ImageChallenge targetName="巴士" tiles={GUIDED_TILES} selected={guidedSelected} onToggle={(id) => toggle(guidedSelected, setGuidedSelected, id)} />
        {feedback && <p className="feedback-box" role="alert">{feedback}</p>}
        <div className="button-stack">
          <button type="button" className="primary-button" onClick={() => checkImages(GUIDED_TILES, guidedSelected, () => setGuidedComplete(true))}>檢查圖片</button>
          <button type="button" className="hint-button" onClick={() => { lesson.recordHint(); setFeedback('提示：巴士通常是長方形，車身較長，並有多個車窗。') }}>給我提示</button>
          <button type="button" className="secondary-button" onClick={lesson.replayDemo}>再示範一次</button>
        </div>
      </LessonLayout>
    )
  }

  if (lesson.phase === 'independent') {
    if (independentStage === 'text') return (
      <LessonLayout title="關卡二：安全驗證" phase="independent" heading="文字驗證" onBack={onBack}>
        <p className="lesson-intro">請輸入下方看到的五位英數碼。英文字母大小寫均可。</p>
        <div className="text-challenge" aria-label="驗證碼 H K 6 2 8"><span>H</span><span>K</span><span>6</span><span>2</span><span>8</span></div>
        <div className="form-field">
          <label htmlFor="captcha-code">輸入看到的五位英數碼</label>
          <input id="captcha-code" value={textCode} onChange={(event) => { setTextCode(event.target.value); setFeedback('') }} maxLength={5} autoCapitalize="characters" />
        </div>
        {feedback && <p className="feedback-box" role="alert">{feedback}</p>}
        <button type="button" className="primary-button" onClick={() => {
          if (textCode.trim().toUpperCase() !== 'HK628') {
            lesson.recordError(); setFeedback('還差一點，請由左至右再看一次五個字。'); return
          }
          lesson.complete()
        }}>完成安全驗證</button>
      </LessonLayout>
    )
    return (
      <LessonLayout title="關卡二：安全驗證" phase="independent" heading="自己完成" onBack={onBack}>
        <ImageChallenge targetName="交通燈" tiles={INDEPENDENT_TILES} selected={independentSelected} onToggle={(id) => toggle(independentSelected, setIndependentSelected, id)} />
        {feedback && <p className="feedback-box" role="alert">{feedback}</p>}
        <div className="button-stack">
          <button type="button" className="primary-button" onClick={() => checkImages(INDEPENDENT_TILES, independentSelected, () => setIndependentStage('text'))}>檢查圖片</button>
          <button type="button" className="hint-button" onClick={() => { lesson.recordHint(); setFeedback('提示：交通燈通常有紅、黃、綠三個直排燈號。') }}>給我提示</button>
          <button type="button" className="secondary-button" onClick={lesson.replayDemo}>再示範一次</button>
        </div>
      </LessonLayout>
    )
  }

  return (
    <LessonLayout title="關卡二：安全驗證" phase="review" heading="安全驗證練習完成" onBack={onBack}>
      <div className="success-card success-card--large"><Icon name="check" size={58} /><p>做得好！你已完成圖片和文字安全驗證。</p></div>
      <div className="metrics-row"><div><strong>{lesson.metrics.durationSeconds}</strong><span>秒</span></div><div><strong>{lesson.metrics.errorCount}</strong><span>次錯誤</span></div><div><strong>{lesson.metrics.hintCount}</strong><span>次提示</span></div></div>
      <section className="review-card"><h2>記住兩件事</h2><ul><li>看清楚指定物件才開始選圖。</li><li>文字看不清楚時，可以重新整理或使用替代模式。</li></ul></section>
      <button type="button" className="primary-button" aria-label="完成回顧並返回首頁" onClick={onFinish}>返回首頁</button>
    </LessonLayout>
  )
}
