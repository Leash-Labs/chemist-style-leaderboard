import React from 'react'
export default function ProgressBar({ value, max=1 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return <div className="progress"><div className="progress-inner" style={{ width: pct + '%' }} /></div>
}