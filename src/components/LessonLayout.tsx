import { useEffect, type ReactNode } from 'react'
import type { LessonPhase } from '../types'
import { Icon } from './Icons'
import './LessonLayout.css'

const PHASE_STEP: Record<LessonPhase, number> = {
  demo: 1,
  guided: 2,
  independent: 3,
  review: 4,
}

interface LessonLayoutProps {
  title: string
  phase: LessonPhase
  heading: string
  contentKey?: string
  onBack: () => void
  children: ReactNode
}

export function LessonLayout({ title, phase, heading, contentKey, onBack, children }: LessonLayoutProps) {
  useEffect(() => {
    const phoneContent = document.querySelector<HTMLElement>('.phone-frame__content')
    if (phoneContent) phoneContent.scrollTop = 0
  }, [phase, heading, contentKey])

  return (
    <main className="lesson-layout">
      <div className="lesson-layout__topline">
        <button type="button" className="back-button" onClick={onBack}>
          <Icon name="home" size={22} />
          返回首頁
        </button>
        <span className="step-pill">第 {PHASE_STEP[phase]} 步／共 4 步</span>
      </div>
      <p className="lesson-layout__level-name">{title}</p>
      <div className="safety-banner" role="note">
        <Icon name="captcha" size={24} />
        <span>練習模式：不用真資料、不會建立帳號、不會付款。</span>
      </div>
      <h1 className="lesson-layout__heading">{heading}</h1>
      {children}
    </main>
  )
}
