const express = require('express')
const router = express.Router()
const receiptController = require('../controllers/receiptController')
const userController = require('../controllers/userController')
const passport = require('../config/passport')

const authenticator = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err)
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'permission denied.' })
    }
    return next()
  })(req, res, next)
}

// receiptController
router.get('/receipts', authenticator, receiptController.getReceipts)
router.post('/receipts', authenticator, receiptController.addReceipt)
router.get('/receipts/:tagging', authenticator, receiptController.getTagging)
router.get('/receipts/:receipt_id/tagging', authenticator, receiptController.getReceiptTagging)
router.post('/receipts/:receipt_id/tagging', authenticator, receiptController.addReceiptTagging)
router.put('/receipts/:receipt_id/tagging', authenticator, receiptController.editReceiptTagging)
router.delete('/receipts/:receipt_id/tagging', authenticator, receiptController.deleteReceiptTagging)

// userController
router.post('/register', userController.register)
router.post('/signin', userController.signIn)

module.exports = router
