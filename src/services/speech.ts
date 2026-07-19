export function chooseChineseVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  return (
    voices.find((voice) => voice.lang.toLowerCase() === 'zh-hk') ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('zh'))
  )
}

export function speakText(text: string): boolean {
  if (
    typeof window === 'undefined' ||
    !('speechSynthesis' in window) ||
    typeof SpeechSynthesisUtterance === 'undefined'
  ) {
    return false
  }

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'zh-HK'
  utterance.rate = 0.85
  const voice = chooseChineseVoice(window.speechSynthesis.getVoices())
  if (voice) utterance.voice = voice

  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
  return true
}
