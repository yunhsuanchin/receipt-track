const { sequelize } = require('../models')
const { body, validationResult } = require('express-validator')

const registerRules = async (req, res, next) => {
  await body('account').exists({ checkFalsy: true }).withMessage('Account can not be empty').run(req)
  await body('name').exists({ checkFalsy: true }).withMessage('Name can not be empty').run(req)
  await body('password').isLength({ min: 5, max: 10 }).withMessage('Password length should be between 5-10 characters').run(req)
  await body('checkPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords dose not match.')
      }
      return true
    }).run(req)
  return validResultCheck(req, res, next)
}

const signInRules = async (req, res, next) => {
  await body('account').exists({ checkFalsy: true }).withMessage('Account can not be empty').run(req)
  await body('password').isLength({ min: 5, max: 10 }).withMessage('Password length should be between 5-10 characters').run(req)
  await body('account')
    .custom(async (account) => {
      const user = await sequelize.query(`SELECT * FROM Users WHERE BINARY Users.account = '${account}'`, { type: sequelize.QueryTypes.SELECT })
      if (user.length === 0) {
        throw new Error('This account has not been registered.')
      }
      return true
    }).run(req)
  return validResultCheck(req, res, next)
}

function validResultCheck (req, res, next) {
  const errorResults = validationResult(req)
  if (errorResults.isEmpty()) return next()

  const errors = errorResults.errors.map(error => error.msg)
  return res.status(400).json({ status: 'error', message: `${errors}` })
}

module.exports = {
  registerRules,
  signInRules
}
