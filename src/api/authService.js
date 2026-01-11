import { api } from "./client";

export async function login(email, password) {
    const data = (await api.post("/api/auth/login", { email, password })).data;

    const token = data.accessToken || data.token;
    if (!token) {
        throw new Error("Login response did not include a token");
    }

    localStorage.setItem("accessToken", token);
    return data;
}

export async function register(username, email, password) {
    return (
        await api.post("/api/auth/register", {
            username,
            email,
            password,
        })
    ).data;
}

export function logout() {
    localStorage.removeItem("accessToken");
}
