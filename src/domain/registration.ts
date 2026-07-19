export interface RegistrationValues {
  name: string
  phone: string
  password: string
}

export interface PracticeIdentity {
  name: string
  phone: string
}

export interface PasswordChecks {
  minLength: boolean
  hasLetter: boolean
  hasNumber: boolean
}

export type RegistrationErrors = Partial<Record<keyof RegistrationValues, string>>

export function normalizePhone(value: string): string {
  return value.replace(/[\s-]/g, '')
}

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= 8,
    hasLetter: /[A-Za-z]/.test(password),
    hasNumber: /\d/.test(password),
  }
}

function passwordError(password: string): string | undefined {
  if (!password) return '請輸入練習密碼。'

  const checks = getPasswordChecks(password)
  const messages: string[] = []

  if (!checks.minLength) {
    const missing = 8 - password.length
    messages.push(`目前有 ${password.length} 個字，還差 ${missing} 個。`)
  }
  if (!checks.hasLetter) messages.push('請再加入一個英文字母。')
  if (!checks.hasNumber) messages.push('請再加入一個數字。')

  return messages.length ? messages.join('') : undefined
}

export function validateRegistration(
  values: RegistrationValues,
  identity: PracticeIdentity,
): RegistrationErrors {
  const errors: RegistrationErrors = {}
  const name = values.name.trim()
  const phone = normalizePhone(values.phone)
  const expectedPhone = normalizePhone(identity.phone)

  if (!name) {
    errors.name = '請輸入資料卡上的練習姓名。'
  } else if (name !== identity.name) {
    errors.name = `請再看資料卡，練習姓名是「${identity.name}」。`
  }

  if (!phone) {
    errors.phone = '請輸入資料卡上的練習電話。'
  } else if (!/^\d+$/.test(phone)) {
    errors.phone = '電話只需輸入 8 個數字。'
  } else if (phone.length !== 8) {
    const difference = Math.abs(8 - phone.length)
    errors.phone =
      phone.length < 8
        ? `目前有 ${phone.length} 個數字，還差 ${difference} 個。`
        : `電話多了 ${difference} 個數字，請只輸入 8 個。`
  } else if (phone !== expectedPhone) {
    errors.phone = `請再看資料卡，練習電話是 ${identity.phone}。`
  }

  const passwordMessage = passwordError(values.password)
  if (passwordMessage) errors.password = passwordMessage

  return errors
}
