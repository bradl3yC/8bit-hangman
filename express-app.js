//Imports
const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs')

//functions
const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const hideWord = (word) => {
  hiddenWord = word.split('')
  .map(function(character){
    return character = "_"
  }).join(" ")
}

//global variables
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");
const easyWords = words.filter(word => word.length >= 4 && word.length <= 6);
const normalWords = words.filter(word => word.length >= 6 && word.length <= 8);
const hardWords = words.filter(word => word.length >= 8);
const easyWord = easyWords[getRandomInt(0, easyWords.length)];
const normalWord = normalWords[getRandomInt(0, normalWords.length)];
const hardWord = hardWords[getRandomInt(0, hardWords.length)];
let displayError = ""
let hiddenWord
let attemptedLettersArray = []
let attemptsCounter = 0

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'))

app.engine('mst', mustacheExpress())
app.set('views', './templates')
app.set('view engine', 'mst')

//Routes
app.get('/', (request, response) => {
  attemptedLettersArray = []
  response.render('index')
})

app.get('/easy', (request, response) => {
  hideWord(easyWord)
  response.render("game", {hiddenWord})
})

app.get('/normal', (request, response) => {
  hideWord(normalWord)
  response.render("game", {hiddenWord})
})

app.get('/hard', (request, response) => {
  hideWord(hardWord)
  response.render("game", {hiddenWord})
})

//Validate to see if a letter has been guessed before
//validate that only 1 character was entered on the attempt
//Validate that number of attemps <= 8

app.post('/attempt', (request, response) => {
  const attemptedLetter = request.body.attemptedLetter
  if (attemptsCounter < 8) {
    if (attemptedLettersArray.includes(attemptedLetter)){
      displayError = "You've already guessed that letter! Please try again!"
    } else {
      attemptsCounter++
      attemptedLettersArray.push(attemptedLetter)
      displayError = ""
    }
  } else {
    displayError = "You've run out of attempts!"
  }
  response.render("game", {hiddenWord, attemptedLetter, attemptedLettersArray, attemptsCounter, displayError})
})

app.listen(3000, () => {
  console.log('All your requests are belong to us - on port 3000')
})
