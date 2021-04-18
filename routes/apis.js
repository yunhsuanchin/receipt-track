const express = require('express')
const router = express.Router()
const receiptController = require('../controllers/receiptController')
const userController = require('../controllers/userController')

// receiptController
router.get('/receipts', receiptController.getReceipts)
router.post('/receipts', receiptController.addReceipt)
router.get('/receipts/:tagging', receiptController.getTagging)
router.get('/receipts/:receipt_id/tagging', receiptController.getReceiptTagging)
router.post('/receipts/:receipt_id/tagging', receiptController.addReceiptTagging)
router.put('/receipts/:receipt_id/tagging', receiptController.editReceiptTagging)
router.delete('/receipts/:receipt_id/tagging', receiptController.deleteReceiptTagging)

// userController
router.post('/register', userController.register)
router.post('/signin', userController.signIn)

module.exports = router
