import { useState } from 'react'
import { Icon } from '../../components/Icons'
import { LessonEngine, type LessonController } from '../../components/LessonEngine'
import { LessonLayout } from '../../components/LessonLayout'
import {
  EMAIL_MESSAGES,
  IMAGE_CAPTCHA_CHALLENGES,
  SMS_CHALLENGE,
  TEXT_CAPTCHA_CHALLENGES,
  getImageSelectionFeedback,
  validateSmsCode,
  validateTextCaptcha,
  type EmailMessage,
  type ImageCaptchaChallenge,
  type ImageCaptchaTile,
  type TextCaptchaChallenge,
} from '../../domain/verification'
import type { LessonMetrics } from '../../types'
import './CaptchaLesson.css'

type VerificationStage = 'sms' | 'email-inbox' | 'email-message' | 'text-captcha' | 'image-captcha'
type Scene = 'bus' | 'traffic-light' | 'tree' | 'car' | 'building' | 'bike'

const SCENE_BY_LABEL: Record<ImageCaptchaTile['label'], Scene> = {
  巴士: 'bus',
  交通燈: 'traffic-light',
  樹木: 'tree',
  私家車: 'car',
  大廈: 'building',
  單車: 'bike',
}

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
  return <svg viewBox="0 0 80 60" aria-hidden="true"><circle cx="20" cy="42" r="12" /><circle cx="60" cy="42" r="12" /><path d="m20 42 14-20 11 20H20l12-15h19M34 22h-7M45 18h10" /></svg>
}

function Feedback({ message }: { message: string }) {
  return message ? <p className="feedback-box" role="alert">{message}</p> : null
}

function SmsVerification({
  code,
  feedback,
  onChange,
  onConfirm,
}: {
  code: string
  feedback: string
  onChange: (value: string) => void
  onConfirm: () => void
}) {
  return (
    <section className="verification-card" aria-labelledby="sms-title">
      <div className="verification-card__eyebrow">方法一：短訊驗證</div>
      <h2 id="sms-title">查看練習短訊</h2>
      <p>已向練習電話 <strong>{SMS_CHALLENGE.phone}</strong> 發出一個六位數驗證碼。</p>
      <div className="sms-message" role="note">
        <strong>智學手機</strong>
        <span>練習驗證碼：{SMS_CHALLENGE.code}</span>
        <small>此碼 {SMS_CHALLENGE.expiresInSeconds} 秒內有效，只供本課堂使用。</small>
      </div>
      <div className="form-field">
        <label htmlFor="sms-code">六位數短訊驗證碼</label>
        <input
          id="sms-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(feedback)}
        />
      </div>
      <Feedback message={feedback} />
      <button type="button" className="primary-button" onClick={onConfirm}>確認驗證碼</button>
    </section>
  )
}

function EmailInbox({
  feedback,
  onOpen,
}: {
  feedback: string
  onOpen: (message: EmailMessage) => void
}) {
  return (
    <section className="verification-card" aria-labelledby="inbox-title">
      <div className="verification-card__eyebrow">方法二：電郵驗證</div>
      <h2 id="inbox-title">練習收件匣</h2>
      <p>請找出由「智學手機」發出的帳號確認電郵。</p>
      <div className="inbox-list" aria-label="練習電郵列表">
        {EMAIL_MESSAGES.map((message) => (
          <button
            key={message.id}
            type="button"
            className="email-row"
            aria-label={`${message.sender.split(' <')[0]}：${message.subject}`}
            onClick={() => onOpen(message)}
          >
            <strong>{message.sender}</strong>
            <span>{message.subject}</span>
            <small>{message.preview}</small>
          </button>
        ))}
      </div>
      <Feedback message={feedback} />
    </section>
  )
}

function EmailMessageView({ message, onConfirm }: { message: EmailMessage; onConfirm: () => void }) {
  return (
    <section className="verification-card email-message" aria-labelledby="email-subject">
      <div className="verification-card__eyebrow">已開啟練習電郵</div>
      <h2 id="email-subject">{message.subject}</h2>
      <dl>
        <div><dt>寄件者</dt><dd>{message.sender}</dd></div>
        <div><dt>內容</dt><dd>請確認你正在進行的安全驗證練習。</dd></div>
      </dl>
      <p>真實電郵不會要求你在陌生網頁輸入密碼；本頁只作本機練習。</p>
      <button type="button" className="primary-button" onClick={onConfirm}>確認練習帳號</button>
    </section>
  )
}

function TextCaptcha({
  challenge,
  value,
  feedback,
  alternativeMode,
  onChange,
  onConfirm,
  onRefresh,
  onAlternativeMode,
}: {
  challenge: TextCaptchaChallenge
  value: string
  feedback: string
  alternativeMode: boolean
  onChange: (value: string) => void
  onConfirm: () => void
  onRefresh: () => void
  onAlternativeMode: () => void
}) {
  const characters = challenge.code.split('')
  return (
    <section className="verification-card" aria-labelledby="text-captcha-title">
      <div className="verification-card__eyebrow">方法三：CAPTCHA</div>
      <h2 id="text-captcha-title">文字驗證</h2>
      <p>請輸入下方看到的五位英數碼。英文字母不分大小寫。</p>
      <div
        className={alternativeMode ? 'text-challenge text-challenge--clear' : 'text-challenge'}
        aria-label={`驗證碼 ${characters.join(' ')}`}
      >
        {characters.map((character, index) => <span key={`${character}-${index}`}>{character}</span>)}
      </div>
      {alternativeMode && <p className="a11y-note">已切換清晰文字模式，驗證碼仍然只供本課堂使用。</p>}
      <div className="form-field">
        <label htmlFor="text-captcha-code">輸入看到的五位英數碼</label>
        <input
          id="text-captcha-code"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          maxLength={5}
          autoCapitalize="characters"
          autoComplete="off"
          aria-invalid={Boolean(feedback)}
        />
      </div>
      <Feedback message={feedback} />
      <div className="button-stack">
        <button type="button" className="primary-button" onClick={onConfirm}>確認文字驗證</button>
        <button type="button" className="secondary-button" onClick={onRefresh}>重新整理驗證碼</button>
        <button type="button" className="hint-button" onClick={onAlternativeMode}>使用清晰文字模式</button>
      </div>
    </section>
  )
}

function ImageCaptcha({
  challenge,
  selected,
  feedback,
  onToggle,
  onConfirm,
}: {
  challenge: ImageCaptchaChallenge
  selected: Set<string>
  feedback: string
  onToggle: (id: string) => void
  onConfirm: () => void
}) {
  return (
    <section className="verification-card" aria-labelledby="image-captcha-title">
      <div className="verification-card__eyebrow">方法三：CAPTCHA</div>
      <h2 id="image-captcha-title">請選出所有「{challenge.targetLabel}」</h2>
      <p>點一下圖片選取，再點一次可以取消。</p>
      <div className="captcha-grid">
        {challenge.tiles.map((tile, index) => {
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
              <SceneIllustration scene={SCENE_BY_LABEL[tile.label]} />
              <span>{tile.label}</span>
              {isSelected && <b aria-hidden="true">✓</b>}
            </button>
          )
        })}
      </div>
      <Feedback message={feedback} />
      <button type="button" className="primary-button" onClick={onConfirm}>確認圖片驗證</button>
    </section>
  )
}

function CaptchaJourney({ lesson, onFinished }: { lesson: LessonController; onFinished: () => void }) {
  const [stage, setStage] = useState<VerificationStage>('sms')
  const [smsCode, setSmsCode] = useState('')
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null)
  const [textChallengeIndex, setTextChallengeIndex] = useState(0)
  const [textCode, setTextCode] = useState('')
  const [alternativeMode, setAlternativeMode] = useState(false)
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [feedback, setFeedback] = useState('')
  const textChallenge = TEXT_CAPTCHA_CHALLENGES[textChallengeIndex]
  const imageChallenge = IMAGE_CAPTCHA_CHALLENGES[0]

  function advanceStage(next: VerificationStage) {
    setFeedback('')
    setStage(next)
  }

  function checkSms() {
    const result = validateSmsCode(smsCode)
    if (result === 'correct') {
      advanceStage('email-inbox')
      return
    }
    lesson.recordError()
    setFeedback(result === 'incomplete' ? '尚未輸入六位數，請再查看練習短訊。' : '驗證碼不正確，請由左至右再核對一次。')
  }

  function openEmail(message: EmailMessage) {
    if (!message.correct) {
      setFeedback('這封不是要找的確認電郵，請留意寄件者和主旨。')
      return
    }
    setSelectedEmail(message)
    advanceStage('email-message')
  }

  function checkTextCaptcha() {
    if (validateTextCaptcha(textCode, textChallenge)) {
      advanceStage('image-captcha')
      return
    }
    lesson.recordError()
    setFeedback('文字驗證碼不正確，請由左至右再看一次。')
  }

  function refreshTextCaptcha() {
    lesson.recordHint()
    setTextChallengeIndex((current) => (current + 1) % TEXT_CAPTCHA_CHALLENGES.length)
    setTextCode('')
    setAlternativeMode(false)
    setFeedback('已提供另一組練習驗證碼。')
  }

  function showAlternativeMode() {
    lesson.recordHint()
    setAlternativeMode(true)
    setFeedback('已切換清晰文字模式。')
  }

  function toggleImage(id: string) {
    setSelectedImages((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setFeedback('')
  }

  function checkImages() {
    const result = getImageSelectionFeedback(imageChallenge, selectedImages)
    if (result === 'correct') {
      onFinished()
      return
    }
    lesson.recordError()
    setFeedback(result === 'missing' ? '還有指定圖片未選取，請找出所有「巴士」。' : '有一張不是指定物件，請取消選取。')
  }

  let content
  if (stage === 'sms') content = <SmsVerification code={smsCode} feedback={feedback} onChange={(value) => { setSmsCode(value); setFeedback('') }} onConfirm={checkSms} />
  else if (stage === 'email-inbox') content = <EmailInbox feedback={feedback} onOpen={openEmail} />
  else if (stage === 'email-message' && selectedEmail) content = <EmailMessageView message={selectedEmail} onConfirm={() => advanceStage('text-captcha')} />
  else if (stage === 'text-captcha') content = <TextCaptcha challenge={textChallenge} value={textCode} feedback={feedback} alternativeMode={alternativeMode} onChange={(value) => { setTextCode(value); setFeedback('') }} onConfirm={checkTextCaptcha} onRefresh={refreshTextCaptcha} onAlternativeMode={showAlternativeMode} />
  else content = <ImageCaptcha challenge={imageChallenge} selected={selectedImages} feedback={feedback} onToggle={toggleImage} onConfirm={checkImages} />

  return (
    <>
      <p className="verification-progress" aria-live="polite">目前練習：{stage === 'sms' ? '短訊驗證' : stage.startsWith('email') ? '電郵驗證' : 'CAPTCHA 驗證'}</p>
      {content}
      <button type="button" className="secondary-button verification-replay" onClick={lesson.replayDemo}>再示範一次</button>
    </>
  )
}

export function CaptchaLesson({ onBack, onComplete, onAbandon, onFinish }: CaptchaLessonProps) {
  const finishLesson = onFinish ?? onBack

  return (
    <LessonEngine onComplete={onComplete}>
      {(lesson) => {
        function leave() {
          if (lesson.phase === 'review') {
            finishLesson()
            return
          }
          if (window.confirm('這一關尚未完成，確定返回首頁嗎？')) {
            onAbandon?.(lesson.abandon())
            onBack()
          }
        }
        return <CaptchaContent lesson={lesson} onBack={leave} onFinish={finishLesson} />
      }}
    </LessonEngine>
  )
}

function CaptchaContent({ lesson, onBack, onFinish }: { lesson: LessonController; onBack: () => void; onFinish: () => void }) {
  const [guidedComplete, setGuidedComplete] = useState(false)

  if (lesson.phase === 'demo') return (
    <LessonLayout title="關卡二：安全驗證" phase="demo" heading="示範一次" onBack={onBack}>
      <p className="lesson-intro">安全驗證常見三種方式：查看短訊驗證碼、辨認帳號確認電郵，以及完成 CAPTCHA 驗證。</p>
      <section className="verification-overview" aria-label="三種安全驗證方法">
        <div><strong>1</strong><span>短訊驗證碼</span></div>
        <div><strong>2</strong><span>確認電郵</span></div>
        <div><strong>3</strong><span>文字及圖片 CAPTCHA</span></div>
      </section>
      <p className="a11y-note">所有內容都是固定的本機練習資料，不會發出短訊、電郵或儲存任何輸入。</p>
      <button type="button" className="primary-button" onClick={lesson.finishDemo}>{lesson.isReplay ? '返回練習' : '開始跟着做'}</button>
    </LessonLayout>
  )

  if (lesson.phase === 'guided') {
    if (guidedComplete) return (
      <LessonLayout title="關卡二：安全驗證" phase="guided" heading="準備自己完成" onBack={onBack}>
        <div className="success-card"><Icon name="check" size={46} /><p>你已完成三種驗證方法。下一步請自己完成一次。</p></div>
        <button type="button" className="primary-button" onClick={lesson.beginIndependent}>開始自己完成</button>
        <button type="button" className="secondary-button" onClick={lesson.replayDemo}>再示範一次</button>
      </LessonLayout>
    )
    return <LessonLayout title="關卡二：安全驗證" phase="guided" heading="跟着做" onBack={onBack}><CaptchaJourney key="guided" lesson={lesson} onFinished={() => setGuidedComplete(true)} /></LessonLayout>
  }

  if (lesson.phase === 'independent') return (
    <LessonLayout title="關卡二：安全驗證" phase="independent" heading="自己完成" onBack={onBack}>
      <p className="lesson-intro">請自行完成三種安全驗證。需要時可重新整理或使用清晰文字模式。</p>
      <CaptchaJourney key="independent" lesson={lesson} onFinished={lesson.complete} />
    </LessonLayout>
  )

  return (
    <LessonLayout title="關卡二：安全驗證" phase="review" heading="安全驗證練習完成" onBack={onBack}>
      <div className="success-card success-card--large"><Icon name="check" size={58} /><p>做得好！你已完成短訊、電郵及 CAPTCHA 安全驗證。</p></div>
      <div className="metrics-row"><div><strong>{lesson.metrics.durationSeconds}</strong><span>秒</span></div><div><strong>{lesson.metrics.errorCount}</strong><span>次錯誤</span></div><div><strong>{lesson.metrics.hintCount}</strong><span>次提示</span></div></div>
      <section className="review-card"><h2>安全小貼士</h2><ul><li>只在自己預期收到的短訊或電郵中核對驗證資料。</li><li>看清寄件者、主旨和網站地址才確認。</li><li>文字看不清楚時，可使用替代模式或重新整理。</li></ul></section>
      <button type="button" className="primary-button" aria-label="完成回顧並返回首頁" onClick={onFinish}>返回首頁</button>
    </LessonLayout>
  )
}
