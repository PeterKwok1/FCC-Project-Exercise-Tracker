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

// Used 
// https://www.youtube.com/playlist?list=PLWkguCWKqN9OwcbdYm4nUIXnA2IoXX0LI to learn mongodb aggregation.
// https://www.youtube.com/watch?v=Xjaksspeq7Y

mongoose.connect(process.env.MONGODB_URI)

const { Schema } = mongoose

const UserSchema = new Schema({
  username: String,
})
const User = mongoose.model('User', UserSchema)

const ExerciseSchema = new Schema({
  user_id: { type: String, required: true },
  description: String,
  duration: Number,
  date: Date
})
const Exercise = mongoose.model('Exercise', ExerciseSchema)

app.use("/", bodyParser.urlencoded({ extended: true }))
// app.use("/api/users", bodyParser.json())

app.post("/api/users", async (req, res) => {
  const { username } = req.body
  const userToSave = new User({ username: username })
  try {
    const user = await userToSave.save()
    res.json(user)
  } catch (err) {
    console.error(err)
  }
})

app.get("/api/users", async (req, res) => {
  const users = await User.find({}).select("_id username")
  if (!users) {
    res.send("No users")
  } else {
    res.json(users)
  }
})

app.post("/api/users/:_id/exercises", async (req, res) => {
  const id = req.params._id
  const { description, duration, date } = req.body
  try {
    const user = await User.findById(id)
    if (!user) {
      res.send("No user found")
    } else {
      const exerciseToSave = new Exercise({
        user_id: user._id,
        description,
        duration,
        date: date ? new Date(date) : new Date()
      })
      const exercise = await exerciseToSave.save()
      res.json({
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date: new Date(exercise.date).toDateString()
      })
    }
  } catch (err) {
    console.error(err)
    res.send("Error saving exercise")
  }
})

// up to https://youtu.be/Xjaksspeq7Y?t=1205
app.get("/api/users/:_id/logs", async (req, res) => {
  const { from, to, limit } = req.query
  const id = req.params._id
  const user = await User.findById(id)
  if (!user) {
    res.send("Could not find user")
    return
  }
  let dateObj = {}
  if (from) {
    dateObj["$gte"] = new Date(from)
  }
  if (to) {
    dateObj["$lte"] = new Date(to)
  }
  let filter = {
    user_id: id
  }
  if (from || to) {
    filter.date = dateObj
  }
})

//   await user.findById(_id)
//     .then((userFound) => {
//       userFound.description = description
//       userFound.duration = duration
//       userFound.date = date
//       res.json(userFound)
//     }).catch((err) => {
//       res.send(err)
//     })
//   // const logToSave = log({ description: description, duration: duration, date: date })
//   // await user.findById(_id)
//   //   .then((userFound) => {
//   //     userFound.log.push(logToSave)
//   //     return userFound.save()
//   //   })
//   // .then((savedUser) => {
//   //   // mongoose queries return mongoose documents, not objects
//   //   const entry = savedUser.log.pop()
//   //   const summary = {}
//   //   summary._id = savedUser._id
//   //   summary.username = savedUser.username
//   //   summary.date = entry.date.toDateString()
//   //   summary.duration = entry.duration
//   //   summary.description = entry.description
//   //   res.json(summary)
//   // })
//   //   .catch ((err) => {
//   //   res.send(err)
//   // })
//   // const summary = await user.aggregate([
//   //   { $match: { _id: new mongoose.Types.ObjectId(_id) } },
//   //   { $project: { username: 1, last_entry: { $last: "$log" } } },
//   //   { $project: { username: 1, date: "$last_entry.date", duration: "$last_entry.duration", description: "$last_entry.description" } }
//   // ])
//   // summary[0].date = summary[0].date.toDateString()
//   // res.json(summary[0])
// })

// // test 
// app.get("/api/test", async (req, res) => {
//   const agg = await user.aggregate([
//     { $match: { _id: new mongoose.Types.ObjectId("65e40d0a184dcbf9e0101beb") } },
//     // { $project: { username: 1, descripton: "$log.description" } }
//     // { $unwind: "$log" },
//     // { $group: { _id: "$log" } },
//     // { $project: { _id: 0, test: '$_id.description', type: { $type: '$_id.description' } } }
//   ])
//   const o = agg[0]
//   const t = o.aggregate([
//     { $match: { _id: new mongoose.Types.ObjectId("65e40d0a184dcbf9e0101beb") } }
//   ])
//   res.json(t)
// })

// //

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
