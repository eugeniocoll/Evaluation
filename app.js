const filesByDifficulty = {
  normal: "preguntas_normal.json",
  mixed: "preguntas_mixed.json",
  hard: "preguntas_hard.json",
  standard_exam: "standard_exam.json",
  hard_exam: "hard_exam.json"
};

let questions = [];
let currentIndex = 0;
let score = 0;
let selectedAnswerIndex = null;

const difficultySelect = document.getElementById("difficulty");
const numQuestionsInput = document.getElementById("numQuestions");
const startBtn = document.getElementById("startBtn");
const quizSection = document.getElementById("quiz");
const resultSection = document.getElementById("result");
const questionText = document.getElementById("questionText");
const answersList = document.getElementById("answersList");
const feedbackDiv = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const progressDiv = document.getElementById("progress");
const scoreText = document.getElementById("scoreText");
const restartBtn = document.getElementById("restartBtn");
const searchBtn = document.getElementById("searchBtn");

startBtn.addEventListener("click", startQuiz);
nextBtn.addEventListener("click", handleNext);
restartBtn.addEventListener("click", resetQuiz);
searchBtn.addEventListener("click", searchOnline);

async function startQuiz() {
  const difficulty = difficultySelect.value;
  const file = filesByDifficulty[difficulty];
  const numRequested = parseInt(numQuestionsInput.value, 10) || 10;

  try {
    const res = await fetch(file);
    const data = await res.json();

    const shuffled = [...data].sort(() => Math.random() - 0.5);
    questions = shuffled.slice(0, Math.min(numRequested, shuffled.length));

    currentIndex = 0;
    score = 0;
    selectedAnswerIndex = null;

    document.getElementById("config").classList.add("hidden");
    resultSection.classList.add("hidden");
    quizSection.classList.remove("hidden");

    renderQuestion();
  } catch (err) {
    alert("Error cargando preguntas: " + err.message);
  }
}

function renderQuestion() {
  const q = questions[currentIndex];
  selectedAnswerIndex = null;
  nextBtn.disabled = true;

  progressDiv.textContent = `Pregunta ${currentIndex + 1} de ${questions.length}`;
  questionText.textContent = q.question;
  answersList.innerHTML = "";
  feedbackDiv.classList.add("hidden");
  feedbackDiv.textContent = "";

  q.answers.forEach((ans, index) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.textContent = ans;
    btn.className = "answer-btn";
    btn.addEventListener("click", () => selectAnswer(index));
    li.appendChild(btn);
    answersList.appendChild(li);
  });
}

function selectAnswer(index) {
  if (selectedAnswerIndex !== null) return;

  selectedAnswerIndex = index;
  const q = questions[currentIndex];

  const buttons = answersList.querySelectorAll(".answer-btn");
  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add("correct");
    if (i === index && i !== q.correct) btn.classList.add("incorrect");
  });

  if (index === q.correct) score++;

  // Feedback razonado IC32
  feedbackDiv.classList.remove("hidden");
  const selectedAnswer = q.answers[index];
  const correctAnswer = q.answers[q.correct];
  const isCorrect = index === q.correct;

  // Feedback detallado para aprendizaje
  feedbackDiv.innerHTML = `
    <strong>Razonamiento:</strong> 
    La respuesta seleccionada "${selectedAnswer}" es <strong>${isCorrect ? "correcta" : "incorrecta"}</strong>.
    La respuesta correcta "${correctAnswer}" se justifica porque asegura la integridad, disponibilidad y seguridad operativa en entornos ICS según los principios de IC32, considerando riesgos de seguridad, separación de redes y buenas prácticas de control industrial.
  `;

  nextBtn.disabled = false;
}

// Botón de búsqueda online
function searchOnline() {
  const q = questions[currentIndex];
  if (!q) return;

  const query = encodeURIComponent(q.question);

  // Mejor fuente única confiable
  const url = `https://www.google.com/search?q=site:ics-cert.us-cert.gov+${query}`;

  window.open(url, "_blank");
}

function handleNext() {
  currentIndex++;
  if (currentIndex >= questions.length) {
    showResult();
  } else {
    renderQuestion();
  }
}

function showResult() {
  quizSection.classList.add("hidden");
  resultSection.classList.remove("hidden");

  const percent = ((score / questions.length) * 100).toFixed(1);
  scoreText.textContent = `Has acertado ${score} de ${questions.length} (${percent}%).`;
}

function resetQuiz() {
  resultSection.classList.add("hidden");
  document.getElementById("config").classList.remove("hidden");
}
