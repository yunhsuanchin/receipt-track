const fs = require('fs')

const merchantReader = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    fs.readFile(file.path, (err, data) => {
      if (err) return reject
      const lines = data.toString().split('\n')
      resolve({
        name: lines[0].trim(),
        telephone: lines[1].slice(lines[1].indexOf(':') + 1).trim()
      })
    })
  })
}

const receiptReader = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    fs.readFile(file.path, (err, data) => {
      if (err) return reject
      const lines = data.toString().split('\n')
      const footerBeginIndex = lines.lastIndexOf('\r') + 1
      resolve({
        receipt_id: lines[5].slice(lines[5].indexOf(':') + 1).trim(),
        date: lines[4].slice(lines[4].indexOf(':') + 1, lines[4].indexOf(' ')).trim().split('.').reverse().join('-'),
        payment_method: lines[footerBeginIndex].slice(0, lines[footerBeginIndex].indexOf(' ')).trim(),
        amount: lines[footerBeginIndex].slice(lines[footerBeginIndex].indexOf(':') + 1).trim()
      })
    })
  })
}

const productReader = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)
    fs.readFile(file.path, (err, data) => {
      if (err) return reject
      const lines = data.toString().split('\n')
      const contentBeginIndex = 7
      const footerBeginIndex = lines.lastIndexOf('\r') + 1
      const products = []
      lines.slice(contentBeginIndex, footerBeginIndex - 1).forEach((item, index, array) => {
        if (index % 2 === 0) {
          products.push({
            name: array[index].slice(array[index].indexOf(' ')).trim(),
            quantity: array[index + 1].slice(0, array[index + 1].indexOf('x')).trim(),
            price: array[index + 1].slice(array[index + 1].indexOf('x') + 1, array[index + 1].indexOf('  ')).trim()
          })
        }
      })
      resolve(products)
    })
  })
}

module.exports = { merchantReader, receiptReader, productReader }
