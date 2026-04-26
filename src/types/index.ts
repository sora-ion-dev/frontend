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
    "openai/gpt-4o",
    "meta-llama/llama-4-scout",
    "qwen/qwen3-32b",
    "nvidia/phi-4",
    "google/gemini-3.1-flash-lite",
    "huggingface/minimax-m2.7",
    "liquid/lfm-2.5",
    "huggingface/glm-5.1",
    "huggingface/deepseek-4-flash",
    "nvidia/mistral-large-3",
    "openrouter/nemotron-3-super",
    "openrouter/hy3-preview",
    "huggingface/kimi-k2.6"
];


export const MODEL_BRANDS: AIBrand[] = [
    { id: "openai/gpt-4o-mini", brandId: "openai/gpt-4o-mini", name: "GPT-4o Mini", brandName: "GPT-4o Mini", brand: "OpenAI", realBrandName: "OpenAI", logo: "/logos/gpt4o_mini.svg", color: "#74aa9c", description: "Fast and reliable lightweight model", models: [{ id: "openai/gpt-4o-mini", name: "GPT-4o Mini" }] },
    { id: "openai/gpt-4o", brandId: "openai/gpt-4o", name: "GPT-5 Mini", brandName: "GPT-5 Mini", brand: "OpenAI", realBrandName: "OpenAI", logo: "/logos/gpt4o_pro.svg", color: "#D4AF37", description: "The next generation flagship intelligence", models: [{ id: "openai/gpt-4o", name: "GPT-5 Mini" }] },
    { id: "meta-llama/llama-4-scout", brandId: "meta-llama/llama-4-scout", name: "Llama 4 Scout", brandName: "Llama 4 Scout", brand: "Meta", realBrandName: "Meta", logo: "/logos/llama33.svg", color: "#0668E1", description: "Next-gen Llama scout model", models: [{ id: "meta-llama/llama-4-scout", name: "Llama 4 Scout" }] },
    { id: "qwen/qwen3-32b", brandId: "qwen/qwen3-32b", name: "Qwen 3-32B", brandName: "Qwen 3-32B", brand: "Qwen", realBrandName: "Qwen", logo: "/logos/qwen.svg", color: "#A855F7", description: "Powerful Qwen 3 performance", models: [{ id: "qwen/qwen3-32b", name: "Qwen 3-32B" }] },
    { id: "nvidia/phi-4", brandId: "nvidia/phi-4", name: "Phi-4 Multimodal", brandName: "Phi-4 Multimodal", brand: "Microsoft", realBrandName: "Microsoft", logo: "/logos/microsoft.svg", color: "#00A4EF", description: "Advanced multimodal reasoning from Microsoft", models: [{ id: "nvidia/phi-4", name: "Phi-4 Multimodal" }] },
    { id: "google/gemini-3.1-flash-lite", brandId: "google/gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", brandName: "Gemini 3.1 Flash Lite", brand: "Google", realBrandName: "Google", logo: "/logos/gemini_flash.svg", color: "#4285F4", description: "Ultra-fast Gemini 3.1 intelligence", models: [{ id: "google/gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite" }] },
    { id: "minimax/minimax-m2.5", brandId: "minimax/minimax-m2.5", name: "Minimax M2.5", brandName: "Minimax M2.5", brand: "Minimax", realBrandName: "Minimax", logo: "/logos/minimax.svg", color: "#45B7D1", description: "Minimax M2.5 efficiency", models: [{ id: "minimax/minimax-m2.5", name: "Minimax M2.5" }] },
    { id: "liquid/lfm-2.5", brandId: "liquid/lfm-2.5", name: "Liquid LFM", brandName: "Liquid LFM", brand: "Liquid AI", realBrandName: "Liquid", logo: "/logos/liquid.svg", color: "#95A5A6", description: "Liquid LFM performance", models: [{ id: "liquid/lfm-2.5", name: "Liquid LFM" }] },
    { id: "huggingface/deepseek-4-flash", brandId: "huggingface/deepseek-4-flash", name: "DeepSeek 4 Flash", brandName: "DeepSeek 4 Flash", brand: "DeepSeek", realBrandName: "DeepSeek", logo: "/logos/deepseek_chat.svg", color: "#00E0FF", description: "Next-gen DeepSeek 4 Flash via Hugging Face", models: [{ id: "huggingface/deepseek-4-flash", name: "DeepSeek 4 Flash" }] },
    { id: "nvidia/mistral-large-3", brandId: "nvidia/mistral-large-3", name: "Mistral Large 3", brandName: "Mistral Large 3", brand: "Mistral", realBrandName: "Mistral AI", logo: "/logos/mistral.svg", color: "#F39C12", description: "Mistral's largest and most capable model with 675B parameters", models: [{ id: "nvidia/mistral-large-3", name: "Mistral Large 3" }] },
    { id: "openrouter/nemotron-3-super", brandId: "openrouter/nemotron-3-super", name: "Nemotron-3 Super", brandName: "Nemotron-3 Super", brand: "NVIDIA", realBrandName: "NVIDIA", logo: "/logos/nvidia.svg", color: "#76B900", description: "NVIDIA's supercharged Nemotron model with 120B parameters", models: [{ id: "openrouter/nemotron-3-super", name: "Nemotron-3 Super" }] },
    { id: "huggingface/minimax-m2.7", brandId: "huggingface/minimax-m2.7", name: "MiniMax M2.7", brandName: "MiniMax M2.7", brand: "MiniMax", realBrandName: "MiniMax AI", logo: "/logos/minimax.svg", color: "#45B7D1", description: "Next-gen M2.7 intelligence via Hugging Face", models: [{ id: "huggingface/minimax-m2.7", name: "MiniMax M2.7" }] },
    { id: "huggingface/glm-5.1", brandId: "huggingface/glm-5.1", name: "GLM 5.1 Reasoning", brandName: "GLM 5.1 Reasoning", brand: "Z-AI", realBrandName: "Z-AI", logo: "/logos/glm.svg", color: "#F39C12", description: "Ultra-high reasoning GLM 5.1 via Hugging Face Together", models: [{ id: "huggingface/glm-5.1", name: "GLM 5.1 Reasoning" }] },
    { id: "openrouter/hy3-preview", brandId: "openrouter/hy3-preview", name: "Tencent HY3 Preview", brandName: "Tencent HY3 Preview", brand: "Tencent", realBrandName: "Tencent", logo: "/logos/tencent.svg", color: "#00A4FF", description: "Tencent Hunyuan 3 Preview via OpenRouter", models: [{ id: "openrouter/hy3-preview", name: "Tencent HY3 Preview" }] },
    { id: "huggingface/kimi-k2.6", brandId: "huggingface/kimi-k2.6", name: "Kimi K2.6", brandName: "Kimi K2.6", brand: "Moonshot", realBrandName: "Moonshot", logo: "/logos/moonshot.svg", color: "#FFB74D", description: "New Kimi K2.6 from Moonshot via Hugging Face", models: [{ id: "huggingface/kimi-k2.6", name: "Kimi K2.6" }] }
];
