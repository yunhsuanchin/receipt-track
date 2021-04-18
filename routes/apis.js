const express = require('express')
const router = express.Router()
const receiptController = require('../controllers/receiptController')

// receiptController
router.get('/receipts', receiptController.getReceipts)

module.exports = router
