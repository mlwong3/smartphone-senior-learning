import { describe, expect, it } from 'vitest'
import { chooseChineseVoice } from './speech'

function voice(lang: string, name: string): SpeechSynthesisVoice {
  return { lang, name } as SpeechSynthesisVoice
}

describe('speech voice selection', () => {
  it('prefers a Hong Kong Chinese voice', () => {
    expect(
      chooseChineseVoice([voice('zh-TW', 'Taiwan'), voice('zh-HK', 'Hong Kong')])?.name,
    ).toBe('Hong Kong')
  })

  it('falls back to another Chinese voice', () => {
    expect(chooseChineseVoice([voice('en-US', 'English'), voice('zh-TW', 'Chinese')])?.name).toBe(
      'Chinese',
    )
  })
})
