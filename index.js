import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
	user: "postgres",
	host: "localhost",
	database: "world",
	password: "cmipph12",
	port: 5432,
});

db.connect();

let quiz = [];

db.query("SELECT * FROM capitals", (err, res) => {
	if (err) {
		console.log("Error executing query", err.stack);
	} else {
		quiz = res.rows;
	}
	db.end();
});

let totalCorrect = 0;

//midleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

let mistake = 0;
//get homepage
app.get("/", async (req, res) => {
	totalCorrect = 0;
	await nextQuestion();
	console.log(currentQuestion);
	res.render("index.ejs", { question: currentQuestion });
});

//post ur answer
app.post("/submit", (req, res) => {
	let answer = req.body.answer.trim();
	let isCorrect = false;
	if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
		totalCorrect++;
		console.log(totalCorrect);
		isCorrect = true;
	} else {
		mistake++;
	}

	nextQuestion();
	res.render("index.ejs", {
		question: currentQuestion,
		totalScore: totalCorrect,
		wasCorrect: isCorrect,
		wrong: mistake,
	});
	console.log(currentQuestion);
});

//reseting the mistake
app.post("/reset-mistake", (req, res) => {
	mistake = 0;
	res.send({ status: "success", message: "Mistake count reset" });
});

async function nextQuestion() {
	let randomCountry;

	do {
		randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
	} while (randomCountry.capital === null);

	currentQuestion = randomCountry;
	console.log(mistake);
}

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
