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
// https://www.youtube.com/playlist?list=PLWkguCWKqN9OwcbdYm4nUIXnA2IoXX0LI - mongodb aggregation (was not necessary)
// https://www.youtube.com/watch?v=Xjaksspeq7Y
// he creates a user table, an exercises table with user_id, and joins twice, once for the exercise, another for the log
// however, he didn't format the dates consistently so certain tests wouldn't pass. 

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
    const user = await User.findById(id) // throws an error if the id is not a valid mongoose object id
    if (!user) { // if the object id isn't found
      res.send("Could not find user")
    } else {
      const exerciseToSave = new Exercise({
        user_id: user._id,
        description, // short for variable value -> key value        
        duration,
        date: date ? new Date(date + 'T00:00:00.000') : new Date() // we are assuming they are entering local time 
      })
      // date constructor saves in UTC.
      // date constructor assumes param is in local time if T... is included and Z is not specifed. 
      const exercise = await exerciseToSave.save()
      res.json({
        _id: user._id,
        username: user.username,
        date: exercise.date.toDateString(), // toDateString() returns local time. 
        duration: exercise.duration,
        description: exercise.description
      })
    }
  } catch (err) {
    console.error(err)
    res.send("Error saving exercise")
  }
})

app.get("/api/users/:_id/logs", async (req, res) => {
  const id = req.params._id
  const { from, to, limit } = req.query
  try {
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

    const exercises = await Exercise.find(filter).limit(+limit ?? 500) // + -> Number, ?? = Nullish coalescing operator (returns left if right is null, else returns left)

    const count = await Exercise.aggregate([
      { $match: filter },
      { $count: 'Count' }
    ])

    const log = exercises.map((e) => ({ // an alternative is to use mongoose $dateToString
      description: e.description,
      duration: e.duration,
      date: e.date.toDateString()
    }))

    res.json({
      username: user.username,
      count: count[0].Count,
      _id: user._id,
      log
    })
  } catch (err) {
    console.error(err)
    res.send("Error getting user logs")
  }
})

//

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

