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
    "anthropic/claude-3-haiku",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-r1-7b",
    "mistral/mistral-small-24b",
    "openai/gpt-4o",
    "arcee/trinity-large"
];

export const MODEL_BRANDS: AIBrand[] = [
    { id: "openai/gpt-4o-mini", brandId: "openai/gpt-4o-mini", name: "GPT-4o Mini", brandName: "GPT-4o Mini", brand: "OpenAI", realBrandName: "OpenAI", logo: "/logos/gpt4o_mini.svg", color: "#74aa9c", description: "Fast and reliable lightweight model", models: [{ id: "openai/gpt-4o-mini", name: "GPT-4o Mini" }] },
    { id: "meta-llama/llama-3.3-70b-instruct", brandId: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", brandName: "Llama 3.3 70B", brand: "Meta", realBrandName: "Meta", logo: "/logos/llama33.svg", color: "#0668E1", description: "Powerful open source model", models: [{ id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B" }] },
    { id: "google/gemini-flash-1.5", brandId: "google/gemini-flash-1.5", name: "Gemini 1.5 Flash", brandName: "Gemini 1.5 Flash", brand: "Google", realBrandName: "Google", logo: "/logos/gemini_flash.svg", color: "#4285F4", description: "High-speed Google intelligence", models: [{ id: "google/gemini-flash-1.5", name: "Gemini 1.5 Flash" }] },
    { id: "anthropic/claude-3-haiku", brandId: "anthropic/claude-3-haiku", name: "Llama 3.1 (Nvidia)", brandName: "Llama 3.1 (Nvidia)", brand: "Nvidia", realBrandName: "Nvidia", logo: "/logos/nvidia.png", color: "#76B900", description: "Nvidia optimized Llama performance", models: [{ id: "anthropic/claude-3-haiku", name: "Llama 3.1 (Nvidia)" }] },
    { id: "deepseek/deepseek-chat", brandId: "deepseek/deepseek-chat", name: "Qwen 3.6 Plus", brandName: "Qwen 3.6 Plus", brand: "Qwen", realBrandName: "Qwen", logo: "/logos/qwen.svg", color: "#A855F7", description: "Strong multi-lingual Qwen intelligence", models: [{ id: "deepseek/deepseek-chat", name: "Qwen 3.6 Plus" }] },
    { id: "deepseek/deepseek-r1-7b", brandId: "deepseek/deepseek-r1-7b", name: "DeepSeek R1 7B", brandName: "DeepSeek R1 7B", brand: "DeepSeek R1", realBrandName: "DeepSeek", logo: "/logos/deepseek_r1.svg", color: "#FF6B9D", description: "Reasoning and Chain-of-Thought", models: [{ id: "deepseek/deepseek-r1-7b", name: "DeepSeek R1 7B" }] },
    { id: "mistral/mistral-small-24b", brandId: "mistral/mistral-small-24b", name: "Mistral 24B", brandName: "Mistral 24B", brand: "Mistral AI", realBrandName: "Mistral", logo: "/logos/mistral_24b.svg", color: "#FFB74D", description: "Efficient and strong Mistral model", models: [{ id: "mistral/mistral-small-24b", name: "Mistral 24B" }] },
    { id: "openai/gpt-4o", brandId: "openai/gpt-4o", name: "GPT-4o Pro", brandName: "GPT-4o Pro", brand: "OpenAI", realBrandName: "OpenAI", logo: "/logos/gpt4o_pro.svg", color: "#D4AF37", description: "The most intelligent Pro model", models: [{ id: "openai/gpt-4o", name: "GPT-4o Pro" }] },
    { id: "arcee/trinity-large", brandId: "arcee/trinity-large", name: "Trinity Large", brandName: "Trinity Large", brand: "Arcee AI", realBrandName: "Arcee", logo: "/logos/trinity_large.svg", color: "#FF8A65", description: "Unique and powerful Trinity model", models: [{ id: "arcee/trinity-large", name: "Trinity Large" }] }
];
