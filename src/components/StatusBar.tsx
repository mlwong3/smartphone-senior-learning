import './StatusBar.css'

// iPhone 狀態列（純裝飾）：顯示時間、訊號、Wi-Fi、電量。
// 時間每分鐘更新一次，讓畫面更像真實手機。
import { useEffect, useState } from 'react'

function formatTime(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export function StatusBar() {
  const [time, setTime] = useState(() => formatTime(new Date()))

  useEffect(() => {
    const id = setInterval(() => setTime(formatTime(new Date())), 1000 * 30)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="status-bar" aria-hidden="true">
      <span className="status-bar__time">{time}</span>
      <div className="status-bar__icons">
        <span>📶</span>
        <span>🔋</span>
      </div>
    </div>
  )
}
