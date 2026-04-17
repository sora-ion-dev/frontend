/**
 * Centralized configuration for the Axon AI frontend.
 * This ensures all API calls use the correct backend URL regardless of deployment.
 */

const getBackendUrl = () => {
  // 1. Prioritize official environment variable (Standard for Netlify/Vercel)
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    let url = process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "");
    
    // Auto-convert Hugging Face Space URL to direct API URL
    // Format: https://huggingface.co/spaces/user/space-name -> https://user-space-name.hf.space
    if (url.includes("huggingface.co/spaces/")) {
      const parts = url.split("huggingface.co/spaces/")[1].split("/");
      if (parts.length >= 2) {
        const user = parts[0].toLowerCase();
        const spaceName = parts[1].toLowerCase().replace(/_/g, "-");
        return `https://${user}-${spaceName}.hf.space`;
      }
    }
    
    return url;
  }

  // 2. Browser-side detection for dynamic environments
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Detection for Hugging Face Spaces subdomains
    if (hostname.includes(".hf.space")) {
      return `${protocol}//${hostname}`;
    }
    
    // Detection for local development
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
      // Logic for local testing: backend is on 8000
      return `${protocol}//${hostname}:8000`; 
    }
  }

  // Final fallback (Local dev default)
  return "http://localhost:8000";
};

export const BACKEND_URL = getBackendUrl();
