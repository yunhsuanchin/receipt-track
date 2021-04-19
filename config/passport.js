const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const { sequelize } = require('../models')
const jwtOptions = {}

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
jwtOptions.secretOrKey = process.env.JWT_SECRET

passport.use(new JwtStrategy(jwtOptions, async (jwt_payload, done) => {
  try {
    const [user] = await sequelize.query(`
    SELECT * FROM users WHERE id = :id
    `, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { id: jwt_payload.id }
    })
    if (!user) return done(null, false)

    return done(null, user)
  } catch (error) {
    console.log(error)
  }
}))

module.exports = passport
