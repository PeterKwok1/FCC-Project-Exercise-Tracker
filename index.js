const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
// my code
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
// 

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// my code
app.use("/api/users", bodyParser.urlencoded({ extended: true }))
// app.use("/api/users", bodyParser.json())

mongoose.connect(process.env.MONGODB_URI)

const Schema = mongoose.Schema
const logSchema = new Schema({
  description: String,
  duration: Number,
  date: Date
})
const log = mongoose.model('Log', logSchema)
const userSchema = new Schema({
  username: String,
  log: [logSchema]
})
const user = mongoose.model('User', userSchema)

app.post("/api/users", (req, res) => {
  const { username } = req.body
  const userToSave = user({ username: username })
  userToSave.save()
    .then((savedUser) => {
      res.json(savedUser)
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get("/api/users", async (req, res) => {
  const users = await user.find({})
  res.json(users)
})

app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id } = req.params
  let { description, duration, date } = req.body
  if (date.length === 0) {
    date = new Date(Date.now())
  } else {
    date = new Date(req.body.date)
  }
  const logToSave = log({ description: description, duration: duration, date: date })
  user.findById(_id)
    .then((userFound) => {
      userFound.log.push(logToSave)
      return userFound.save()
    })
    .then((savedUser) => {
      res.json(savedUser)
    })
    .catch((err) => {
      res.send(err)
    })
})

// aggregation: https://www.youtube.com/watch?v=mMr4t45FIdQ&list=PLWkguCWKqN9OwcbdYm4nUIXnA2IoXX0LI&index=21
// test api
app.get("/api/test", async (req, res) => {
  const agg = await user.aggregate([
    { $match: { $or: [{ username: "Greg" }, { username: "Tom" }] } },
    { $sort: { username: -1 } }
  ])
  res.json(agg)
})

//

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
