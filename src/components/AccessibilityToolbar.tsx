import { useState } from 'react'
import { speakText } from '../services/speech'
import type { FontScale, UserSettings } from '../types'
import { Icon } from './Icons'
import './AccessibilityToolbar.css'

interface AccessibilityToolbarProps {
  settings: UserSettings
  pageText: string
  onChange: (settings: UserSettings) => void
}

const SCALES: FontScale[] = [1, 1.15, 1.3]

export function AccessibilityToolbar({
  settings,
  pageText,
  onChange,
}: AccessibilityToolbarProps) {
  const [speechMessage, setSpeechMessage] = useState('')
  const scaleIndex = SCALES.indexOf(settings.fontScale)

  function setScale(nextIndex: number) {
    const fontScale = SCALES[Math.max(0, Math.min(SCALES.length - 1, nextIndex))]
    onChange({ ...settings, fontScale })
  }

  function readPage() {
    const available = speakText(pageText)
    onChange({ ...settings, speechEnabled: available })
    setSpeechMessage(
      available ? '正在讀出本頁提示。' : '裝置未有可用語音，請閱讀畫面文字。',
    )
  }

  return (
    <div className="accessibility-toolbar" aria-label="閱讀輔助工具">
      <div className="accessibility-toolbar__text-controls" aria-label="文字大小">
        <button
          type="button"
          className="tool-button tool-button--text"
          aria-label="縮小文字"
          disabled={scaleIndex === 0}
          onClick={() => setScale(scaleIndex - 1)}
        >
          A−
        </button>
        <button
          type="button"
          className="tool-button tool-button--text"
          aria-label="放大文字"
          disabled={scaleIndex === SCALES.length - 1}
          onClick={() => setScale(scaleIndex + 1)}
        >
          A＋
        </button>
      </div>
      <button type="button" className="tool-button tool-button--speech" onClick={readPage}>
        <Icon name="volume" size={22} />
        <span>讀出提示</span>
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {speechMessage}
      </span>
    </div>
  )
}
