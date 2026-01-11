import { api } from "./client";

export async function startQuiz(questionSetCode, limit = 10) {
    return (
        await api.post("/api/quiz/start", {
            questionSetCode,
            limit,
        })
    ).data;
}

export async function submitAnswers(sessionId, answers) {
    return (
        await api.post("/api/quiz/submit", {
            sessionId,
            answers,
        })
    ).data;
}

export async function finishQuiz(sessionId) {
    return (await api.post(`/api/quiz/finish/${sessionId}`)).data;
}

export async function getSession(sessionId) {
    return (await api.get(`/api/quiz/session/${sessionId}`)).data;
}
