const { sequelize } = require('../models')

const receiptController = {
  getReceipts: async (req, res) => {
    try {
      console.log('receipt', 'user', req.user)
    } catch (error) {
      console.log(error)
    }
  },
  addReceipt: async (req, res) => {
    try {

    } catch (error) {
      console.log(error)
    }
  },
  getTagging: async (req, res) => {
    try {
      const tagging = req.params.tagging
      const receipts = await sequelize.query(`
      SELECT * FROM receipts AS r
      LEFT JOIN (SELECT id, name AS merchant_name FROM merchants) AS m ON m.id = r.MerchantId
      LEFT JOIN (SELECT id, MerchantId, name AS product_name FROM products) AS p ON m.id = p.MerchantId
      LEFT JOIN
      (SELECT id, ProductId, price AS receipt_products_price, quantity AS receipt_products_quantity FROM receipt_products)
      AS rp ON p.id = rp.ProductId
      WHERE r.tagging = :tagging AND r.UserId = :id
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { tagging, id: req.user.id }
      })
      return res.status(400).json({
        status: 'success',
        receipts
      })
    } catch (error) {
      console.log(error)
    }
  },
  getReceiptTagging: async (req, res) => {
    try {
      const id = req.params.receipt_id
      const [tagging] = await sequelize.query(`
      SELECT tagging FROM receipts
      WHERE id = :id
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { id }
      })
      return res.status(400).json({
        status: 'success',
        ...tagging
      })
    } catch (error) {
      console.log(error)
    }
  },
  addReceiptTagging: async (req, res) => {
    try {
      const id = req.params.receipt_id
      const tagging = req.body.tagging
      await sequelize.query(`
      UPDATE receipts SET tagging = :tagging
      WHERE id = :id
      `, {
        type: sequelize.QueryTypes.UPDATE,
        replacements: { id, tagging }
      })
      return res.status(400).json({
        status: 'success'
      })
    } catch (error) {
      console.log(error)
    }
  },
  editReceiptTagging: async (req, res) => {
    try {
      const id = req.params.receipt_id
      const tagging = req.body.tagging
      await sequelize.query(`
      UPDATE receipts SET tagging = :tagging
      WHERE id = :id
      `, {
        type: sequelize.QueryTypes.UPDATE,
        replacements: { id, tagging }
      })
      return res.status(400).json({
        status: 'success'
      })
    } catch (error) {
      console.log(error)
    }
  },
  deleteReceiptTagging: async (req, res) => {
    try {
      const id = req.params.receipt_id
      await sequelize.query(`
      UPDATE receipts SET tagging = ''
      WHERE id = :id
      `, {
        type: sequelize.QueryTypes.UPDATE,
        replacements: { id }
      })
      return res.status(400).json({
        status: 'success'
      })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = receiptController
