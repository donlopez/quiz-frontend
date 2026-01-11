import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getSession,
    submitAnswers,
    finishQuiz,
} from "../api/quizService";

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
    }, [sessionId]);

    async function loadSession() {
        try {
            const data = await getSession(sessionId);
            setSession(data);
        } catch (err) {
            setError("Failed to load quiz session.");
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <p style={{ padding: 16 }}>Loading quiz...</p>;
    if (error) return <p style={{ color: "crimson" }}>{error}</p>;
    if (!session) return null;

    const questions = session.questions;
    const question = questions[currentIndex];
    const qId = question.questionId;

    function toggleChoice(choiceId) {
        const prev = selected[qId] || [];

        if (question.multiCorrect) {
            // toggle checkbox
            setSelected({
                ...selected,
                [qId]: prev.includes(choiceId)
                    ? prev.filter((id) => id !== choiceId)
                    : [...prev, choiceId],
            });
        } else {
            // radio (single choice)
            setSelected({
                ...selected,
                [qId]: [choiceId],
            });
        }
    }

    async function handleNext() {
        const answers = (selected[qId] || []).map((choiceId) => ({
            questionId: qId,
            selectedChoiceIds: [choiceId],
        }));

        try {
            await submitAnswers(sessionId, answers);

            if (currentIndex + 1 < questions.length) {
                setCurrentIndex(currentIndex + 1);
            } else {
                await finishQuiz(sessionId);
                navigate(`/results/${sessionId}`);
            }
        } catch (err) {
            setError("Failed to submit answer.");
        }
    }

    return (
        <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
            <h2>
                Question {currentIndex + 1} of {questions.length}
            </h2>

            <p style={{ marginBottom: 12 }}>{question.questionText}</p>

            <div style={{ display: "grid", gap: 8 }}>
                {question.choices.map((c) => (
                    <label key={c.choiceId} style={{ display: "flex", gap: 8 }}>
                        <input
                            type={question.multiCorrect ? "checkbox" : "radio"}
                            name={`q-${qId}`}
                            checked={(selected[qId] || []).includes(c.choiceId)}
                            onChange={() => toggleChoice(c.choiceId)}
                        />
                        <span>
              <strong>{c.label}.</strong> {c.text}
            </span>
                    </label>
                ))}
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

