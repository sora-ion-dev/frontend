export interface ChatMessage {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    timestamp?: number;
    isStreaming?: boolean;
    brandId?: string;
    brand?: AIBrand;
}

export interface AIModel {
    id: string;
    name: string;
}

export interface AIBrand {
    id: string;
    brandId: string;
    name: string;
    brandName: string;
    brand: string;
    realBrandName: string;
    logo: string;
    color?: string;
    description?: string;
    models: AIModel[];
}

export const FIESTA_BRAND_IDS = [
    "openai/gpt-4o-mini",
    "meta-llama/llama-3.3-70b-instruct",
    "google/gemini-flash-1.5",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "anthropic/claude-3-haiku",
    "deepseek/deepseek-chat",
    "glm/glm-4-flash",
    "deepseek/deepseek-r1-7b",
    "qwen/qwen3-8b",
    "arcee/trinity-large",
    "minimax/minimax-m2.5",
    "nous/hermes-3-405b",
    "mistral/mistral-small-24b",
    "openai/gpt-4o",
    "moonshot/kimi-k2"
];

export const MODEL_BRANDS: AIBrand[] = [
    { id: "openai/gpt-4o-mini", brandId: "openai/gpt-4o-mini", name: "GPT-4o Mini", brandName: "GPT-4o Mini", brand: "OpenAI", realBrandName: "OpenAI", logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg", color: "#74aa9c", models: [{ id: "openai/gpt-4o-mini", name: "GPT-4o Mini" }] },
    { id: "meta-llama/llama-3.3-70b-instruct", brandId: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.1 8B", brandName: "Llama 3.1 8B", brand: "Meta", realBrandName: "Meta", logo: "https://api.iconify.design/logos:meta-icon.svg", color: "#0668E1", models: [{ id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.1 8B" }] },
    { id: "google/gemini-flash-1.5", brandId: "google/gemini-flash-1.5", name: "Gemini 1.5 Flash", brandName: "Gemini 1.5 Flash", brand: "Google", realBrandName: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Google_Gemini_logo_2025.svg", color: "#4285F4", models: [{ id: "google/gemini-flash-1.5", name: "Gemini 1.5 Flash" }] },
    { id: "nvidia/llama-3.1-nemotron-70b-instruct", brandId: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron Nano 9B", brandName: "Nemotron Nano 9B", brand: "NVIDIA", realBrandName: "NVIDIA", logo: "https://api.iconify.design/logos:nvidia.svg", color: "#76B900", models: [{ id: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron Nano 9B" }] },
    { id: "anthropic/claude-3-haiku", brandId: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", brandName: "Claude 3 Haiku", brand: "Anthropic", realBrandName: "Anthropic", logo: "https://api.iconify.design/logos:anthropic-icon.svg", color: "#D97757", models: [{ id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku" }] },
    { id: "deepseek/deepseek-chat", brandId: "deepseek/deepseek-chat", name: "DeepSeek Chat", brandName: "DeepSeek Chat", brand: "DeepSeek", realBrandName: "DeepSeek", logo: "https://api.iconify.design/simple-icons:deepseek.svg", color: "#617CFF", models: [{ id: "deepseek/deepseek-chat", name: "DeepSeek Chat" }] },
    { id: "glm/glm-4-flash", brandId: "glm/glm-4-flash", name: "GLM-4 Flash", brandName: "GLM-4 Flash", brand: "Zhipu AI", realBrandName: "Zhipu AI", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Zhipu_AI_logo.svg/512px-Zhipu_AI_logo.svg.png", color: "#6C5CE7", models: [{ id: "glm/glm-4-flash", name: "GLM-4 Flash" }] },
    { id: "deepseek/deepseek-r1-7b", brandId: "deepseek/deepseek-r1-7b", name: "DeepSeek R1 7B", brandName: "DeepSeek R1 7B", brand: "DeepSeek R1", realBrandName: "DeepSeek", logo: "https://api.iconify.design/simple-icons:deepseek.svg", color: "#FF6B9D", models: [{ id: "deepseek/deepseek-r1-7b", name: "DeepSeek R1 7B" }] },
    { id: "qwen/qwen3-8b", brandId: "qwen/qwen3-8b", name: "Qwen 2.5 7B", brandName: "Qwen 2.5 7B", brand: "Qwen", realBrandName: "Alibaba", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Alibaba_Group_%282022%29.svg/512px-Alibaba_Group_%282022%29.svg.png", color: "#FF6A00", models: [{ id: "qwen/qwen3-8b", name: "Qwen 2.5 7B" }] },
    { id: "arcee/trinity-large", brandId: "arcee/trinity-large", name: "Trinity Mini", brandName: "Trinity Mini", brand: "Arcee AI", realBrandName: "Arcee", logo: "https://api.iconify.design/ri:sparkling-2-line.svg", color: "#FF8A65", models: [{ id: "arcee/trinity-large", name: "Trinity Mini" }] },
    { id: "minimax/minimax-m2.5", brandId: "minimax/minimax-m2.5", name: "MiniMax M2.5", brandName: "MiniMax M2.5", brand: "MiniMax", realBrandName: "MiniMax", logo: "https://api.iconify.design/ri:cpu-line.svg", color: "#4DD0E1", models: [{ id: "minimax/minimax-m2.5", name: "MiniMax M2.5" }] },
    { id: "nous/hermes-3-405b", brandId: "nous/hermes-3-405b", name: "Hermes 3 8B", brandName: "Hermes 3 8B", brand: "Nous Research", realBrandName: "Nous", logo: "https://api.iconify.design/ri:microchip-line.svg", color: "#AED581", models: [{ id: "nous/hermes-3-405b", name: "Hermes 3 8B" }] },
    { id: "mistral/mistral-small-24b", brandId: "mistral/mistral-small-24b", name: "Mistral 7B v0.3", brandName: "Mistral 7B v0.3", brand: "Mistral AI", realBrandName: "Mistral", logo: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Mistral_AI_logo.svg", color: "#FFB74D", models: [{ id: "mistral/mistral-small-24b", name: "Mistral 7B v0.3" }] },
    { id: "openai/gpt-4o", brandId: "openai/gpt-4o", name: "GPT-4o (Pro)", brandName: "GPT-4o Pro", brand: "OpenAI", realBrandName: "OpenAI", logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg", color: "#D4AF37", models: [{ id: "openai/gpt-4o", name: "GPT-4o Pro" }] },
    { id: "moonshot/kimi-k2", brandId: "moonshot/kimi-k2", name: "Moonshot Kimi K2", brandName: "Kimi K2", brand: "Moonshot AI", realBrandName: "Moonshot", logo: "https://api.iconify.design/ri:rocket-2-line.svg", color: "#34C759", models: [{ id: "moonshot/kimi-k2", name: "Moonshot Kimi K2" }] }
];
