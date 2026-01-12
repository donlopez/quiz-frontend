import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:9090",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        // 🔍 DEBUG MODE: log the real error instead of force-logging out
        const status = err?.response?.status;
        const url = err?.config?.url;
        const method = err?.config?.method;
        const data = err?.response?.data;

        console.error("API ERROR:", {
            status,
            method,
            url,
            data,
        });

        // ❌ DO NOT auto-logout yet — this was hiding the real problem
        // We will re-enable this after backend is fully stable
        return Promise.reject(err);
    }
);
