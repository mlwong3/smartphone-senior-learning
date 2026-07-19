import { useEffect, useMemo, useState } from 'react'
import { AccessibilityToolbar } from './components/AccessibilityToolbar'
import { HomeScreen } from './components/HomeScreen'
import { PhoneFrame } from './components/PhoneFrame'
import {
  PostConfidencePanel,
  StudyPanel,
  type StudyStartValues,
} from './components/StudyPanel'
import { levels } from './data/levels'
import {
  buildStudyCsv,
  createStudySession,
  getNextAttemptNo,
} from './domain/study'
import { CaptchaLesson } from './levels/captcha/CaptchaLesson'
import { OrderingLesson } from './levels/ordering/OrderingLesson'
import { RegistrationLesson } from './levels/registration/RegistrationLesson'
import {
  clearStudySessions,
  DEFAULT_PROGRESS,
  loadProgress,
  loadSessions,
  loadSettings,
  saveProgress,
  saveSessions,
  saveSettings,
} from './services/storage'
import type {
  ActiveStudyContext,
  LessonMetrics,
  LevelId,
  ProgressMap,
  ScreenId,
  StudySessionRecord,
  UserSettings,
} from './types'

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
  const [sessions, setSessions] = useState<StudySessionRecord[]>(() => loadSessions())
  const [activeStudy, setActiveStudy] = useState<ActiveStudyContext | null>(null)
  const [pendingMetrics, setPendingMetrics] = useState<LessonMetrics | null>(null)
  const [showPostConfidence, setShowPostConfidence] = useState(false)
  const studyMode = useMemo(
    () => new URLSearchParams(window.location.search).get('study') === '1',
    [],
  )

  useEffect(() => {
    document.documentElement.style.setProperty('--user-font-scale', String(settings.fontScale))
    document.documentElement.style.fontSize = `${20 * settings.fontScale}px`
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    const phoneContent = document.querySelector<HTMLElement>('.phone-frame__content')
    if (phoneContent) phoneContent.scrollTop = 0
  }, [screen, showPostConfidence])

  function updateProgress(next: ProgressMap) {
    setProgress(next)
    saveProgress(next)
  }

  function completeLevel(id: LevelId) {
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

  function startStudy(values: StudyStartValues) {
    const context: ActiveStudyContext = {
      ...values,
      attemptNo: getNextAttemptNo(sessions, values.participantCode, values.levelId),
    }
    setActiveStudy(context)
    setPendingMetrics(null)
    setShowPostConfidence(false)
    setScreen(values.levelId)
  }

  function handleLessonComplete(id: LevelId, metrics: LessonMetrics) {
    if (activeStudy) {
      setPendingMetrics(metrics)
      return
    }
    completeLevel(id)
  }

  function appendSession(record: StudySessionRecord) {
    const next = [...sessions, record]
    setSessions(next)
    saveSessions(next)
  }

  function handleAbandon(metrics: LessonMetrics) {
    if (activeStudy) appendSession(createStudySession(activeStudy, metrics))
    setActiveStudy(null)
    setPendingMetrics(null)
    setShowPostConfidence(false)
  }

  function savePostConfidence(score: number) {
    if (!activeStudy || !pendingMetrics) return
    appendSession(createStudySession(activeStudy, pendingMetrics, score))
    completeLevel(activeStudy.levelId)
    setActiveStudy(null)
    setPendingMetrics(null)
    setShowPostConfidence(false)
    setScreen('study')
  }

  function exportCsv() {
    const blob = new Blob([buildStudyCsv(sessions)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `smartphone-learning-study-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function clearSessions() {
    if (!window.confirm('確定清除全部匿名測試紀錄嗎？這個動作不能還原。')) return
    clearStudySessions()
    setSessions([])
  }

  function resetProgress() {
    if (!window.confirm('確定重新練習全部關卡嗎？完成進度將會重設。')) return
    updateProgress(structuredClone(DEFAULT_PROGRESS))
  }

  let content
  if (showPostConfidence && activeStudy && pendingMetrics) {
    content = (
      <PostConfidencePanel
        participantCode={activeStudy.participantCode}
        onSubmit={savePostConfidence}
      />
    )
  } else if (screen === 'study' && studyMode) {
    content = (
      <StudyPanel
        sessions={sessions}
        progress={progress}
        onStart={startStudy}
        onBack={() => setScreen('home')}
        onExport={exportCsv}
        onClear={clearSessions}
      />
    )
  } else if (screen === 'registration') {
    content = (
      <RegistrationLesson
        onBack={() => setScreen('home')}
        onComplete={(metrics) => handleLessonComplete('registration', metrics)}
        onAbandon={handleAbandon}
        onFinish={() => {
          if (activeStudy && pendingMetrics) setShowPostConfidence(true)
          else setScreen('home')
        }}
      />
    )
  } else if (screen === 'captcha') {
    content = (
      <CaptchaLesson
        onBack={() => setScreen('home')}
        onComplete={(metrics) => handleLessonComplete('captcha', metrics)}
        onAbandon={handleAbandon}
        onFinish={() => {
          if (activeStudy && pendingMetrics) setShowPostConfidence(true)
          else setScreen('home')
        }}
      />
    )
  } else if (screen === 'ordering') {
    content = (
      <OrderingLesson
        onBack={() => setScreen('home')}
        onComplete={(metrics) => handleLessonComplete('ordering', metrics)}
        onAbandon={handleAbandon}
        onFinish={() => {
          if (activeStudy && pendingMetrics) setShowPostConfidence(true)
          else setScreen('home')
        }}
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
        onResetProgress={resetProgress}
      />
    )
  }

  return (
    <PhoneFrame>
      <AccessibilityToolbar
        settings={settings}
        pageText={showPostConfidence ? '請選擇完成練習後的信心分數。' : PAGE_TEXT[screen]}
        onChange={setSettings}
      />
      {content}
    </PhoneFrame>
  )
}
