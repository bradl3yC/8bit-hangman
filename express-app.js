const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const fs = require('fs')
const appHelper = require('./app')
const expressValidator = require('express-validator')

app.engine('mst', mustacheExpress())
app.set('views', './templates')
app.set('view engine', 'mst')

app.use(express.static('./public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(expressValidator())

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n")

const getRandomInt = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getEasyWord = () => {
  const easyWords = words.filter(word => word.length >= 4 && word.length <= 6)
  const easyWord = easyWords[getRandomInt(0, easyWords.length)]
  return easyWord
}

const getNormalWord = () => {
  const normalWords = words.filter(word => word.length >= 6 && word.length <= 8)
  const normalWord = normalWords[getRandomInt(0, normalWords.length)]
  return normalWord
}

const getHardWord = () => {
  const hardWords = words.filter(word => word.length >= 8)
  const hardWord = hardWords[getRandomInt(0, hardWords.length)]
  return hardWord
}

let attemptedLetter, displayedMessage, fullWord, hiddenWord, outcome
let attemptedLettersArray = []
let badAttemptCounter = 0

const hideWord = (word) => {
  hiddenWord = word.split('').map(function(character) {
     return character = '_'
  }).join('')
}

const resultMessage = (fullWord, hiddenWord, response) => {
  if (fullWord === hiddenWord) {
    outcome = "winner"
    response.redirect('/result')
  }
}

const checkLetter = (fullWord, attemptedLetter, hiddenWord, response, outcome) => {
  fullWord = fullWord.split('')
  hiddenWord = hiddenWord.split('')

  if (!fullWord.includes(attemptedLetter)) {
    badAttemptCounter++
  }

  for (let i = 0; i < fullWord.length; i++) {
    if (fullWord[i] === attemptedLetter) {
      hiddenWord[i] = attemptedLetter
    }
  }

  hiddenWord = hiddenWord.join('')
  fullWord = fullWord.join('')
  resultMessage(fullWord, hiddenWord, response)
  return hiddenWord
}

app.get('/', (request, response) => {
  attemptedLettersArray = []
  badAttemptCounter = 0
  response.render('index')
})

app.get('/easy', (request, response) => {
  let easyWord = getEasyWord()
  hideWord(easyWord)
  fullWord = easyWord
  response.render('game', {hiddenWord, fullWord, badAttemptCounter})
})

app.get('/normal', (request, response) => {
  let normalWord = getNormalWord()
  hideWord(normalWord)
  fullWord = normalWord
  response.render('game', {hiddenWord, fullWord, badAttemptCounter})
})

app.get('/hard', (request, response) => {
  let hardWord = getHardWord()
  hideWord(hardWord)
  fullWord = hardWord
  response.render('game', {hiddenWord, fullWord, badAttemptCounter})
})

app.get('/result', (request, response) => {
  response.render('result', {hiddenWord, fullWord, outcome})
})

app.post('/attempt', (request, response) => {
  request
    .checkBody("attemptedLetter", "You must guess a letter")
    .notEmpty()
    .isAlpha()
    .isLength(1, 1)

  const errors = request.validationErrors()
  if (errors) {
    displayedMessage = "You need to type in something valid."
    return response.render('game', { hiddenWord, attemptedLetter, attemptedLettersArray, displayedMessage })
  }
  if (badAttemptCounter >= 8) {
    displayedMessage = "You have run out of attempts! You suck! Get a life!"
    outcome = "loser"
    return response.render('result', { outcome })
  }
  attemptedLetter = request.body.attemptedLetter.toLowerCase()
  if (attemptedLettersArray.includes(attemptedLetter)) {
    displayedMessage = "You already guessed that letter! Sheesh."
    return response.render('game', { hiddenWord, attemptedLetter, attemptedLettersArray, displayedMessage, badAttemptCounter })
  }

  hiddenWord = checkLetter(fullWord, attemptedLetter, hiddenWord, response)
  attemptedLettersArray.push(attemptedLetter)
  displayedMessage = ''
  return response.render('game', { hiddenWord, attemptedLetter, attemptedLettersArray, displayedMessage, badAttemptCounter })
})

app.listen(3000, () => {
  console.log('All your requests are belong to us - on port 3000')
})
