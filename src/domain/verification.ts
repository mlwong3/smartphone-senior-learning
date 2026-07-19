export interface SmsChallenge {
  phone: string
  code: string
  expiresInSeconds: number
}

export interface EmailMessage {
  id: string
  sender: string
  subject: string
  preview: string
  correct: boolean
}

export interface TextCaptchaChallenge {
  id: string
  code: string
}

export interface ImageCaptchaTile {
  id: string
  label: string
  target: boolean
}

export interface ImageCaptchaChallenge {
  id: string
  targetLabel: string
  tiles: readonly ImageCaptchaTile[]
}

export type ImageSelectionFeedback = 'correct' | 'missing' | 'extra'

export const SMS_CHALLENGE: SmsChallenge = {
  phone: '9••• ••67',
  code: '381642',
  expiresInSeconds: 120,
}

export const EMAIL_MESSAGES: readonly EmailMessage[] = [
  {
    id: 'account-confirmation',
    sender: '智學手機 <no-reply@smartphone-learning.local>',
    subject: '智學手機：確認練習帳號',
    preview: '請確認你正在進行的安全驗證練習。',
    correct: true,
  },
  {
    id: 'security-alert',
    sender: '安全通知 <notice@smartphone-learning.local>',
    subject: '你的安全提示',
    preview: '這是一封用來辨認的干擾郵件。',
    correct: false,
  },
  {
    id: 'weekly-news',
    sender: '智學手機 <news@smartphone-learning.local>',
    subject: '本週學習小貼士',
    preview: '看看本週推薦的手機學習內容。',
    correct: false,
  },
]

export const TEXT_CAPTCHA_CHALLENGES: readonly TextCaptchaChallenge[] = [
  { id: 'text-1', code: 'H7K3M' },
  { id: 'text-2', code: 'R4N8P' },
]

export const IMAGE_CAPTCHA_CHALLENGES: readonly ImageCaptchaChallenge[] = [
  {
    id: 'bus-1',
    targetLabel: '巴士',
    tiles: [
      { id: 'bus-1', label: '巴士', target: true },
      { id: 'tree-1', label: '樹木', target: false },
      { id: 'car-1', label: '私家車', target: false },
      { id: 'traffic-light-bus-1', label: '交通燈', target: false },
      { id: 'bus-2', label: '巴士', target: true },
      { id: 'building-1', label: '大廈', target: false },
      { id: 'bike-1', label: '單車', target: false },
      { id: 'tree-2', label: '樹木', target: false },
      { id: 'bus-3', label: '巴士', target: true },
    ],
  },
  {
    id: 'traffic-light-1',
    targetLabel: '交通燈',
    tiles: [
      { id: 'traffic-light-1', label: '交通燈', target: true },
      { id: 'car-2', label: '私家車', target: false },
      { id: 'tree-3', label: '樹木', target: false },
      { id: 'bus-4', label: '巴士', target: false },
      { id: 'traffic-light-2', label: '交通燈', target: true },
      { id: 'building-2', label: '大廈', target: false },
      { id: 'bike-2', label: '單車', target: false },
      { id: 'bus-5', label: '巴士', target: false },
      { id: 'traffic-light-3', label: '交通燈', target: true },
    ],
  },
]

export function validateSmsCode(code: string): 'correct' | 'incomplete' | 'incorrect' {
  const normalized = code.replace(/\D/g, '')
  if (normalized.length < 6) return 'incomplete'
  return normalized === SMS_CHALLENGE.code ? 'correct' : 'incorrect'
}

export function validateTextCaptcha(input: string, challenge: TextCaptchaChallenge): boolean {
  return input.trim().toUpperCase() === challenge.code.toUpperCase()
}

export function getImageSelectionFeedback(
  challenge: ImageCaptchaChallenge,
  selectedIds: Set<string>,
): ImageSelectionFeedback {
  const missing = challenge.tiles.some((tile) => tile.target && !selectedIds.has(tile.id))
  const extra = [...selectedIds].some((id) => !challenge.tiles.some((tile) => tile.id === id && tile.target))

  if (missing) return 'missing'
  if (extra) return 'extra'
  return 'correct'
}
