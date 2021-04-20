const express = require('express')
const router = express.Router()
const receiptController = require('../controllers/receiptController')
const userController = require('../controllers/userController')
const passport = require('../config/passport')
const { sequelize } = require('../models')
const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const authenticator = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'permission denied.' })
    }
    const token = req.header('Authorization').replace('Bearer ', '')
    req.user = user
    req.user.token = token
    return next()
  })(req, res, next)
}

const permissionCheck = async (req, res, next) => {
  try {
    const id = req.params.receipt_id
    const [isPermitted] = await sequelize.query(`
      SELECT UserId FROM receipts
      WHERE EXISTS(SELECT * FROM receipts AS r WHERE r.UserId = :uId AND r.id = :rId)
      `, {
      type: sequelize.QueryTypes.SELECT,
      replacements: { uId: req.user.id, rId: id }
    })

    if (!isPermitted) {
      return res.status(401).json({
        status: 'error',
        message: 'Permission denied.'
      })
    }
    return next()
  } catch (error) {
    console.log(error)
  }
}

// receiptController
router.get('/receipts', authenticator, receiptController.getReceipts)
router.post('/receipts', authenticator, upload.single('txt'), receiptController.addReceipt)
router.get('/receipts/:tagging', authenticator, receiptController.getTagging)
router.get('/receipts/:receipt_id/tagging', authenticator, permissionCheck, receiptController.getReceiptTagging)
router.post('/receipts/:receipt_id/tagging', authenticator, permissionCheck, receiptController.addReceiptTagging)
router.put('/receipts/:receipt_id/tagging', authenticator, permissionCheck, receiptController.editReceiptTagging)
router.delete('/receipts/:receipt_id/tagging', authenticator, permissionCheck, receiptController.deleteReceiptTagging)

// userController
router.post('/register', userController.register)
router.post('/signin', userController.signIn)
router.post('/signout', authenticator, userController.signOut)

module.exports = router
