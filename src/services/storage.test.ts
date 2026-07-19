import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PROGRESS,
  DEFAULT_SETTINGS,
  STORAGE_KEYS,
  loadProgress,
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
})
