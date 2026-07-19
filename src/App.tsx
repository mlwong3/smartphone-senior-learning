import { useState } from 'react'
import { PhoneFrame } from './components/PhoneFrame'
import { HomeScreen } from './components/HomeScreen'
import { LevelPlaceholder } from './components/LevelPlaceholder'
import { levels, initialProgress } from './data/levels'
import type { Level, ProgressMap, ScreenId } from './types'

export default function App() {
  // 目前畫面：首頁或某一關卡
  const [screen, setScreen] = useState<ScreenId>('home')
  // 關卡進度（解鎖 / 完成）。此階段存在 React state，階段三改接 localStorage。
  const [progress, setProgress] = useState<ProgressMap>(initialProgress)

  // 標記某關完成，並解鎖下一關。
  function completeLevel(id: Level['id']) {
    const current = levels.find((l) => l.id === id)
    const next = levels.find((l) => l.order === (current?.order ?? 0) + 1)

    setProgress((prev) => ({
      ...prev,
      [id]: { ...prev[id], completed: true },
      ...(next ? { [next.id]: { ...prev[next.id], unlocked: true } } : {}),
    }))
    setScreen('home')
  }

  const activeLevel =
    screen === 'home' ? null : levels.find((l) => l.id === screen) ?? null

  return (
    <PhoneFrame>
      {activeLevel ? (
        <LevelPlaceholder
          level={activeLevel}
          onBack={() => setScreen('home')}
          onComplete={completeLevel}
        />
      ) : (
        <HomeScreen
          levels={levels}
          progress={progress}
          onOpenLevel={(id) => setScreen(id)}
        />
      )}
    </PhoneFrame>
  )
}
