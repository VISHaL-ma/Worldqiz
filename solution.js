import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "word", // use your real DB name, not 'postgres'
  password: "Vishal@123",
  port: 5432,
});
const app = express();
const port = 3000;

db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ DB Connection Error:", err));

let quiz = [];
let totalCorrect = 0;
let currentQuestion = {};
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
async function loadQuizData() {
  try {
    const result = await db.query("SELECT * FROM capitals");
    quiz = result.rows;
    console.log("✅ Quiz data loaded:", quiz.length, "records");
  } catch (err) {
    console.error("❌ Error loading quiz data:", err);
  }
}
loadQuizData();
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  res.render("index.ejs", { question: currentQuestion });
});

app.post("/submit", async (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    isCorrect = true;
  }

  await nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  if (quiz.length === 0) {
    currentQuestion = { country: "No data", capital: "N/A" };
    return;
  }
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
