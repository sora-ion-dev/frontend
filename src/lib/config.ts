/**
 * Centralized configuration for the Axon AI frontend.
 * This ensures all API calls use the correct backend URL regardless of deployment.
 */

// On Hugging Face Spaces, the backend is typically on port 7860.
// We prioritize the environment variable, then try to detect the deployment host.
const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/$/, "");
  }

  // Fallback for browser-side detection
  if (typeof window !== "undefined") {
    // If we're on a .hf.space domain but no BACKEND_URL is set
    if (window.location.hostname.includes(".hf.space")) {
      return `${window.location.protocol}//${window.location.hostname}`;
    }
    // Specific check for local development if backend is on 7860
    if (window.location.hostname === "localhost") {
      return "http://localhost:7860"; 
    }
  }

  return "http://localhost:8000";
};

export const BACKEND_URL = getBackendUrl();
