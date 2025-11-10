'use client'

import { useState } from 'react'

interface ThinkingSectionProps {
  thinking: string
}

export function ThinkingSection({ thinking }: ThinkingSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!thinking) return null

  return (
    <div className="thinking-section">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="thinking-toggle"
        aria-label={isOpen ? "Düşünce sürecini gizle" : "Düşünce sürecini göster"}
        aria-expanded={isOpen}
      >
        <span className="text-lg" role="img" aria-label="Beyin">🧠</span>
        <span>Düşünce Süreci</span>
        <span className={`thinking-arrow ${isOpen ? 'expanded' : ''}`}>▼</span>
      </button>

      <div className={`thinking-content ${isOpen ? '' : 'collapsed'}`}>
        <pre className="thinking-text">{thinking}</pre>
      </div>
    </div>
  )
}
