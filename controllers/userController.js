const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { sequelize } = require('../models')

const userController = {
  register: async (req, res) => {
    try {
      const { name, account, password, checkPassword } = req.body
      if (!name || !account || !password) {
        return res.status(400).json({
          status: 'error',
          message: "Required fields didn't exist."
        })
      }
      if (password !== checkPassword) {
        return res.status(400).json({
          status: 'error',
          message: "Passwords didn't match."
        })
      }

      const hashPassword = await bcrypt.hashSync(password, bcrypt.genSaltSync(10))
      await sequelize.query(`
      INSERT INTO users (name, account, password, createdAt, updatedAt) 
      VALUES(?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        type: sequelize.QueryTypes.INSERT,
        replacements: [name, account, hashPassword]
      })
      return res.status(200).json({
        status: 'success',
        message: 'This user was successfully created.'
      })
    } catch (error) {
      console.log(error)
    }
  },
  signIn: async (req, res) => {
    try {
      const { account, password } = req.body
      const [user] = await sequelize.query(`
      SELECT * FROM users WHERE account = :account
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { account }
      })

      if (!bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({
          status: 'error',
          message: "Password didn't match."
        })
      }

      return res.status(400).json({
        status: 'success',
        message: 'Successfully sign in.',
        token: jwt.sign({ id: user.id }, process.env.JWT_SECRET),
        user: { id: user.id, name: user.name, account: user.account }
      })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = userController
