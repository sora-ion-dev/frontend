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
    "moonshot/kimi-k2",
    "nvidia/phi-4",
    "google/gemini-3.1-flash-lite",
    "arcee/trinity-large",
    "minimax/minimax-m2.5",
    "liquid/lfm-2.5",
    "nvidia/glm4-7",
    "nvidia/deepseek-v32",
    "xai/mistral-small"
];

export const IMAGE_FIESTA_BRAND_IDS = [
    "black-forest-labs/FLUX.1-schnell",
    "Qwen/Qwen-Image",
    "tencent/HunyuanImage-3.0",
    "ByteDance/SDXL-Lightning"
];

export const MODEL_BRANDS: AIBrand[] = [
    { id: "openai/gpt-4o-mini", brandId: "openai/gpt-4o-mini", name: "GPT-4o Mini", brandName: "GPT-4o Mini", brand: "OpenAI", realBrandName: "OpenAI", logo: "/logos/gpt4o_mini.svg", color: "#74aa9c", description: "Fast and reliable lightweight model", models: [{ id: "openai/gpt-4o-mini", name: "GPT-4o Mini" }] },
    { id: "openai/gpt-4o", brandId: "openai/gpt-4o", name: "GPT-4o Pro", brandName: "GPT-4o Pro", brand: "OpenAI", realBrandName: "OpenAI", logo: "/logos/gpt4o_pro.svg", color: "#D4AF37", description: "The most intelligent Pro model", models: [{ id: "openai/gpt-4o", name: "GPT-4o Pro" }] },
    { id: "meta-llama/llama-4-scout", brandId: "meta-llama/llama-4-scout", name: "Llama 4 Scout", brandName: "Llama 4 Scout", brand: "Meta", realBrandName: "Meta", logo: "/logos/llama33.svg", color: "#0668E1", description: "Next-gen Llama scout model", models: [{ id: "meta-llama/llama-4-scout", name: "Llama 4 Scout" }] },
    { id: "qwen/qwen3-32b", brandId: "qwen/qwen3-32b", name: "Qwen 3-32B", brandName: "Qwen 3-32B", brand: "Qwen", realBrandName: "Qwen", logo: "/logos/qwen.svg", color: "#A855F7", description: "Powerful Qwen 3 performance", models: [{ id: "qwen/qwen3-32b", name: "Qwen 3-32B" }] },
    { id: "moonshot/kimi-k2", brandId: "moonshot/kimi-k2", name: "Kimi K2", brandName: "Kimi K2", brand: "Moonshot", realBrandName: "Moonshot", logo: "/logos/moonshot.svg", color: "#FFB74D", description: "Intelligent Kimi K2 assistant", models: [{ id: "moonshot/kimi-k2", name: "Kimi K2" }] },
    { id: "nvidia/phi-4", brandId: "nvidia/phi-4", name: "Phi-4 Multimodal", brandName: "Phi-4 Multimodal", brand: "Microsoft", realBrandName: "Microsoft", logo: "/logos/microsoft.svg", color: "#00A4EF", description: "Advanced multimodal reasoning from Microsoft", models: [{ id: "nvidia/phi-4", name: "Phi-4 Multimodal" }] },
    { id: "google/gemini-3.1-flash-lite", brandId: "google/gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", brandName: "Gemini 3.1 Flash Lite", brand: "Google", realBrandName: "Google", logo: "/logos/gemini_flash.svg", color: "#4285F4", description: "Ultra-fast Gemini 3.1 intelligence", models: [{ id: "google/gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite" }] },
    { id: "arcee/trinity-large", brandId: "arcee/trinity-large", name: "Trinity Large", brandName: "Trinity Large", brand: "Arcee AI", realBrandName: "Arcee", logo: "/logos/trinity_large.svg", color: "#FF8A65", description: "High-performance Trinity model", models: [{ id: "arcee/trinity-large", name: "Trinity Large" }] },
    { id: "minimax/minimax-m2.5", brandId: "minimax/minimax-m2.5", name: "Minimax M2.5", brandName: "Minimax M2.5", brand: "Minimax", realBrandName: "Minimax", logo: "/logos/minimax.svg", color: "#45B7D1", description: "Minimax M2.5 efficiency", models: [{ id: "minimax/minimax-m2.5", name: "Minimax M2.5" }] },
    { id: "liquid/lfm-2.5", brandId: "liquid/lfm-2.5", name: "Liquid LFM", brandName: "Liquid LFM", brand: "Liquid AI", realBrandName: "Liquid", logo: "/logos/liquid.svg", color: "#95A5A6", description: "Liquid LFM performance", models: [{ id: "liquid/lfm-2.5", name: "Liquid LFM" }] },
    { id: "nvidia/glm4-7", brandId: "nvidia/glm4-7", name: "GLM 4.7 Reasoning", brandName: "GLM 4.7 Reasoning", brand: "Z-AI", realBrandName: "Z-AI", logo: "/logos/glm.svg", color: "#F39C12", description: "GLM 4.7 reasoning with thinking tokens", models: [{ id: "nvidia/glm4-7", name: "GLM 4.7 Reasoning" }] },
    { id: "nvidia/deepseek-v32", brandId: "nvidia/deepseek-v32", name: "DeepSeek V3.2", brandName: "DeepSeek V3.2", brand: "DeepSeek", realBrandName: "DeepSeek", logo: "/logos/deepseek_chat.svg", color: "#00E0FF", description: "State-of-the-art reasoning LLM", models: [{ id: "nvidia/deepseek-v32", name: "DeepSeek V3.2" }] },
    { id: "xai/mistral-small", brandId: "xai/mistral-small", name: "Cohere Command R", brandName: "Cohere Command R", brand: "Cohere", realBrandName: "Cohere", logo: "/logos/cohere.svg", color: "#E0E0E0", description: "High-performance R series from Cohere via GitHub", models: [{ id: "xai/mistral-small", name: "Cohere Command R" }] },
    // Image Fiesta Models (Consolidated 4)
    { id: "black-forest-labs/FLUX.1-schnell", brandId: "black-forest-labs/FLUX.1-schnell", name: "FLUX.1-schnell", brandName: "FLUX.1-schnell", brand: "BFL", realBrandName: "Black Forest Labs", logo: "/logos/bfl.svg", color: "#F39C12", description: "Top-tier realistic image generation", models: [{ id: "black-forest-labs/FLUX.1-schnell", name: "FLUX.1-schnell" }] },
    { id: "Qwen/Qwen-Image", brandId: "Qwen/Qwen-Image", name: "Qwen-Image", brandName: "Qwen-Image", brand: "Qwen", realBrandName: "Qwen", logo: "/logos/qwen.svg", color: "#A855F7", description: "Alibaba's visual foundational model", models: [{ id: "Qwen/Qwen-Image", name: "Qwen-Image" }] },
    { id: "tencent/HunyuanImage-3.0", brandId: "tencent/HunyuanImage-3.0", name: "Hunyuan 3.0", brandName: "Hunyuan 3.0", brand: "Tencent", realBrandName: "Tencent", logo: "/logos/tencent.svg", color: "#00E0FF", description: "Tencent's next-gen high-fidelity synthesis", models: [{ id: "tencent/HunyuanImage-3.0", name: "HunyuanImage-3.0" }] },
    { id: "ByteDance/SDXL-Lightning", brandId: "ByteDance/SDXL-Lightning", name: "SDXL Lightning", brandName: "SDXL Lightning", brand: "ByteDance", realBrandName: "ByteDance", logo: "/logos/bytedance.svg", color: "#00E0FF", description: "Ultra-fast SDXL-based high-fidelity generation from ByteDance", models: [{ id: "ByteDance/SDXL-Lightning", name: "SDXL Lightning" }] }
];
