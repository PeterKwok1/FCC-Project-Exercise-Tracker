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
// Used https://www.youtube.com/playlist?list=PLWkguCWKqN9OwcbdYm4nUIXnA2IoXX0LI to learn mongodb aggregation.

// I don't know what it wants from me. My results match. Will use tutorial. 

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
  // log: [logSchema]
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
  if (date) {
    date = new Date(req.body.date)
  } else {
    date = new Date(Date.now())
  }

  await user.findById(_id)
    .then((userFound) => {
      userFound.description = description
      userFound.duration = duration
      userFound.date = date
      res.json(userFound)
    }).catch((err) => {
      res.send(err)
    })
  // const logToSave = log({ description: description, duration: duration, date: date })
  // await user.findById(_id)
  //   .then((userFound) => {
  //     userFound.log.push(logToSave)
  //     return userFound.save()
  //   })
  // .then((savedUser) => {
  //   // mongoose queries return mongoose documents, not objects
  //   const entry = savedUser.log.pop()
  //   const summary = {}
  //   summary._id = savedUser._id
  //   summary.username = savedUser.username
  //   summary.date = entry.date.toDateString()
  //   summary.duration = entry.duration
  //   summary.description = entry.description
  //   res.json(summary)
  // })
  //   .catch ((err) => {
  //   res.send(err)
  // })
  // const summary = await user.aggregate([
  //   { $match: { _id: new mongoose.Types.ObjectId(_id) } },
  //   { $project: { username: 1, last_entry: { $last: "$log" } } },
  //   { $project: { username: 1, date: "$last_entry.date", duration: "$last_entry.duration", description: "$last_entry.description" } }
  // ])
  // summary[0].date = summary[0].date.toDateString()
  // res.json(summary[0])
})

// test 
app.get("/api/test", async (req, res) => {
  const agg = await user.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId("65e40d0a184dcbf9e0101beb") } },
    // { $project: { username: 1, descripton: "$log.description" } }
    // { $unwind: "$log" },
    // { $group: { _id: "$log" } },
    // { $project: { _id: 0, test: '$_id.description', type: { $type: '$_id.description' } } }
  ])
  const o = agg[0]
  const t = o.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId("65e40d0a184dcbf9e0101beb") } }
  ])
  res.json(t)
})

//

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
