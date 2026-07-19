import type { LevelId } from '../types'

interface IconProps {
  name: LevelId | 'lock' | 'check' | 'volume' | 'home' | 'chart'
  size?: number
  className?: string
}

export function Icon({ name, size = 32, className }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  }

  if (name === 'registration') {
    return (
      <svg {...common}>
        <rect x="9" y="6" width="30" height="36" rx="5" />
        <path d="M16 17h16M16 25h9M16 33h16" />
        <path d="M30 24v10M25 29h10" />
      </svg>
    )
  }
  if (name === 'captcha') {
    return (
      <svg {...common}>
        <path d="M24 5 39 11v11c0 10-6.2 17.1-15 21-8.8-3.9-15-11-15-21V11Z" />
        <path d="m17 24 5 5 10-11" />
      </svg>
    )
  }
  if (name === 'ordering') {
    return (
      <svg {...common}>
        <path d="M8 18h32l-3 24H11Z" />
        <path d="M16 18a8 8 0 0 1 16 0M18 27h12M18 34h8" />
      </svg>
    )
  }
  if (name === 'lock') {
    return (
      <svg {...common}>
        <rect x="10" y="21" width="28" height="21" rx="4" />
        <path d="M16 21v-7a8 8 0 0 1 16 0v7M24 29v6" />
      </svg>
    )
  }
  if (name === 'check') {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="19" />
        <path d="m15 24 6 6 13-14" />
      </svg>
    )
  }
  if (name === 'volume') {
    return (
      <svg {...common}>
        <path d="M7 20v8h8l10 8V12l-10 8Z" />
        <path d="M31 19a8 8 0 0 1 0 10M35 14a15 15 0 0 1 0 20" />
      </svg>
    )
  }
  if (name === 'home') {
    return (
      <svg {...common}>
        <path d="m6 23 18-15 18 15" />
        <path d="M11 20v22h26V20M20 42V29h8v13" />
      </svg>
    )
  }
  return (
    <svg {...common}>
      <path d="M8 40V24M18 40V15M28 40V28M38 40V8" />
      <path d="M5 40h38" />
    </svg>
  )
}
