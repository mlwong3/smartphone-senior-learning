import type { LevelDefinition, ProgressMap } from '../types'
import { AppIcon } from './AppIcon'
import { Icon } from './Icons'
import './HomeScreen.css'

interface HomeScreenProps {
  levels: LevelDefinition[]
  progress: ProgressMap
  studyMode: boolean
  onOpenLevel: (id: LevelDefinition['id']) => void
  onOpenStudy: () => void
}

export function HomeScreen({
  levels,
  progress,
  studyMode,
  onOpenLevel,
  onOpenStudy,
}: HomeScreenProps) {
  const availableLevels = levels.filter((level) => level.available)
  const completedCount = availableLevels.filter((level) => progress[level.id].completed).length

  return (
    <main className="home-screen">
      <header className="home-screen__header">
        <span className="brand-mark"><Icon name="registration" size={38} /></span>
        <div>
          <h1 className="home-screen__title">智學手機</h1>
          <p className="home-screen__subtitle">長者數碼生活安全練習平台</p>
        </div>
      </header>

      <div className="home-safety" role="note">
        <Icon name="captcha" size={28} />
        <p><strong>放心練習</strong><span>不用真資料、不會建立帳號、不會付款。</span></p>
      </div>

      <section className="progress-card" aria-label="學習進度">
        <div className="progress-card__copy">
          <span>學習進度</span>
          <strong>已完成 {completedCount}／{availableLevels.length} 關</strong>
        </div>
        <div
          className="progress-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={availableLevels.length}
          aria-valuenow={completedCount}
        >
          <span style={{ width: `${availableLevels.length ? (completedCount / availableLevels.length) * 100 : 0}%` }} />
        </div>
      </section>

      <section className="home-screen__levels" aria-labelledby="levels-title">
        <h2 id="levels-title">選擇練習關卡</h2>
        <div className="home-screen__grid">
          {availableLevels.map((level) => (
            <AppIcon
              key={level.id}
              level={level}
              progress={progress[level.id]}
              onOpen={onOpenLevel}
            />
          ))}
        </div>
      </section>

      {studyMode && (
        <button type="button" className="study-entry" onClick={onOpenStudy}>
          <Icon name="chart" size={26} />
          導師測試工具
        </button>
      )}
    </main>
  )
}
