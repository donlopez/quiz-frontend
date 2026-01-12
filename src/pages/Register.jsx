import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authService";

// --- Password policy (client-side) ---
function validatePassword(pw) {
    const rules = {
        length: pw.length >= 10,
        upper: /[A-Z]/.test(pw),
        lower: /[a-z]/.test(pw),
        number: /\d/.test(pw),
        special: /[^A-Za-z0-9]/.test(pw),
    };

    const passedCount = Object.values(rules).filter(Boolean).length;

    // simple strength score
    const strength =
        passedCount <= 2 ? "Weak" : passedCount === 3 ? "Fair" : passedCount === 4 ? "Good" : "Strong";

    return { rules, strength, ok: rules.length && rules.lower && rules.number };
}

export default function Register() {
    const navigate = useNavigate();

    const [username, setUsername] = useState(""); // optional if backend supports
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const pw = useMemo(() => validatePassword(password), [password]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!pw.ok) {
            setError("Password is too weak. Please meet the minimum requirements.");
            return;
        }

        setLoading(true);
        try {
            // Backend options:
            // A) returns { token: "..." } -> auto-login
            // B) returns { message: "...", verificationRequired: true } -> show verification instructions
            // C) returns created user -> then user must login
            const data = await register(username.trim() || null, email.trim(), password);

            // If backend returns a token, auto-login is already handled in authService (recommended)
            if (data?.verificationRequired) {
                setSuccessMsg(
                    "Account created! Check your email for a verification link/code before logging in."
                );
                // Optionally: navigate to a VerifyEmail page if you create one
                // navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
                return;
            }

            // If backend returns token -> go straight to select-test
            if (data?.token || data?.accessToken) {
                navigate("/select-test");
                return;
            }

            // Otherwise, fallback: go to login
            setSuccessMsg("Account created! Please log in.");
            navigate("/login");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Registration failed.";
            setError(typeof msg === "string" ? msg : "Registration failed.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 480, margin: "40px auto", padding: 16 }}>
            <h2>Register</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                    Username (optional)
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="julio"
                        autoComplete="username"
                    />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    Email
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        type="email"
                        autoComplete="email"
                        required
                    />
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    Password
                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 10 chars"
                        type="password"
                        autoComplete="new-password"
                        required
                    />
                </label>

                {/* Password Strength UI */}
                <div style={{ fontSize: 14, opacity: 0.9 }}>
                    <div>
                        Strength: <strong>{pw.strength}</strong>
                    </div>
                    <ul style={{ margin: "8px 0 0 18px", padding: 0, lineHeight: 1.5 }}>
                        <li style={{ opacity: pw.rules.length ? 1 : 0.6 }}>
                            {pw.rules.length ? "✓" : "•"} At least 10 characters
                        </li>
                        <li style={{ opacity: pw.rules.upper ? 1 : 0.6 }}>
                            {pw.rules.upper ? "✓" : "•"} Contains an uppercase letter (recommended)
                        </li>
                        <li style={{ opacity: pw.rules.lower ? 1 : 0.6 }}>
                            {pw.rules.lower ? "✓" : "•"} Contains a lowercase letter (required)
                        </li>
                        <li style={{ opacity: pw.rules.number ? 1 : 0.6 }}>
                            {pw.rules.number ? "✓" : "•"} Contains a number (required)
                        </li>
                        <li style={{ opacity: pw.rules.special ? 1 : 0.6 }}>
                            {pw.rules.special ? "✓" : "•"} Contains a special character (recommended)
                        </li>
                    </ul>
                </div>

                {error ? <div style={{ color: "crimson" }}>{error}</div> : null}
                {successMsg ? <div style={{ color: "#30d158" }}>{successMsg}</div> : null}

                <button disabled={loading} type="submit">
                    {loading ? "Creating account..." : "Create account"}
                </button>
            </form>

            <p style={{ marginTop: 12, fontSize: 14 }}>
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}

