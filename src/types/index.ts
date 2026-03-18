export type Tier = "Flash" | "Moderate" | "Pro";

export interface AIModel {
    id: string; // The huggingface model id
    name: string; // The UI display name
    tier: Tier;
    hasVision?: boolean;
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
        description: "Industrial grade reasoning and world knowledge.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg",
        color: "#10a37f",
        models: [
            { id: "gpt-4o-mini", name: "GPT-4o Mini", tier: "Flash" },
            { id: "gpt-4o", name: "GPT-4o", tier: "Pro" },
        ],
    },
    {
        brandId: "arcee-trinity",
        brandName: "Claude",
        realBrandName: "Anthropic",
        description: "The most human-like thinking and nuanced reasoning.",
        logo: "https://api.iconify.design/logos:anthropic-icon.svg",
        color: "#cc8b6e",
        models: [
            { id: "arcee-ai/trinity-mini:free", name: "Claude 3 Haiku", tier: "Flash" },
            { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", tier: "Pro" },
        ],
    },
    {
        brandId: "openrouter-free",
        brandName: "DeepSeek",
        realBrandName: "DeepSeek AI",
        description: "SOTA reasoning and coding performance.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/4d/DeepSeek_logo.svg",
        color: "#4d6edb",
        models: [
            { id: "deepseek/deepseek-chat", name: "DeepSeek V3", tier: "Flash" },
            { id: "deepseek/deepseek-r1", name: "DeepSeek R1", tier: "Pro" },
        ],
    },
    {
        brandId: "qwen",
        brandName: "Qwen",
        realBrandName: "Alibaba",
        description: "Multilingual champion from Alibaba Cloud.",
        logo: "https://github.com/Qwen.png",
        color: "#4a90e2",
        models: [
            { id: "Qwen/Qwen2.5-7B-Instruct", name: "Qwen 2.5 7B", tier: "Flash" },
            { id: "Qwen/Qwen2.5-72B-Instruct", name: "Qwen 2.5 72B", tier: "Pro" },
        ],
    },
    {
        brandId: "llama",
        brandName: "Meta",
        realBrandName: "Llama",
        description: "Open source excellence in intelligence.",
        logo: "https://api.iconify.design/logos:meta-icon.svg",
        color: "#1877F2",
        models: [
            { id: "meta-llama/Llama-3.2-3B-Instruct", name: "Llama 3.2 3B", tier: "Flash" },
            { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B", tier: "Pro" },
        ],
    },
    {
        brandId: "gemini",
        brandName: "Gemini",
        realBrandName: "Google",
        description: "Google's most capable multimodal models.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/8/87/Google_Gemini_logo_2025.svg",
        color: "#4285F4",
        models: [
            { id: "google/gemma-2-9b-it", name: "Gemma 2 9B", tier: "Flash" },
            { id: "google/gemma-2-27b-it", name: "Gemma 2 27B", tier: "Pro" },
        ],
    },
    {
        brandId: "phi",
        brandName: "Phi",
        realBrandName: "Microsoft",
        description: "Efficient and smart small language models.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
        color: "#F25022",
        models: [
            { id: "microsoft/phi-3-mini-4k-instruct", name: "Phi-3 Mini", tier: "Flash" },
            { id: "microsoft/phi-3.5-moe-instruct", name: "Phi-3.5 MoE", tier: "Pro" },
        ],
    },
    {
        brandId: "mistral",
        brandName: "Mistral",
        realBrandName: "Mistral AI",
        description: "European champion of open-weight AI.",
        logo: "https://mistral.ai/images/logo.svg",
        color: "#f5d142",
        models: [
            { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B", tier: "Flash" },
            { id: "mistralai/Mixtral-8x7B-Instruct-v0.1", name: "Mixtral 8x7B", tier: "Pro" },
        ],
    },
    {
        brandId: "nvidia",
        brandName: "Nemotron",
        realBrandName: "NVIDIA",
        description: "NVIDIA's specialized instruction-following models.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg",
        color: "#76B900",
        models: [
            { id: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron 70B", tier: "Flash" },
            { id: "nvidia/nemotron-4-340b-instruct", name: "Nemotron 340B", tier: "Pro" },
        ],
    },
    {
        brandId: "cohere",
        brandName: "Command",
        realBrandName: "Cohere",
        description: "Built for enterprise and RAG tasks.",
        logo: "https://api.iconify.design/logos:cohere-icon.svg",
        color: "#cc99ff",
        models: [
            { id: "cohere/command-r", name: "Command R", tier: "Flash" },
            { id: "cohere/command-r-plus", name: "Command R+", tier: "Pro" },
        ],
    },
    {
        brandId: "ai21",
        brandName: "Jamba",
        realBrandName: "AI21 Labs",
        description: "Hybrid Mamba architecture with massive context.",
        logo: "https://www.ai21.com/favicon-32x32.png",
        color: "#ff3366",
        models: [
            { id: "ai21/jamba-1.5-mini", name: "Jamba 1.5 Mini", tier: "Flash" },
            { id: "ai21/jamba-1.5-large", name: "Jamba 1.5 Large", tier: "Pro" },
        ],
    },
    {
        brandId: "zhipu",
        brandName: "GLM",
        realBrandName: "Zhipu AI",
        description: "Strong bilingual excellence and math skills.",
        logo: "https://zhipuai.cn/favicon.ico",
        color: "#3399ff",
        models: [
            { id: "zhipu/glm-4-9b-chat", name: "GLM-4 9B", tier: "Flash" },
            { id: "thmvn/glm-4-pro", name: "GLM-4 Pro", tier: "Pro" },
        ],
    },
    {
        brandId: "xai",
        brandName: "Grok",
        realBrandName: "xAI",
        description: "Witty and real-time aware models from xAI.",
        logo: "https://x.ai/favicon.ico",
        color: "#000000",
        models: [
            { id: "x-ai/grok-beta", name: "Grok Beta", tier: "Flash" },
            { id: "x-ai/grok-1", name: "Grok-1", tier: "Pro" },
        ],
    },
    {
        brandId: "liquid",
        brandName: "Liquid",
        realBrandName: "Liquid AI",
        description: "Next generation non-transformer architecture.",
        logo: "https://liquid.ai/favicon.ico",
        color: "#00ffcc",
        models: [
            { id: "liquid/lfm-3b", name: "Liquid LFM 3B", tier: "Flash" },
            { id: "liquid/lfm-40b", name: "Liquid LFM 40B", tier: "Pro" },
        ],
    },
    {
        brandId: "nous",
        brandName: "Hermes",
        realBrandName: "Nous Research",
        description: "The gold standard for natural instructions.",
        logo: "https://nousresearch.com/favicon.ico",
        color: "#ff9900",
        models: [
            { id: "nousresearch/hermes-3-llama-3.1-8b", name: "Hermes 3 8B", tier: "Flash" },
            { id: "nousresearch/hermes-3-llama-3.1-405b", name: "Hermes 3 405B", tier: "Pro" },
        ],
    },
    {
        brandId: "perplexity",
        brandName: "Sonar",
        realBrandName: "Perplexity",
        description: "The world's best real-time search engine.",
        logo: "https://www.perplexity.ai/favicon.ico",
        color: "#1fb8a8",
        models: [
            { id: "perplexity/sonar-small-online", name: "Sonar Flash", tier: "Flash" },
            { id: "perplexity/sonar-large-online", name: "Sonar Pro", tier: "Pro" },
        ],
    },
    {
        brandId: "sambanova",
        brandName: "Samba",
        realBrandName: "SambaNova",
        description: "RDU-optimized ultra-fast inference.",
        logo: "https://sambanova.ai/favicon.ico",
        color: "#ff6600",
        models: [
            { id: "sambanova/samba-coe-v4", name: "Samba CoE", tier: "Flash" },
            { id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 405B", tier: "Pro" },
        ],
    },
    {
        brandId: "01ai",
        brandName: "Yi",
        realBrandName: "01.AI",
        description: "High-performance models from Yi-team.",
        logo: "https://01.ai/favicon.ico",
        color: "#ff3300",
        models: [
            { id: "01-ai/yi-1.5-9b-chat", name: "Yi 1.5 9B", tier: "Flash" },
            { id: "01-ai/yi-lightning", name: "Yi Lightning", tier: "Pro" },
        ],
    },
    {
        brandId: "shlab",
        brandName: "Intern",
        realBrandName: "Shanghai AI Lab",
        description: "Powerful logical reasoning from Shanghai AI Lab.",
        logo: "https://internlm.intern-ai.org.cn/favicon.ico",
        color: "#3366ff",
        models: [
            { id: "internlm/internlm2_5-7b-chat", name: "InternLM 2.5 7B", tier: "Flash" },
            { id: "internlm/internlm2_5-20b-chat", name: "InternLM 2.5 20B", tier: "Pro" },
        ],
    },
    {
        brandId: "gryphe",
        brandName: "Mytho",
        realBrandName: "Gryphe",
        description: "The king of creative writing and roleplay.",
        logo: "https://api.iconify.design/mdi:book-open-page-variant.svg",
        color: "#ff00ff",
        models: [
            { id: "gryphe/mythomax-l2-13b", name: "MythoMax 13B", tier: "Flash" },
            { id: "gryphe/mythic-v2", name: "Mythic V2", tier: "Pro" },
        ],
    },
    {
        brandId: "openchat",
        brandName: "OpenChat",
        realBrandName: "OpenChat Team",
        description: "Superior conversation skills in a small package.",
        logo: "https://openchat.team/favicon.ico",
        color: "#00cc99",
        models: [
            { id: "openchat/openchat-3.5-0106", name: "OpenChat 3.5", tier: "Flash" },
            { id: "openchat/openchat-3.6", name: "OpenChat 3.6 Pro", tier: "Pro" },
        ],
    },
    {
        brandId: "intel",
        brandName: "Neural",
        realBrandName: "Intel",
        description: "Intel's optimized high-quality chat models.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Intel-logo.svg",
        color: "#0071C5",
        models: [
            { id: "intel/neural-chat-7b-v3-3", name: "Neural Chat", tier: "Flash" },
            { id: "intel/neural-chat-70b", name: "Neural 70B", tier: "Pro" },
        ],
    },
    {
        brandId: "together",
        brandName: "Hyena",
        realBrandName: "Together AI",
        description: "Hybrid architecture for long context and speed.",
        logo: "https://www.together.ai/favicon.ico",
        color: "#6600ff",
        models: [
            { id: "togethercomputer/stripedhyena-nohessian-7b", name: "StripedHyena", tier: "Flash" },
            { id: "togethercomputer/stripedhyena-hessian-7b", name: "Hyena Pro", tier: "Pro" },
        ],
    },
    {
        brandId: "bigcode",
        brandName: "StarCoder",
        realBrandName: "BigCode",
        description: "The ultimate coding and technical assistant.",
        logo: "https://api.iconify.design/mdi:code-braces.svg",
        color: "#000000",
        models: [
            { id: "bigcode/starcoder2-7b", name: "StarCoder 2 7B", tier: "Flash" },
            { id: "bigcode/starcoder2-15b", name: "StarCoder 2 15B", tier: "Pro" },
        ],
    },
    {
        brandId: "tii",
        brandName: "Falcon",
        realBrandName: "TII",
        description: "The massive open-weights powerhouse.",
        logo: "https://api.iconify.design/mdi:curling.svg",
        color: "#ffcc00",
        models: [
            { id: "tiiuae/falcon-7b-instruct", name: "Falcon 7B", tier: "Flash" },
            { id: "tiiuae/falcon-180b-chat", name: "Falcon 180B", tier: "Pro" },
        ],
    },
    {
        brandId: "databricks",
        brandName: "DBRX",
        realBrandName: "Databricks",
        description: "High-performance MoE from Databricks.",
        logo: "https://www.databricks.com/favicon.ico",
        color: "#ff3366",
        models: [
            { id: "databricks/dbrx-instruct", name: "DBRX Flash", tier: "Flash" },
            { id: "databricks/dbrx-pro", name: "DBRX Pro", tier: "Pro" },
        ],
    },
    {
        brandId: "nexusflow",
        brandName: "Athene",
        realBrandName: "Nexusflow",
        description: "Top-tier open models for instruction following.",
        logo: "https://nexusflow.ai/favicon.ico",
        color: "#6633cc",
        models: [
            { id: "nexusflow/athene-70b", name: "Athene 70B", tier: "Flash" },
            { id: "nexusflow/athene-2-70b", name: "Athene 2 Pro", tier: "Pro" },
        ],
    },
    {
        brandId: "upstage",
        brandName: "Solar",
        realBrandName: "Upstage",
        description: "Award-winning compact and smart models.",
        logo: "https://www.upstage.ai/favicon.ico",
        color: "#ffcc00",
        models: [
            { id: "upstage/solar-10.7b-instruct", name: "Solar 10.7B", tier: "Flash" },
            { id: "upstage/solar-pro", name: "Solar Pro", tier: "Pro" },
        ],
    },
    {
        brandId: "openbmb",
        brandName: "MiniCPM",
        realBrandName: "OpenBMB",
        description: "Multimodal and powerful small models.",
        logo: "https://www.openbmb.org/favicon.ico",
        color: "#ff3300",
        models: [
            { id: "openbmb/minicpm-v-2_6", name: "MiniCPM V2.6", tier: "Flash" },
            { id: "openbmb/minicpm-3-4b", name: "MiniCPM 3 Pro", tier: "Pro" },
        ],
    },
    {
        brandId: "ibm",
        brandName: "Granite",
        realBrandName: "IBM",
        description: "IBM's reliable and enterprise-ready models.",
        logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg",
        color: "#0530ad",
        models: [
            { id: "ibm/granite-3.0-8b-instruct", name: "Granite 3.0 8B", tier: "Flash" },
            { id: "ibm/granite-3.0-2b-instruct", name: "Granite 3.0 2B", tier: "Pro" },
        ],
    },
    {
        brandId: "segmind",
        brandName: "Segmind",
        realBrandName: "Image Intelligence",
        description: "Fastest image generation and visual reasoning.",
        logo: "https://www.segmind.com/favicon.ico",
        color: "#00ccff",
        models: [
            { id: "segmind/sdxl-lightning", name: "Segmind Flash", tier: "Flash" },
            { id: "segmind/flux-pro", name: "Flux Pro", tier: "Pro" },
        ],
    },
];

export const FIESTA_BRAND_IDS = [
    "openai", "arcee-trinity", "openrouter-free", "qwen", "llama", "gemini", "phi", "mistral", "nvidia"
];

export const FIESTA_MODEL_BRANDS = MODEL_BRANDS.filter(brand => FIESTA_BRAND_IDS.includes(brand.brandId));


export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    isStreaming?: boolean;
    brand?: AIBrand;
}

