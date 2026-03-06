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
        brandName: "OpenAI Models",
        realBrandName: "OpenAI",
        description: "The Gold Standard",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
        color: "#10a37f",
        models: [
            { id: "gpt-4o", name: "GPT-4o (Omni)", tier: "Pro" },
            { id: "gpt-4o-mini", name: "GPT-4o Mini", tier: "Moderate" },
            { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast)", tier: "Flash" },
        ],
    },
    {
        brandId: "arcee-trinity",
        brandName: "Arcee Trinity",
        realBrandName: "Arcee AI",
        description: "Specialized Small Models",
        logo: "https://github.com/arcee-ai.png",
        color: "#9333ea",
        models: [
            { id: "arcee-ai/trinity-large-preview:free", name: "Trinity Large", tier: "Pro" },
            { id: "arcee-ai/trinity-mini:free", name: "Trinity Mini", tier: "Moderate" },
            { id: "arcee-ai/trinity-mini:free", name: "Trinity Mini (F)", tier: "Flash" },
        ],
    },
    {
        brandId: "openrouter-free",
        brandName: "OpenRouter Free",
        realBrandName: "Auto Select",
        description: "Dynamic Free Models",
        logo: "https://openrouter.ai/favicon.ico",
        color: "#ffffff",
        models: [
            { id: "openrouter/auto", name: "Auto Select Free", tier: "Pro" },
            { id: "openrouter/auto", name: "Auto Select (Mod)", tier: "Moderate" },
            { id: "openrouter/auto", name: "Auto Select (Fast)", tier: "Flash" },
        ],
    },
    {
        brandId: "qwen",
        brandName: "Alibaba Qwen",
        realBrandName: "Qwen",
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
        brandName: "Meta Llama",
        realBrandName: "Llama",
        description: "Open Source King",
        logo: "https://github.com/meta-llama.png",
        color: "#1877F2",
        models: [
            { id: "meta-llama/Llama-3.1-8B-Instruct", name: "Llama 3.1 8B", tier: "Pro" },
            { id: "meta-llama/Llama-3.2-3B-Instruct", name: "Llama 3.2 3B", tier: "Moderate" },
            { id: "meta-llama/Llama-3.2-1B-Instruct", name: "Llama 3.2 1B", tier: "Flash" },
        ],
    },
    {
        brandId: "gemma-google",
        brandName: "Google Gemini",
        realBrandName: "Google",
        description: "Open models from Google",
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Gemma_logo.svg",
        color: "#4285F4",
        models: [
            { id: "google/gemma-2-27b-it", name: "Gemma 2 27B", tier: "Pro" },
            { id: "google/gemma-2-9b-it", name: "Gemma 2 9B", tier: "Moderate" },
            { id: "google/gemma-2-2b-it", name: "Gemma 2 2B", tier: "Flash" },
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

