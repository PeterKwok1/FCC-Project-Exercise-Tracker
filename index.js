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
app.use("/api/users", bodyParser.json())

mongoose.connect(process.env.MONGODB_URI)

const Schema = mongoose.Schema
const userSchema = new Schema({
  username: String
})
const user = mongoose.model('User', userSchema)

app.post("/api/users", (req, res) => {
  const userToSave = user({ username: req.body.username })
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

//

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
