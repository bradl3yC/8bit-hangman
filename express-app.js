const express = require('express')
const app = express()
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const fs = require('fs')
const appHelper = require('./app')
const expressValidator = require('express-validator')
const expressSession = require('express-session')

app.use(
  expressSession({
    secret: 'idontunderstandsessionatall',
    resave: false,
    saveUninitialized: true
  })
)

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

const hideWord = (word) => {
  return word.split('').map(function(character) {
     return character = '_'
  }).join('')
}

app.get('/', (request, response) => {
  game = request.session

  game.attemptedLettersArray = []
  game.badAttemptCounter = 0

  response.render('index')
})

app.get('/easy', (request, response) => {
  game = request.session

  let easyWord = getEasyWord()
  game.hiddenWord = hideWord(easyWord)
  game.fullWord = easyWord
  response.render('game', game)
})

app.get('/normal', (request, response) => {
  game = request.session

  let normalWord = getNormalWord()
  game.hiddenWord = hideWord(normalWord)
  game.fullWord = normalWord
  response.render('game', game)
})

app.get('/hard', (request, response) => {
  game = request.session

  let hardWord = getHardWord()
  game.hiddenWord = hideWord(hardWord)
  game.fullWord = hardWord
  response.render('game', game)
})

app.get('/result', (request, response) => {
  game = request.session

  response.render('result', game)
})

app.post('/attempt', (request, response) => {
  game = request.session
  game.displayedMessage = ''

  if (game.badAttemptCounter >= 8) {
    game.displayedMessage = "You have run out of attempts! You suck! Get a life!"
    game.outcome = "loser"

    response.render('result', game)
    return
  }

  request
    .checkBody("attemptedLetter", "You must guess a letter")
    .notEmpty()
    .isAlpha()
    .isLength(1, 1)

  const errors = request.validationErrors()
  if (errors) {
    game.displayedMessage = "You need to type in something valid."

    response.render('game', game)
    return
  }

  game.attemptedLetter = request.body.attemptedLetter.toLowerCase()

  if (game.attemptedLettersArray.includes(game.attemptedLetter)) {
    game.displayedMessage = "You already guessed that letter! Sheesh."

    response.render('game', game)
    return
  }

  game.attemptedLettersArray.push(game.attemptedLetter)

  if (!game.fullWord.includes(game.attemptedLetter)) {
    game.badAttemptCounter++
  }

  game.hiddenWord = game.hiddenWord
                          .split('')
                          .map((letter, index) => (game.attemptedLetter === game.fullWord[index]) ? game.attemptedLetter : letter).join('')

  if (game.fullWord === game.hiddenWord) {
    game.outcome = "winner"

    response.redirect('/result')
    return
  }

  response.render('game', game)
})

app.listen(3000, () => {
  console.log('All your requests are belong to us - on port 3000')
})
