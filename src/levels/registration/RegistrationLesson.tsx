import { useState } from 'react'
import {
  getPasswordChecks,
  validateRegistration,
  type PracticeIdentity,
  type RegistrationErrors,
  type RegistrationValues,
} from '../../domain/registration'
import { LessonEngine, type LessonController } from '../../components/LessonEngine'
import { LessonLayout } from '../../components/LessonLayout'
import { Icon } from '../../components/Icons'
import type { LessonMetrics } from '../../types'
import './RegistrationLesson.css'

const DEMO_VALUES = {
  name: '陳美玲',
  phone: '9123 4567',
  password: 'Learn2026',
}

const GUIDED_IDENTITY: PracticeIdentity = { name: '李好學', phone: '9876 5432' }
const GUIDED_PASSWORD = 'Safe1234'
const INDEPENDENT_IDENTITY: PracticeIdentity = { name: '陳安心', phone: '6123 4567' }

const EMPTY_VALUES: RegistrationValues = { name: '', phone: '', password: '' }

interface RegistrationLessonProps {
  onBack: () => void
  onComplete: (metrics: LessonMetrics) => void
  onAbandon?: (metrics: LessonMetrics) => void
}

function PracticeDataCard({
  identity,
  password,
  createPassword = false,
}: {
  identity: PracticeIdentity
  password?: string
  createPassword?: boolean
}) {
  return (
    <section className="practice-card" aria-label="虛構練習資料卡">
      <div className="practice-card__title">
        <Icon name="registration" size={26} />
        虛構練習資料
      </div>
      <dl>
        <div>
          <dt>姓名</dt>
          <dd>{identity.name}</dd>
        </div>
        <div>
          <dt>電話</dt>
          <dd>{identity.phone}</dd>
        </div>
        <div>
          <dt>密碼</dt>
          <dd>{createPassword ? '請自行建立合規密碼' : password}</dd>
        </div>
      </dl>
    </section>
  )
}

function PasswordRequirements({ password }: { password: string }) {
  const checks = getPasswordChecks(password)
  return (
    <ul className="password-rules" aria-label="密碼要求">
      <li className={checks.minLength ? 'is-met' : ''}>
        {checks.minLength ? '✓' : '○'} 至少 8 個字
      </li>
      <li className={checks.hasLetter ? 'is-met' : ''}>
        {checks.hasLetter ? '✓' : '○'} 有英文字母
      </li>
      <li className={checks.hasNumber ? 'is-met' : ''}>
        {checks.hasNumber ? '✓' : '○'} 有數字
      </li>
    </ul>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-row">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-rules${error ? ` ${id}-error` : ''}`}
          autoComplete="off"
        />
        <button
          type="button"
          className="password-toggle"
          aria-label={visible ? '隱藏密碼' : '顯示密碼'}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? '隱藏' : '顯示'}
        </button>
      </div>
      <div id={`${id}-rules`}>
        <PasswordRequirements password={value} />
      </div>
      {error && (
        <p id={`${id}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export function RegistrationLesson({
  onBack,
  onComplete,
  onAbandon,
}: RegistrationLessonProps) {
  return (
    <LessonEngine onComplete={onComplete}>
      {(lesson) => {
        function leaveLesson() {
          if (lesson.phase === 'review' || window.confirm('這一關尚未完成，確定返回首頁嗎？')) {
            if (lesson.phase !== 'review') onAbandon?.(lesson.abandon())
            onBack()
          }
        }

        return (
          <RegistrationContent
            lesson={lesson}
            onBack={leaveLesson}
          />
        )
      }}
    </LessonEngine>
  )
}

function RegistrationContent({
  lesson,
  onBack,
}: {
  lesson: LessonController
  onBack: () => void
}) {
  const [guidedStep, setGuidedStep] = useState(0)
  const [guidedComplete, setGuidedComplete] = useState(false)
  const [guidedValues, setGuidedValues] = useState<RegistrationValues>({ ...EMPTY_VALUES })
  const [guidedError, setGuidedError] = useState('')
  const [independentValues, setIndependentValues] = useState<RegistrationValues>({ ...EMPTY_VALUES })
  const [independentErrors, setIndependentErrors] = useState<RegistrationErrors>({})
  const [hint, setHint] = useState('')

  function updateGuided(key: keyof RegistrationValues, value: string) {
    setGuidedValues((current) => ({ ...current, [key]: value }))
    setGuidedError('')
  }

  function checkGuided() {
    const completeValues: RegistrationValues = {
      name: guidedStep === 0 ? guidedValues.name : GUIDED_IDENTITY.name,
      phone: guidedStep === 1 ? guidedValues.phone : GUIDED_IDENTITY.phone,
      password: guidedStep === 2 ? guidedValues.password : GUIDED_PASSWORD,
    }
    const errors = validateRegistration(completeValues, GUIDED_IDENTITY)
    const key: keyof RegistrationValues = ['name', 'phone', 'password'][guidedStep] as keyof RegistrationValues
    if (errors[key]) {
      lesson.recordError()
      setGuidedError(errors[key] ?? '')
      return
    }
    if (guidedStep < 2) setGuidedStep((current) => current + 1)
    else setGuidedComplete(true)
  }

  function askForHint(message: string) {
    lesson.recordHint()
    setHint(message)
  }

  function checkIndependent() {
    const errors = validateRegistration(independentValues, INDEPENDENT_IDENTITY)
    if (Object.keys(errors).length) {
      lesson.recordError()
      setIndependentErrors(errors)
      return
    }
    setIndependentErrors({})
    lesson.complete()
  }

  if (lesson.phase === 'demo') {
    return (
      <LessonLayout title="關卡一：註冊帳號" phase="demo" heading="示範一次" onBack={onBack}>
        <p className="lesson-intro">先看清楚資料卡，再逐格輸入。密碼可以按「顯示」核對。</p>
        <PracticeDataCard identity={DEMO_VALUES} password={DEMO_VALUES.password} />
        <ol className="demo-list">
          <li>先輸入姓名和8位電話。</li>
          <li>密碼最少8個字，並要有英文和數字。</li>
          <li>全部資料只供練習，不會保存。</li>
        </ol>
        <button type="button" className="primary-button" onClick={lesson.finishDemo}>
          {lesson.isReplay ? '返回練習' : '開始跟着做'}
        </button>
      </LessonLayout>
    )
  }

  if (lesson.phase === 'guided') {
    if (guidedComplete) {
      return (
        <LessonLayout title="關卡一：註冊帳號" phase="guided" heading="準備自己完成" onBack={onBack}>
          <div className="success-card">
            <Icon name="check" size={46} />
            <p>你已完成跟着做。下一步不會逐格提示，試試自己完成一次。</p>
          </div>
          <button type="button" className="primary-button" onClick={lesson.beginIndependent}>
            開始自己完成
          </button>
          <button type="button" className="secondary-button" onClick={lesson.replayDemo}>
            再示範一次
          </button>
        </LessonLayout>
      )
    }

    const keys: (keyof RegistrationValues)[] = ['name', 'phone', 'password']
    const labels = ['練習姓名', '練習電話', '練習密碼']
    const key = keys[guidedStep]
    return (
      <LessonLayout title="關卡一：註冊帳號" phase="guided" heading="跟着做" onBack={onBack}>
        <p className="substep">小步驟 {guidedStep + 1}／3：{labels[guidedStep]}</p>
        <PracticeDataCard identity={GUIDED_IDENTITY} password={GUIDED_PASSWORD} />
        {key === 'password' ? (
          <PasswordField
            id="guided-password"
            label="練習密碼"
            value={guidedValues.password}
            onChange={(value) => updateGuided('password', value)}
            error={guidedError}
          />
        ) : (
          <div className="form-field">
            <label htmlFor={`guided-${key}`}>{labels[guidedStep]}</label>
            <input
              id={`guided-${key}`}
              inputMode={key === 'phone' ? 'tel' : 'text'}
              value={guidedValues[key]}
              onChange={(event) => updateGuided(key, event.target.value)}
              aria-invalid={Boolean(guidedError)}
              aria-describedby={guidedError ? 'guided-error' : undefined}
            />
            {guidedError && (
              <p id="guided-error" className="field-error" role="alert">
                {guidedError}
              </p>
            )}
          </div>
        )}
        {hint && <p className="hint-panel">{hint}</p>}
        <div className="button-stack">
          <button type="button" className="primary-button" onClick={checkGuided}>
            {guidedStep === 2 ? '完成跟着做' : '檢查並繼續'}
          </button>
          <button
            type="button"
            className="hint-button"
            onClick={() => askForHint(`請直接抄寫資料卡上的${labels[guidedStep].replace('練習', '')}。`)}
          >
            給我提示
          </button>
          <button type="button" className="secondary-button" onClick={lesson.replayDemo}>
            再示範一次
          </button>
        </div>
      </LessonLayout>
    )
  }

  if (lesson.phase === 'independent') {
    return (
      <LessonLayout title="關卡一：註冊帳號" phase="independent" heading="自己完成" onBack={onBack}>
        <p className="lesson-intro">請使用以下虛構資料，自己完成全部欄位。</p>
        <PracticeDataCard identity={INDEPENDENT_IDENTITY} createPassword />
        <div className="form-field">
          <label htmlFor="independent-name">姓名</label>
          <input
            id="independent-name"
            value={independentValues.name}
            onChange={(event) => setIndependentValues((current) => ({ ...current, name: event.target.value }))}
            aria-invalid={Boolean(independentErrors.name)}
          />
          {independentErrors.name && <p className="field-error">{independentErrors.name}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="independent-phone">電話</label>
          <input
            id="independent-phone"
            inputMode="tel"
            value={independentValues.phone}
            onChange={(event) => setIndependentValues((current) => ({ ...current, phone: event.target.value }))}
            aria-invalid={Boolean(independentErrors.phone)}
          />
          {independentErrors.phone && <p className="field-error">{independentErrors.phone}</p>}
        </div>
        <PasswordField
          id="independent-password"
          label="密碼"
          value={independentValues.password}
          onChange={(value) => setIndependentValues((current) => ({ ...current, password: value }))}
          error={independentErrors.password}
        />
        {hint && <p className="hint-panel">{hint}</p>}
        <div className="button-stack">
          <button type="button" className="primary-button" onClick={checkIndependent}>
            檢查資料
          </button>
          <button
            type="button"
            className="hint-button"
            onClick={() => askForHint('先核對姓名和電話，再逐項查看三個密碼要求。')}
          >
            給我提示
          </button>
          <button type="button" className="secondary-button" onClick={lesson.replayDemo}>
            再示範一次
          </button>
        </div>
      </LessonLayout>
    )
  }

  return (
    <LessonLayout title="關卡一：註冊帳號" phase="review" heading="註冊帳號練習完成" onBack={onBack}>
      <div className="success-card success-card--large">
        <Icon name="check" size={58} />
        <p>做得好！你已安全完成一次帳號註冊練習。</p>
      </div>
      <div className="metrics-row" aria-label="本次練習結果">
        <div><strong>{lesson.metrics.durationSeconds}</strong><span>秒</span></div>
        <div><strong>{lesson.metrics.errorCount}</strong><span>次錯誤</span></div>
        <div><strong>{lesson.metrics.hintCount}</strong><span>次提示</span></div>
      </div>
      <section className="review-card">
        <h2>記住三件事</h2>
        <ul>
          <li>先核對畫面要求才輸入資料。</li>
          <li>密碼最少8個字，要有英文和數字。</li>
          <li>只在可信任的網站輸入真實資料。</li>
        </ul>
      </section>
      <button type="button" className="primary-button" onClick={onBack}>
        返回首頁
      </button>
    </LessonLayout>
  )
}
