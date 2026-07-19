import { useEffect, useState } from 'react'
import './StatusBar.css'

function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

export function StatusBar() {
  const [time, setTime] = useState(() => formatTime(new Date()))
  useEffect(() => {
    const id = window.setInterval(() => setTime(formatTime(new Date())), 30_000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="status-bar" aria-hidden="true">
      <span className="status-bar__time">{time}</span>
      <div className="status-bar__icons">
        <span className="signal-bars"><i /><i /><i /><i /></span>
        <span className="status-bar__network">5G</span>
        <span className="battery"><i /></span>
      </div>
    </div>
  )
}
