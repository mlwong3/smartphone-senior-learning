import type { ReactNode } from 'react'
import { StatusBar } from './StatusBar'
import './PhoneFrame.css'

interface PhoneFrameProps {
  children: ReactNode
}

// iPhone 外框容器：
// - 桌面（寬螢幕）：置中顯示有圓角、邊框、動態島的 iPhone 外框。
// - 手機（窄螢幕）：取消外框，內容滿版（見 PhoneFrame.css 的 media query）。
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="phone-frame">
      <div className="phone-frame__screen">
        <div className="phone-frame__notch" aria-hidden="true" />
        <StatusBar />
        <div className="phone-frame__content">{children}</div>
      </div>
    </div>
  )
}
