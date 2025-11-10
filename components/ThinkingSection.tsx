'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThinkingSectionProps {
  thinking: string
}

export function ThinkingSection({ thinking }: ThinkingSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!thinking) return null

  return (
    <div className="mb-2 rounded-lg border border-gray-200 bg-gray-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span>Düşünce Süreci</span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "max-h-96" : "max-h-0"
        )}
      >
        <div className="px-4 py-3 text-xs font-mono text-gray-600 whitespace-pre-wrap overflow-y-auto max-h-80 border-t border-gray-200">
          {thinking}
        </div>
      </div>
    </div>
  )
}
