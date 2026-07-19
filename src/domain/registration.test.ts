import { describe, expect, it } from 'vitest'
import {
  getPasswordChecks,
  normalizePhone,
  validateRegistration,
} from './registration'

describe('registration helpers', () => {
  it('normalizes spaces and hyphens in practice phone numbers', () => {
    expect(normalizePhone('9876-5432')).toBe('98765432')
  })

  it('reports every missing password rule', () => {
    expect(getPasswordChecks('中文')).toEqual({
      minLength: false,
      hasLetter: false,
      hasNumber: false,
    })
  })

  it('accepts the guided practice data after normalization', () => {
    expect(
      validateRegistration(
        { name: ' 李好學 ', phone: '9876-5432', password: 'Safe1234' },
        { name: '李好學', phone: '9876 5432' },
      ),
    ).toEqual({})
  })

  it('returns actionable errors for invalid practice data', () => {
    expect(
      validateRegistration(
        { name: '', phone: '98A6', password: 'abcdefg' },
        { name: '李好學', phone: '9876 5432' },
      ),
    ).toEqual({
      name: '請輸入資料卡上的練習姓名。',
      phone: '電話只需輸入 8 個數字。',
      password: '目前有 7 個字，還差 1 個。請再加入一個數字。',
    })
  })
})
