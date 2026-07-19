import { describe, expect, it, vi } from 'vitest'
import {
  DEFAULT_PROGRESS,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  loadProgress,
  loadSessions,
  loadSettings,
  saveProgress,
  saveSettings,
} from './storage'

describe('versioned local storage', () => {
  it('returns defaults when stored JSON is damaged', () => {
    localStorage.setItem(STORAGE_KEYS.settings, '{broken')
    localStorage.setItem(STORAGE_KEYS.progress, 'null')

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS)
  })

  it('round-trips valid settings and progress', () => {
    saveSettings({ fontScale: 1.15, speechEnabled: false })
    saveProgress({
      registration: { completed: true, unlocked: true },
      captcha: { completed: false, unlocked: true },
      ordering: { completed: false, unlocked: false },
    })

    expect(loadSettings()).toEqual({ fontScale: 1.15, speechEnabled: false })
    expect(loadProgress().captcha.unlocked).toBe(true)
  })

  it('rejects structurally incomplete study session records', () => {
    localStorage.setItem(
      STORAGE_KEYS.sessions,
      JSON.stringify({
        schemaVersion: 1,
        data: [
          {
            schemaVersion: 1,
            sessionId: 'damaged-session',
            participantCode: 'P01',
            levelId: 'registration',
            completed: true,
          },
        ],
      }),
    )

    expect(loadSessions()).toEqual([])
  })

  it('does not interrupt the app when the browser blocks local storage writes', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage is unavailable', 'QuotaExceededError')
    })

    expect(() => saveSettings(DEFAULT_SETTINGS)).not.toThrow()
    setItem.mockRestore()
  })
})
