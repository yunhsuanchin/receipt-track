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
      return res.status(200).json({
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

      const [isReceiptExists] = await sequelize.query(`
      SELECT receipt_id FROM receipts WHERE receipt_id = :id
      `, {
        type: sequelize.QueryTypes.SELECT,
        replacements: { id: receipt.receipt_id }
      })

      if (isReceiptExists) {
        return res.json({
          status: 'error',
          message: 'This receipt has already been recorded.'
        })
      }

      // insert into merchants
      await sequelize.query(`
      INSERT INTO merchants (name, telephone, createdAt, updatedAt)
      SELECT :name, :telephone, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      FROM DUAL WHERE NOT EXISTS (SELECT telephone FROM merchants WHERE telephone = :telephone)
      `, {
        type: sequelize.QueryTypes.INSERT,
        replacements: { name: merchant.name, telephone: merchant.telephone }
      })
      // insert into products
      const productHandler = (array) => {
        return new Promise((resolve, reject) => {
          if (array.length) {
            console.log('item')
            array.forEach((item) => {
              resolve(
                sequelize.query(`
                INSERT INTO products (name, price, MerchantId, createdAt, updatedAt)
                SELECT :name, :price, (SELECT id FROM merchants WHERE name = :merchantName), CURRENT_TIMESTAMP,       
                CURRENT_TIMESTAMP
                FROM DUAL WHERE NOT EXISTS (SELECT name FROM products WHERE name = :name)
                `, {
                  type: sequelize.QueryTypes.INSERT,
                  replacements: { name: item.name, price: parseFloat(item.price), merchantName: merchant.name, merchantId: merchant.id }
                })
              )
            })
          } else {
            return reject
          }
        })
      }

      await productHandler(products)
        .catch(error => console.log(error))

      // insert into receipts
      await sequelize.query(`
      INSERT INTO receipts (receipt_id, date, amount, payment_method, tagging, UserId, MerchantId, createdAt, updatedAt)
      VALUES (:receiptId, :date, :amount, :paymentMethod, :tagging, (SELECT id FROM users WHERE id = :userId), 
        (SELECT id FROM merchants WHERE name = :merchantName),
        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        type: sequelize.QueryTypes.INSERT,
        replacements: {
          receiptId: receipt.receipt_id,
          date: receipt.date,
          amount: receipt.amount,
          paymentMethod: receipt.payment_method,
          tagging,
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
        .catch(error => console.log(error))
      return res.status(200).json({
        status: 'success'
      })
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
      return res.status(200).json({
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
      return res.status(200).json({
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
      return res.status(200).json({
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
      return res.status(200).json({
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
      return res.status(200).json({
        status: 'success'
      })
    } catch (error) {
      console.log(error)
    }
  }
}

module.exports = receiptController
