import { api } from "./client";

export async function startQuiz(questionSetCode, limit = 10) {
    if (!questionSetCode) {
        throw new Error("startQuiz requires questionSetCode");
    }

    return (
        await api.post("/api/quiz/start", {
            questionSetCode,
            limit: Number(limit),
        })
    ).data;
}

export async function submitAnswers(sessionId, answers) {
    const sid = Number(sessionId);
    if (!Number.isFinite(sid)) {
        throw new Error("submitAnswers requires a valid numeric sessionId");
    }
    if (!Array.isArray(answers)) {
        throw new Error("submitAnswers requires answers to be an array");
    }

    return (
        await api.post("/api/quiz/submit", {
            sessionId: sid,
            answers,
        })
    ).data;
}

export async function finishQuiz(sessionId) {
    const sid = Number(sessionId);
    if (!Number.isFinite(sid)) {
        throw new Error("finishQuiz requires a valid numeric sessionId");
    }

    return (await api.post(`/api/quiz/finish/${sid}`)).data;
}

export async function getSession(sessionId) {
    const sid = Number(sessionId);
    if (!Number.isFinite(sid)) {
        throw new Error("getSession requires a valid numeric sessionId");
    }

    return (await api.get(`/api/quiz/session/${sid}`)).data;
}
