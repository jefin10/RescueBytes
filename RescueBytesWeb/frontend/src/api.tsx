// In Docker the frontend nginx proxies API calls, so the base URL is empty (same origin).
// Set VITE_API_URL at build time only if you need to call a remote backend directly.
const api_url: string = import.meta.env.VITE_API_URL ?? '';
export default api_url;