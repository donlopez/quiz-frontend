import { api } from "./client";

/**
 * LOGIN
 * - Stores JWT if returned
 */
export async function login(email, password) {
    const response = await api.post("/api/auth/login", {
        email,
        password,
    });

    const { token } = response.data;

    if (!token) {
        throw new Error("Login response did not include token");
    }

    // Store JWT for axios interceptor
    localStorage.setItem("accessToken", token);

    return response.data;
}

/**
 * REGISTER
 * - Does NOT assume auto-login
 * - If backend later returns a token, we store it safely
 * - Supports email verification flows
 */
export async function register(username, email, password) {
    const payload = {
        email,
        password,
    };

    // Only send username if provided
    if (username) {
        payload.username = username;
    }

    const response = await api.post("/api/auth/register", payload);
    const data = response.data;

    // OPTIONAL: if backend returns token on register (auto-login)
    if (data?.token) {
        localStorage.setItem("accessToken", data.token);
    }

    /*
      Expected backend responses:
      --------------------------------
      A) { token: "JWT..." }                 -> auto-login
      B) { verificationRequired: true }      -> email verification needed
      C) { message: "User created" }         -> manual login required
    */

    return data;
}

/**
 * LOGOUT
 */
export function logout() {
    localStorage.removeItem("accessToken");
}
