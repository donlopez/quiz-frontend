import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, submitAnswers, finishQuiz } from "../api/quizService";

export default function QuizRunner() {
    const { sessionId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [session, setSession] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selected, setSelected] = useState({}); // { questionId: [choiceIds] }

    useEffect(() => {
        loadSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    async function loadSession() {
        setLoading(true);
        setError("");
        try {
            const data = await getSession(sessionId);
            setSession(data);
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load quiz session.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <p style={{ padding: 16 }}>Loading quiz...</p>;
    if (error) return <p style={{ color: "crimson", padding: 16 }}>{error}</p>;
    if (!session) return null;

    const questions = session.questions || [];
    const question = questions[currentIndex];
    const qId = question.questionId;

    // ✅ Fix #2: Support backend field naming
    const questionText =
        question.text ?? question.questionText ?? "(Missing question text)";

    const isMulti =
        Boolean(question.multiCorrect) ||
        Boolean(question.isMultiCorrect) ||
        Boolean(question.is_multi_correct);

    function toggleChoice(choiceId) {
        setError("");
        const prev = selected[qId] || [];

        if (isMulti) {
            // checkbox toggle
            setSelected({
                ...selected,
                [qId]: prev.includes(choiceId)
                    ? prev.filter((id) => id !== choiceId)
                    : [...prev, choiceId],
            });
        } else {
            // radio (single)
            setSelected({
                ...selected,
                [qId]: [choiceId],
            });
        }
    }

    async function handleNext() {
        setError("");

        const chosen = selected[qId] || [];
        if (chosen.length === 0) return;

        // ✅ Fix #1: Submit ONE answer object per question
        const answers = [
            {
                questionId: qId,
                selectedChoiceIds: chosen,
            },
        ];

        try {
            await submitAnswers(Number(sessionId), answers);

            if (currentIndex + 1 < questions.length) {
                setCurrentIndex(currentIndex + 1);
            } else {
                await finishQuiz(Number(sessionId));
                navigate(`/results/${sessionId}`);
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Failed to submit answer.";
            setError(msg);
        }
    }

    return (
        <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
            <h2>
                Question {currentIndex + 1} of {questions.length}
            </h2>

            <p style={{ marginBottom: 12 }}>{questionText}</p>

            <div style={{ display: "grid", gap: 8 }}>
                {(question.choices || []).map((c) => {
                    const choiceText = c.text ?? c.choiceText ?? "";
                    const choiceLabel = c.label ?? c.choiceLabel ?? "";

                    return (
                        <label key={c.choiceId} style={{ display: "flex", gap: 8 }}>
                            <input
                                type={isMulti ? "checkbox" : "radio"}
                                name={`q-${qId}`}
                                checked={(selected[qId] || []).includes(c.choiceId)}
                                onChange={() => toggleChoice(c.choiceId)}
                            />
                            <span>
                {choiceLabel ? <strong>{choiceLabel}.</strong> : null}{" "}
                                {choiceText}
              </span>
                        </label>
                    );
                })}
            </div>

            {error && (
                <div style={{ color: "crimson", marginTop: 12 }}>{error}</div>
            )}

            <button
                style={{ marginTop: 20 }}
                onClick={handleNext}
                disabled={!selected[qId]?.length}
            >
                {currentIndex + 1 === questions.length ? "Finish Quiz" : "Next"}
            </button>
        </div>
    );
}
