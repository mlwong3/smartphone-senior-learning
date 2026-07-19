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
  onResetProgress: () => void
}

export function HomeScreen({
  levels,
  progress,
  studyMode,
  onOpenLevel,
  onOpenStudy,
  onResetProgress,
}: HomeScreenProps) {
  const availableLevels = levels.filter((level) => level.available)
  const completedCount = availableLevels.filter((level) => progress[level.id].completed).length
  const allCompleted = availableLevels.length > 0 && completedCount === availableLevels.length

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
          aria-label={`學習進度：已完成 ${completedCount}／${availableLevels.length} 關`}
          aria-valuemin={0}
          aria-valuemax={availableLevels.length}
          aria-valuenow={completedCount}
        >
          <span style={{ width: `${availableLevels.length ? (completedCount / availableLevels.length) * 100 : 0}%` }} />
        </div>
      </section>

      {allCompleted && (
        <section className="completion-summary" aria-labelledby="completion-title">
          <Icon name="check" size={52} />
          <div>
            <h2 id="completion-title">恭喜完成三關練習</h2>
            <p>你已完成數碼生活安全練習，可以按需要再次練習。</p>
          </div>
          <ul>
            <li><strong>註冊帳號：</strong>密碼要有足夠長度、英文及數字。</li>
            <li><strong>安全驗證：</strong>先看清題目，再逐格檢查。</li>
            <li><strong>外賣點餐：</strong>先看總額和數量，最後才確認。</li>
          </ul>
          <button type="button" className="restart-button" onClick={onResetProgress}>
            重新練習全部關卡
          </button>
        </section>
      )}

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
