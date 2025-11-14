// OpenRouter Free Model tanımları
export interface AIModel {
  id: string
  name: string
  contextLength: number
}

export const AI_MODELS: AIModel[] = [
  { id: "kwaipilot/kat-coder-pro:free", name: "Kat Coder Pro", contextLength: 256000 },
  { id: "openrouter/polaris-alpha", name: "Polaris Alpha", contextLength: 256000 },
  { id: "nvidia/nemotron-nano-12b-v2-vl:free", name: "NVIDIA Nemotron Nano 12B VL", contextLength: 128000 },
  { id: "minimax/minimax-m2:free", name: "MiniMax M2", contextLength: 204800 },
  { id: "alibaba/tongyi-deepresearch-30b-a3b:free", name: "Tongyi DeepResearch 30B", contextLength: 131072 },
  { id: "meituan/longcat-flash-chat:free", name: "LongCat Flash Chat", contextLength: 131072 },
  { id: "nvidia/nemotron-nano-9b-v2:free", name: "NVIDIA Nemotron Nano 9B", contextLength: 128000 },
  { id: "deepseek/deepseek-chat-v3.1:free", name: "DeepSeek V3.1", contextLength: 163800 },
  { id: "openai/gpt-oss-20b:free", name: "GPT-OSS 20B", contextLength: 131072 },
  { id: "z-ai/glm-4.5-air:free", name: "GLM 4.5 Air", contextLength: 131072 },
  { id: "qwen/qwen3-coder:free", name: "Qwen3 Coder 480B", contextLength: 262000 },
  { id: "moonshotai/kimi-k2:free", name: "Kimi K2", contextLength: 32768 },
  { id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", name: "Venice Uncensored", contextLength: 32768 },
  { id: "google/gemma-3n-e2b-it:free", name: "Gemma 3n 2B", contextLength: 8192 },
  { id: "tngtech/deepseek-r1t2-chimera:free", name: "DeepSeek R1T2 Chimera", contextLength: 163840 },
  { id: "mistralai/mistral-small-3.2-24b-instruct:free", name: "Mistral Small 3.2 24B", contextLength: 131072 },
  { id: "deepseek/deepseek-r1-0528-qwen3-8b:free", name: "DeepSeek R1 0528 Qwen3 8B", contextLength: 131072 },
  { id: "deepseek/deepseek-r1-0528:free", name: "DeepSeek R1 0528", contextLength: 163840 },
  { id: "google/gemma-3n-e4b-it:free", name: "Gemma 3n 4B", contextLength: 8192 },
  { id: "meta-llama/llama-3.3-8b-instruct:free", name: "Llama 3.3 8B", contextLength: 128000 },
  { id: "qwen/qwen3-4b:free", name: "Qwen3 4B", contextLength: 40960 },
  { id: "qwen/qwen3-30b-a3b:free", name: "Qwen3 30B", contextLength: 40960 },
  { id: "qwen/qwen3-14b:free", name: "Qwen3 14B", contextLength: 40960 },
  { id: "qwen/qwen3-235b-a22b:free", name: "Qwen3 235B", contextLength: 40960 },
  { id: "tngtech/deepseek-r1t-chimera:free", name: "DeepSeek R1T Chimera", contextLength: 163840 },
  { id: "microsoft/mai-ds-r1:free", name: "Microsoft MAI DS R1", contextLength: 163840 },
  { id: "arliai/qwq-32b-arliai-rpr-v1:free", name: "ArliAI QwQ 32B", contextLength: 32768 },
  { id: "agentica-org/deepcoder-14b-preview:free", name: "Agentica Deepcoder 14B", contextLength: 96000 },
  { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick", contextLength: 128000 },
  { id: "meta-llama/llama-4-scout:free", name: "Llama 4 Scout", contextLength: 128000 },
  { id: "qwen/qwen2.5-vl-32b-instruct:free", name: "Qwen2.5 VL 32B", contextLength: 16384 },
  { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek V3 0324", contextLength: 163840 },
  { id: "mistralai/mistral-small-3.1-24b-instruct:free", name: "Mistral Small 3.1 24B", contextLength: 96000 },
  { id: "google/gemma-3-4b-it:free", name: "Gemma 3 4B", contextLength: 32768 },
  { id: "google/gemma-3-12b-it:free", name: "Gemma 3 12B", contextLength: 32768 },
  { id: "google/gemma-3-27b-it:free", name: "Gemma 3 27B", contextLength: 131072 },
  { id: "mistralai/mistral-small-24b-instruct-2501:free", name: "Mistral Small 3", contextLength: 32768 },
  { id: "deepseek/deepseek-r1-distill-llama-70b:free", name: "DeepSeek R1 Distill Llama 70B", contextLength: 8192 },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1", contextLength: 163840 },
  { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash Exp", contextLength: 1048576 },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B", contextLength: 131072 },
  { id: "qwen/qwen-2.5-coder-32b-instruct:free", name: "Qwen 2.5 Coder 32B", contextLength: 32768 },
  { id: "meta-llama/llama-3.2-3b-instruct:free", name: "Llama 3.2 3B", contextLength: 131072 },
  { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen 2.5 72B", contextLength: 32768 },
  { id: "nousresearch/hermes-3-llama-3.1-405b:free", name: "Hermes 3 405B", contextLength: 131072 },
  { id: "mistralai/mistral-nemo:free", name: "Mistral Nemo", contextLength: 131072 },
  { id: "mistralai/mistral-7b-instruct:free", name: "Mistral 7B", contextLength: 32768 },
]

// Varsayılan model
export const DEFAULT_MODEL = "mistralai/mistral-nemo:free"

// Model ID'den model bilgisi al
export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find(model => model.id === id)
}

// Model'in DeepSeek R1 ailesi olup olmadığını kontrol et
export function isDeepSeekR1Model(modelId: string): boolean {
  return modelId.toLowerCase().includes('deepseek') &&
         modelId.toLowerCase().includes('r1')
}

// Model display name oluştur
export function getModelDisplayName(model: AIModel): string {
  const contextK = Math.floor(model.contextLength / 1000)
  return `${model.name} (${contextK}K)`
}
