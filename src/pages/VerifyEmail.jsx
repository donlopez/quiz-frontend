import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { api } from "../api/client";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function VerifyEmail() {
    const query = useQuery();
    const navigate = useNavigate();

    const [token, setToken] = useState(query.get("token") || "");
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        // auto-verify if token came via URL
        if (query.get("token")) {
            handleVerify(query.get("token"));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function handleVerify(tok = token) {
        setLoading(true);
        setError("");
        setMsg("");
        try {
            const res = await api.post("/api/auth/verify", { token: tok });
            setMsg(res.data?.message || "Verified!");
            // after a moment, send to login
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            const m =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Verification failed.";
            setError(typeof m === "string" ? m : "Verification failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
            <h2>Verify Email</h2>

            <p style={{ opacity: 0.85 }}>
                Paste your verification token or use the link you received.
            </p>

            <label style={{ display: "grid", gap: 6 }}>
                Verification Token
                <input
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste token here"
                />
            </label>

            {error ? <div style={{ color: "crimson", marginTop: 10 }}>{error}</div> : null}
            {msg ? <div style={{ color: "#30d158", marginTop: 10 }}>{msg}</div> : null}

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <button disabled={loading || !token.trim()} onClick={() => handleVerify(token.trim())}>
                    {loading ? "Verifying..." : "Verify"}
                </button>
                <Link to="/login" style={{ alignSelf: "center" }}>Back to Login</Link>
            </div>
        </div>
    );
}
