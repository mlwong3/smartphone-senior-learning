import { useEffect, useMemo, useState } from 'react'
import { AccessibilityToolbar } from './components/AccessibilityToolbar'
import { HomeScreen } from './components/HomeScreen'
import { PhoneFrame } from './components/PhoneFrame'
import { levels } from './data/levels'
import { RegistrationLesson } from './levels/registration/RegistrationLesson'
import {
  loadProgress,
  loadSettings,
  saveProgress,
  saveSettings,
} from './services/storage'
import type { LessonMetrics, LevelId, ProgressMap, ScreenId, UserSettings } from './types'

const PAGE_TEXT: Record<ScreenId, string> = {
  home: '歡迎使用智學手機。請選擇一個已開放的關卡開始練習。',
  registration: '註冊帳號練習。請使用畫面提供的虛構資料，不要輸入真實個人資料。',
  captcha: '安全驗證練習。請按題目選出指定圖片。',
  ordering: '外賣點餐練習。這是練習模式，不會付款。',
  study: '導師測試工具。只使用匿名參加者代碼。',
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home')
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress())
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings())
  const studyMode = useMemo(
    () => new URLSearchParams(window.location.search).get('study') === '1',
    [],
  )

  useEffect(() => {
    document.documentElement.style.setProperty('--user-font-scale', String(settings.fontScale))
    document.documentElement.style.fontSize = `${20 * settings.fontScale}px`
    saveSettings(settings)
  }, [settings])

  function updateProgress(next: ProgressMap) {
    setProgress(next)
    saveProgress(next)
  }

  function completeLevel(id: LevelId, _metrics: LessonMetrics) {
    const currentLevel = levels.find((level) => level.id === id)
    const nextLevel = levels.find((level) => level.order === (currentLevel?.order ?? 0) + 1)
    const nextProgress: ProgressMap = {
      ...progress,
      [id]: { unlocked: true, completed: true },
      ...(nextLevel
        ? { [nextLevel.id]: { ...progress[nextLevel.id], unlocked: true } }
        : {}),
    }
    updateProgress(nextProgress)
  }

  let content
  if (screen === 'registration') {
    content = (
      <RegistrationLesson
        onBack={() => setScreen('home')}
        onComplete={(metrics) => completeLevel('registration', metrics)}
      />
    )
  } else {
    content = (
      <HomeScreen
        levels={levels}
        progress={progress}
        studyMode={studyMode}
        onOpenLevel={(id) => setScreen(id)}
        onOpenStudy={() => setScreen('study')}
      />
    )
  }

  return (
    <PhoneFrame>
      <AccessibilityToolbar
        settings={settings}
        pageText={PAGE_TEXT[screen]}
        onChange={setSettings}
      />
      {content}
    </PhoneFrame>
  )
}
