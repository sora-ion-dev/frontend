export type Tier = "Flash" | "Moderate" | "Pro";

export interface AIModel {
    id: string; // The huggingface model id
    name: string; // The UI display name
    tier: Tier;
}

export interface AIBrand {
    brandId: string; // Internal id (e.g. 'chatgpt', 'claude')
    brandName: string; // UI name (e.g. 'ChatGPT', 'Claude')
    realBrandName: string; // The actual underlying base model (e.g. 'Meta Llama', 'Mistral')
    description?: string; // Optional description
    logo: string; // We can use an icon or text graphic
    color: string; // Brand accent color for UI
    models: AIModel[];
}

// Model Mappings exactly from Hugging Face Router API, OpenRouter, and GitHub
export const MODEL_BRANDS: AIBrand[] = [
    {
        brandId: "openai",
        brandName: "ChatGPT",
        realBrandName: "OpenAI",
        description: "The Gold Standard",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        color: "#10a37f",
        models: [
            { id: "gpt-4o", name: "GPT-4o (Omni)", tier: "Pro" },
            { id: "gpt-4o-mini", name: "GPT-4o Mini", tier: "Moderate" },
            { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast)", tier: "Flash" },
        ],
    },
    {
        brandId: "arcee-trinity",
        brandName: "Claude",
        realBrandName: "Anthropic",
        description: "Cognitive Excellence",
        logo: "https://api.iconify.design/logos:anthropic-icon.svg",
        color: "#cc8b6e",
        models: [
            { id: "arcee-ai/trinity-large-preview:free", name: "Claude 3.5 Sonnet", tier: "Pro" },
            { id: "arcee-ai/trinity-mini:free", name: "Claude 3 Opus", tier: "Moderate" },
            { id: "arcee-ai/trinity-mini:free", name: "Claude 3 Haiku", tier: "Flash" },
        ],
    },
    {
        brandId: "openrouter-free",
        brandName: "DeepSeek",
        realBrandName: "DeepSeek AI",
        description: "Advanced Reasoning",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/DeepSeek_logo.svg",
        color: "#4d6edb",
        models: [
            { id: "openrouter/auto", name: "DeepSeek V3", tier: "Pro" },
            { id: "openrouter/auto", name: "DeepSeek R1", tier: "Moderate" },
            { id: "openrouter/auto", name: "DeepSeek Chat", tier: "Flash" },
        ],
    },
    {
        brandId: "qwen",
        brandName: "Qwen",
        realBrandName: "Alibaba",
        description: "Multilingual Excellence",
        logo: "https://github.com/Qwen.png",
        color: "#4a90e2",
        models: [
            { id: "Qwen/Qwen2.5-7B-Instruct", name: "Qwen 2.5 7B", tier: "Pro" },
            { id: "Qwen/Qwen2.5-3B-Instruct", name: "Qwen 2.5 3B", tier: "Moderate" },
            { id: "Qwen/Qwen2.5-1.5B-Instruct", name: "Qwen 2.5 1.5B", tier: "Flash" },
        ],
    },
    {
        brandId: "llama",
        brandName: "Meta",
        realBrandName: "Llama",
        description: "Open Source King",
        logo: "https://api.iconify.design/logos:meta-icon.svg",
        color: "#1877F2",
        models: [
            { id: "meta-llama/Llama-3.1-8B-Instruct", name: "Llama 3.1 8B", tier: "Pro" },
            { id: "meta-llama/Llama-3.2-3B-Instruct", name: "Llama 3.2 3B", tier: "Moderate" },
            { id: "meta-llama/Llama-3.2-1B-Instruct", name: "Llama 3.2 1B", tier: "Flash" },
        ],
    },
    {
        brandId: "gemini",
        brandName: "Gemini",
        realBrandName: "Google",
        description: "Google's most capable AI",
        logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Google_Gemini_logo_2025.svg",
        color: "#4285F4",
        models: [
            { id: "google/gemma-2-27b-it", name: "Gemini 3.2 Pro", tier: "Pro" },
            { id: "google/gemma-2-9b-it", name: "Gemini 3.2 Flash", tier: "Moderate" },
            { id: "google/gemma-2-2b-it", name: "Gemini 3.1 Medium", tier: "Flash" },
        ],
    },
];

export const FIESTA_MODEL_BRANDS = MODEL_BRANDS;


export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
}

