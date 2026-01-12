import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSession } from "../api/quizService";

export default function Results() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [session, setSession] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getSession(sessionId);
                setSession(data);
            } catch (err) {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load results.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        })();
    }, [sessionId]);

    const summary = useMemo(() => {
        if (!session?.questions) return null;

        const total = session.totalQuestions ?? session.questions.length ?? 0;
        const score = session.score ?? 0;
        const finished = session.status === "finished" || Boolean(session.finishedAt);

        return { total, score, finished };
    }, [session]);

    if (loading) return <div style={{ padding: 16 }}>Loading results...</div>;
    if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;
    if (!session) return null;

    return (
        <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div>
                    <h2>Results</h2>
                    <div style={{ opacity: 0.85, fontSize: 14 }}>
                        Session ID: {session.sessionId}
                    </div>
                    <div style={{ opacity: 0.85, fontSize: 14 }}>
                        Set: {session.questionSetCode ?? session.questionSet ?? "unknown"}
                    </div>
                    <div style={{ opacity: 0.85, fontSize: 14 }}>
                        Status: {session.status}
                    </div>
                </div>

                <div style={{ textAlign: "right" }}>
                    {summary ? (
                        <>
                            <div style={{ fontSize: 18 }}>
                                Score: <strong>{summary.score}</strong> / {summary.total}
                            </div>
                            <div style={{ opacity: 0.85, fontSize: 14 }}>
                                {summary.finished
                                    ? "Finished — answers & explanations shown."
                                    : "In progress — correct answers hidden."}
                            </div>
                        </>
                    ) : null}

                    <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button onClick={() => navigate("/select-test")}>Back</button>
                    </div>
                </div>
            </div>

            <hr style={{ margin: "16px 0", opacity: 0.2 }} />

            {(session.questions || []).map((q, idx) => {
                const qText = q.text ?? q.questionText ?? "(Missing question text)";
                const choices = q.choices || [];

                const selectedIds = q.selectedChoiceIds || [];
                const correctIds = q.correctChoiceIds || [];

                const finished = summary?.finished;

                const selectedSet = new Set(selectedIds);
                const correctSet = new Set(correctIds);

                const isCorrect =
                    finished && selectedIds.length > 0
                        ? [...selectedSet].sort().join(",") === [...correctSet].sort().join(",")
                        : false;

                return (
                    <div
                        key={q.questionId}
                        style={{
                            padding: 16,
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: 10,
                            marginBottom: 14,
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ fontWeight: 600 }}>
                                {idx + 1}. {qText}
                            </div>

                            {finished ? (
                                <div
                                    style={{
                                        fontWeight: 700,
                                        color: isCorrect ? "#30d158" : "#ff453a",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {isCorrect ? "Correct" : "Incorrect"}
                                </div>
                            ) : null}
                        </div>

                        <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                            {choices.map((c) => {
                                const choiceId = c.choiceId;
                                const label = c.label ?? c.choiceLabel ?? "";
                                const text = c.text ?? c.choiceText ?? "";

                                const isSelected = selectedSet.has(choiceId);
                                const isCorrectChoice = finished && correctSet.has(choiceId);

                                return (
                                    <div
                                        key={choiceId}
                                        style={{
                                            padding: "8px 10px",
                                            borderRadius: 8,
                                            border: "1px solid rgba(255,255,255,0.10)",
                                            background: isCorrectChoice
                                                ? "rgba(48,209,88,0.12)"
                                                : isSelected
                                                    ? "rgba(10,132,255,0.10)"
                                                    : "transparent",
                                        }}
                                    >
                                        <span style={{ fontWeight: 700 }}>{label}.</span>{" "}
                                        <span>{text}</span>

                                        {isCorrectChoice ? (
                                            <span style={{ marginLeft: 8, fontWeight: 700, color: "#30d158" }}>
                        ✓
                      </span>
                                        ) : null}

                                        {!isCorrectChoice && isSelected ? (
                                            <span style={{ marginLeft: 8, fontWeight: 700, color: "#0a84ff" }}>
                        (Selected)
                      </span>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>

                        {finished && q.explanation ? (
                            <div style={{ marginTop: 12, opacity: 0.9 }}>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>Explanation</div>
                                <div style={{ lineHeight: 1.4 }}>{q.explanation}</div>
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
