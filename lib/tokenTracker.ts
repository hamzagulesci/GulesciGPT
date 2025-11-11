import fs from 'fs'
import path from 'path'
import { lock, unlock } from 'proper-lockfile'

const DATA_DIR = path.join(process.cwd(), 'data')
const TOKEN_STATS_FILE = path.join(DATA_DIR, 'token-stats.json')
const LOCK_OPTIONS = {
  retries: {
    retries: 5,
    minTimeout: 100,
    maxTimeout: 1000
  }
}

interface TokenUsage {
  date: string // YYYY-MM-DD
  model: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  estimatedCost: number // in USD
}

interface TokenStats {
  totalInputTokens: number
  totalOutputTokens: number
  totalTokens: number
  totalCost: number
  todayUsage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: number
  }
  last7Days: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: number
  }
  byModel: {
    model: string
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: number
  }[]
  dailyTrend: {
    date: string
    tokens: number
    cost: number
  }[]
}

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Read token usage data
function readTokenUsage(): TokenUsage[] {
  ensureDataDir()

  if (!fs.existsSync(TOKEN_STATS_FILE)) {
    return []
  }

  try {
    const data = fs.readFileSync(TOKEN_STATS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading token stats:', error)
    return []
  }
}

// Write token usage data with lock
async function writeTokenUsage(usage: TokenUsage[]): Promise<void> {
  ensureDataDir()

  // Create file if it doesn't exist
  if (!fs.existsSync(TOKEN_STATS_FILE)) {
    fs.writeFileSync(TOKEN_STATS_FILE, JSON.stringify([]))
  }

  try {
    await lock(TOKEN_STATS_FILE, LOCK_OPTIONS)
    fs.writeFileSync(TOKEN_STATS_FILE, JSON.stringify(usage, null, 2))
    await unlock(TOKEN_STATS_FILE)
  } catch (error) {
    console.error('Error writing token stats:', error)
    // Try to unlock if locked
    try {
      await unlock(TOKEN_STATS_FILE)
    } catch (unlockError) {
      // Ignore unlock errors
    }
  }
}

// Clean old data (keep last 90 days)
function cleanOldData(usage: TokenUsage[]): TokenUsage[] {
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoffDate = ninetyDaysAgo.toISOString().split('T')[0]

  return usage.filter(u => u.date >= cutoffDate)
}

// Estimate token count from text (rough approximation)
// Average: 1 token ≈ 4 characters for English text
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

// Estimate cost based on model pricing (very rough estimates)
// Prices are per 1M tokens
function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Default pricing (free/low-cost models)
  let inputPricePerM = 0.0
  let outputPricePerM = 0.0

  // Model-specific pricing (approximate OpenRouter rates)
  if (model.includes('gpt-4')) {
    inputPricePerM = 30.0
    outputPricePerM = 60.0
  } else if (model.includes('gpt-3.5')) {
    inputPricePerM = 0.5
    outputPricePerM = 1.5
  } else if (model.includes('claude-3-opus')) {
    inputPricePerM = 15.0
    outputPricePerM = 75.0
  } else if (model.includes('claude-3-sonnet')) {
    inputPricePerM = 3.0
    outputPricePerM = 15.0
  } else if (model.includes('claude-3-haiku')) {
    inputPricePerM = 0.25
    outputPricePerM = 1.25
  } else if (model.includes('gemini-pro')) {
    inputPricePerM = 0.5
    outputPricePerM = 1.5
  } else if (model.includes('deepseek')) {
    inputPricePerM = 0.14
    outputPricePerM = 0.28
  }

  const inputCost = (inputTokens / 1_000_000) * inputPricePerM
  const outputCost = (outputTokens / 1_000_000) * outputPricePerM

  return inputCost + outputCost
}

// Track token usage
export async function trackTokenUsage(
  model: string,
  inputText: string,
  outputText: string,
  actualTokens?: { input?: number; output?: number }
): Promise<void> {
  const today = new Date().toISOString().split('T')[0]

  // Use actual tokens if provided, otherwise estimate
  const inputTokens = actualTokens?.input ?? estimateTokens(inputText)
  const outputTokens = actualTokens?.output ?? estimateTokens(outputText)
  const totalTokens = inputTokens + outputTokens
  const estimatedCost = estimateCost(model, inputTokens, outputTokens)

  let usage = readTokenUsage()

  // Find or create entry for today and this model
  const existingIndex = usage.findIndex(u => u.date === today && u.model === model)

  if (existingIndex >= 0) {
    usage[existingIndex].inputTokens += inputTokens
    usage[existingIndex].outputTokens += outputTokens
    usage[existingIndex].totalTokens += totalTokens
    usage[existingIndex].estimatedCost += estimatedCost
  } else {
    usage.push({
      date: today,
      model,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost
    })
  }

  usage = cleanOldData(usage)
  await writeTokenUsage(usage)
}

// Get token statistics
export function getTokenStats(): TokenStats {
  const usage = readTokenUsage()
  const today = new Date().toISOString().split('T')[0]
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoDate = sevenDaysAgo.toISOString().split('T')[0]

  // Calculate totals
  const totalInputTokens = usage.reduce((sum, u) => sum + u.inputTokens, 0)
  const totalOutputTokens = usage.reduce((sum, u) => sum + u.outputTokens, 0)
  const totalTokens = usage.reduce((sum, u) => sum + u.totalTokens, 0)
  const totalCost = usage.reduce((sum, u) => sum + u.estimatedCost, 0)

  // Today's usage
  const todayUsage = usage
    .filter(u => u.date === today)
    .reduce(
      (acc, u) => ({
        inputTokens: acc.inputTokens + u.inputTokens,
        outputTokens: acc.outputTokens + u.outputTokens,
        totalTokens: acc.totalTokens + u.totalTokens,
        cost: acc.cost + u.estimatedCost
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 }
    )

  // Last 7 days usage
  const last7Days = usage
    .filter(u => u.date >= sevenDaysAgoDate)
    .reduce(
      (acc, u) => ({
        inputTokens: acc.inputTokens + u.inputTokens,
        outputTokens: acc.outputTokens + u.outputTokens,
        totalTokens: acc.totalTokens + u.totalTokens,
        cost: acc.cost + u.estimatedCost
      }),
      { inputTokens: 0, outputTokens: 0, totalTokens: 0, cost: 0 }
    )

  // Usage by model
  const byModelMap = new Map<string, {
    inputTokens: number
    outputTokens: number
    totalTokens: number
    cost: number
  }>()

  usage.forEach(u => {
    const existing = byModelMap.get(u.model) || {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cost: 0
    }
    byModelMap.set(u.model, {
      inputTokens: existing.inputTokens + u.inputTokens,
      outputTokens: existing.outputTokens + u.outputTokens,
      totalTokens: existing.totalTokens + u.totalTokens,
      cost: existing.cost + u.estimatedCost
    })
  })

  const byModel = Array.from(byModelMap.entries())
    .map(([model, stats]) => ({ model, ...stats }))
    .sort((a, b) => b.totalTokens - a.totalTokens)

  // Daily trend (last 7 days)
  const dailyTrendMap = new Map<string, { tokens: number; cost: number }>()

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    dailyTrendMap.set(dateStr, { tokens: 0, cost: 0 })
  }

  usage
    .filter(u => u.date >= sevenDaysAgoDate)
    .forEach(u => {
      const existing = dailyTrendMap.get(u.date) || { tokens: 0, cost: 0 }
      dailyTrendMap.set(u.date, {
        tokens: existing.tokens + u.totalTokens,
        cost: existing.cost + u.estimatedCost
      })
    })

  const dailyTrend = Array.from(dailyTrendMap.entries())
    .map(([date, stats]) => ({ date, ...stats }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalCost,
    todayUsage,
    last7Days,
    byModel,
    dailyTrend
  }
}
