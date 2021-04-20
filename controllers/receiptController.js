const { sequelize } = require('../models')
const { merchantReader, receiptReader, productReader } = require('../modules/common')

const receiptController = {
  getReceipts: async (req, res) => {
    try {
      const receipts = await sequelize.query(`
      SELECT * FROM receipts AS r
      LEFT JOIN (SELECT id, name AS merchant_name FROM merchants) AS m ON m.id = r.MerchantId
      LEFT JOIN (SELECT id, MerchantId, name AS product_name FROM products) AS p ON m.id = p.MerchantId
      LEFT JOIN
      (SELECT id, ProductId, price AS receipt_products_price, quantity AS receipt_products_quantity FROM receipt_products)
      AS rp ON p.id = rp.ProductId
      WHERE r.UserId = :id
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { id: req.user.id }
      })
      return res.status(400).json({
        status: 'success',
        receipts
      })
    } catch (error) {
      console.log(error)
    }
  },
  addReceipt: async (req, res) => {
    try {
      const { file } = req
      const tagging = req.body.tagging
      const merchant = await merchantReader(file)
      const receipt = await receiptReader(file)
      const products = await productReader(file)

      const [isMerchantExists] = await sequelize.query(`
      SELECT name, telephone FROM merchants
      WHERE name = :name AND telephone = :telephone
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { name: merchant.name, telephone: merchant.telephone }
      })
      if (!isMerchantExists) {
        await sequelize.query(`
        INSERT INTO merchants (name, telephone, createdAt, updatedAt)
        VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, {
          type: sequelize.QueryTypes.INSERT,
          replacements: Object.values(merchant)
        })
      }

      const productHandler = (array) => {
        return new Promise((resolve, reject) => {
          if (array.length) {
            console.log('item')
            array.forEach((item) => {
              resolve(
                sequelize.query(`
                INSERT INTO products (name, price, MerchantId, createdAt, updatedAt)
                VALUES (:name, :price, (SELECT id FROM merchants WHERE name = :merchantName), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `, {
                  type: sequelize.QueryTypes.INSERT,
                  replacements: { name: item.name, price: parseFloat(item.price), merchantName: merchant.name }
                })
              )
            })
          } else {
            console.log('err')
            return reject
          }
        })
      }

      await productHandler(products)

      console.log('receipt', receipt)
      // insert into receipts
      await sequelize.query(`
      INSERT INTO receipts (receipt_id, date, amount, payment_method, tagging, UserId, MerchantId, createdAt, updatedAt)
      VALUES (:receiptId, :date, :amount, :paymentMethod, :tagging, 
        (SELECT id FROM users WHERE id = :userId), 
        (SELECT id FROM merchants WHERE name = :merchantName),
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        type: sequelize.QueryTypes.INSERT,
        replacements: {
          receiptId: receipt.receipt_id,
          date: receipt.date,
          amount: receipt.amount,
          paymentMethod: receipt.payment_method,
          tagging: tagging ? 'tagging' : null,
          userId: req.user.id,
          merchantName: merchant.name
        }
      })

      // insert into receipt_products
      const rProductHandler = (array) => {
        return new Promise((resolve, reject) => {
          if (array.length) {
            array.forEach(item => {
              console.log('resolve')
              resolve(
                sequelize.query(`
                INSERT INTO receipt_products (price, quantity, ProductId, ReceiptId, createdAt, updatedAt)
                VALUES (:price, :quantity, (SELECT id FROM products WHERE name = :name), 
                (SELECT id FROM receipts WHERE receipt_id = :id), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `, {
                  type: sequelize.QueryTypes.INSERT,
                  replacements: { price: parseFloat(item.price), quantity: item.quantity, name: item.name, id: receipt.receipt_id }
                })
              )
            })
          } else {
            console.log('reject')
            return reject
          }
        })
      }

      await rProductHandler(products)
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
