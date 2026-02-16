import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
env.config();

const PORT = process.env.PORT || 3000;
const { Pool } = pg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.set("view engine", "ejs");

let quiz = [];

async function loadData() {
  try{
    const result = await db.query("SELECT * FROM capitals");
    quiz = result.rows;
    console.log("✅ Quiz data loaded");
  }catch(err){
      console.error("❌ Error loading quiz data", err);
  }
}

let currentQuestion = {};
let totalCorrect = 0;

// Home page
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/start", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });
});

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

app.listen(PORT, async () => {
  await loadData();
  console.log(`🚀 Server running on port ${PORT}`);
});
