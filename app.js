const express = require('express')
const db = require('./models')
const app = express()
const PORT = process.env.PORT || 3000

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: false, limit: '20mb' }))

app.listen(PORT, () => {
  db.sequelize.sync()
  console.log(`App is listening on port ${PORT}`)
})

require('./routes')(app)
