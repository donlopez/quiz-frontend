import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/authService";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("demo2@example.com");
    const [password, setPassword] = useState("Beautifulday24");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email.trim(), password);
            navigate("/select-test");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Login failed. Please check credentials.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
            <h2>Login</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                    Email
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="you@example.com"
                        required
                    />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    Password
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="••••••••"
                        required
                    />
                </label>

                {error ? (
                    <div style={{ color: "crimson", fontSize: 14 }}>{error}</div>
                ) : null}

                <button disabled={loading} type="submit">
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p style={{ marginTop: 12, fontSize: 14 }}>
                Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}
