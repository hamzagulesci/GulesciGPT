'use client'

import { AI_MODELS, getModelDisplayName, type AIModel } from '@/lib/models'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  className?: string
}

export function ModelSelector({ selectedModel, onModelChange, className }: ModelSelectorProps) {
  // Modelleri alfabetik sırala
  const sortedModels = [...AI_MODELS].sort((a, b) =>
    a.name.localeCompare(b.name, 'tr')
  )

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel)
  const displayName = selectedModelData
    ? getModelDisplayName(selectedModelData)
    : 'Model Seç'

  return (
    <Select value={selectedModel} onValueChange={onModelChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="Model Seç">
          {displayName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {sortedModels.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {getModelDisplayName(model)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
