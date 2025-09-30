import { api, asApiError } from "./apis.jsx";

export async function fetchMatchmakerQuiz() {
  try {
    const res = await api.get("/matchmaker/quiz");
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}

export async function submitMatchmakerQuizAnswers(answers) {
  try {
    const res = await api.post("/matchmaker/quiz/submit", { answers });
    return res.data;
  } catch (error) {
    throw asApiError(error);
  }
}
