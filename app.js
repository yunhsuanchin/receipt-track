const express = require('express')
const db = require('./models')
const app = express()
const PORT = 3000

app.listen(PORT, () => {
  db.sequelize.sync()
  console.log(`App is listening on port ${PORT}`)
})
