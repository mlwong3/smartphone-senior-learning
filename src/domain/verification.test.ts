import { describe, expect, it } from 'vitest'
import {
  EMAIL_MESSAGES,
  IMAGE_CAPTCHA_CHALLENGES,
  TEXT_CAPTCHA_CHALLENGES,
  validateSmsCode,
  validateTextCaptcha,
  getImageSelectionFeedback,
} from './verification'

describe('verification domain model', () => {
  it('validates a complete, incomplete, and incorrect SMS code', () => {
    expect(validateSmsCode('381642')).toBe('correct')
    expect(validateSmsCode('381')).toBe('incomplete')
    expect(validateSmsCode('000000')).toBe('incorrect')
  })

  it('accepts text CAPTCHA input without case sensitivity', () => {
    expect(validateTextCaptcha('h7k3m', TEXT_CAPTCHA_CHALLENGES[0])).toBe(true)
    expect(validateTextCaptcha('wrong', TEXT_CAPTCHA_CHALLENGES[0])).toBe(false)
  })

  it('contains a correct email message and distractor messages', () => {
    expect(EMAIL_MESSAGES.some((message) => message.correct)).toBe(true)
    expect(EMAIL_MESSAGES.some((message) => !message.correct)).toBe(true)
  })

  it('reports missing and extra image selections', () => {
    const challenge = IMAGE_CAPTCHA_CHALLENGES[0]
    expect(getImageSelectionFeedback(challenge, new Set(['bus-1']))).toBe('missing')
    expect(getImageSelectionFeedback(challenge, new Set(['bus-1', 'bus-2', 'tree-1']))).toBe('extra')
    expect(getImageSelectionFeedback(challenge, new Set(['bus-1', 'bus-2']))).toBe('correct')
  })
})
