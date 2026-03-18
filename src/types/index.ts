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

export const MODEL_BRANDS: AIBrand[] = [
    {
        brandId: "openai",
        brandName: "ChatGPT",
        realBrandName: "OpenAI",
        description: "The Gold Standard",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        color: "#10a37f",
        models: [
            { id: "gpt-4o-mini", name: "GPT-4o Mini", tier: "Moderate" },
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
            { id: "arcee-ai/trinity-mini:free", name: "Claude 3 Opus", tier: "Moderate" },
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
            { id: "openrouter/auto", name: "DeepSeek R1", tier: "Moderate" },
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
            { id: "Qwen/Qwen2.5-3B-Instruct", name: "Qwen 2.5 3B", tier: "Moderate" },
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
            { id: "meta-llama/Llama-3.2-3B-Instruct", name: "Llama 3.2 3B", tier: "Moderate" },
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
            { id: "google/gemma-2-9b-it", name: "Gemini 3.2 Flash", tier: "Moderate" },
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

