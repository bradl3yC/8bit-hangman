//Imports
const express = require('express')
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const app = express()
const fs = require('fs')

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
let gameWord

//functions

const hideWord = (word) => {
  hiddenWord = word.split('')
  .map(function(character){
    return character = "_"
  }).join("")
}

const checkLetter = (attemptedLetter, gameWord, hiddenWord) => {
  gameWord = gameWord.split("")
  hiddenWord = hiddenWord.split("")
  for (var i = 0; i < gameWord.length; i++) {
    if (gameWord[i] === attemptedLetter) {
      hiddenWord[i] = attemptedLetter
    }
  }
  return hiddenWord.join("")
}


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
  gameWord = easyWord
  response.render("game", {hiddenWord})
})

app.get('/normal', (request, response) => {
  hideWord(normalWord)
  gameWord = normalWord
  response.render("game", {hiddenWord})
})

app.get('/hard', (request, response) => {
  hideWord(hardWord)
  gameWord = hardWord
  response.render("game", {hiddenWord})
})

//Validate to see if a letter has been guessed before
//validate that only 1 character was entered on the attempt
//Validate that number of attemps <= 8
// only increment counter if unsuccessful

app.post('/attempt', (request, response) => {
  const attemptedLetter = request.body.attemptedLetter
  console.log(gameWord)
  console.log(hiddenWord)
  if (attemptsCounter < 8) {
    if (attemptedLettersArray.includes(attemptedLetter)){
      displayError = "You've already guessed that letter! Please try again!"
    } else {
      hiddenWord = checkLetter(attemptedLetter, gameWord, hiddenWord)
      // attemptsCounter++  fix this later
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
