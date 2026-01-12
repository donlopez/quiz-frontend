import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startQuiz } from "../api/quizService";
import { logout } from "../api/authService";

export default function SelectTest() {
    const navigate = useNavigate();
    const [questionSetCode, setQuestionSetCode] = useState("practice");
    const [limit, setLimit] = useState(10);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleStart() {
        setError("");
        setLoading(true);

        try {
            const data = await startQuiz(questionSetCode, Number(limit));
            // your backend returns: { sessionId, questionSet, totalQuestions }
            navigate(`/quiz/${data.sessionId}`);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to start quiz.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h2>Select Test</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <div style={{ display: "grid", gap: 12 }}>
                <label style={{ display: "grid", gap: 6 }}>
                    Test Type
                    <select
                        value={questionSetCode}
                        onChange={(e) => setQuestionSetCode(e.target.value)}
                    >
                        <option value="practice">Practice</option>
                        <option value="official">Official</option>
                    </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                    Number of Questions (limit)
                    <input
                        type="number"
                        min={1}
                        max={200}
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                    />
                </label>

                {error ? (
                    <div style={{ color: "crimson", fontSize: 14 }}>{error}</div>
                ) : null}

                <button disabled={loading} onClick={handleStart}>
                    {loading ? "Starting..." : "Start Quiz"}
                </button>
            </div>
        </div>
    );
}
