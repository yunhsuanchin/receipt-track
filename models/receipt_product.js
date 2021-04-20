'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Receipt_product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Receipt_product.belongsTo(models.Receipt)
      Receipt_product.belongsTo(models.Product)
    }
  };
  Receipt_product.init({
    price: DataTypes.FLOAT,
    quantity: DataTypes.INTEGER,
    ProductId: DataTypes.INTEGER,
    ReceiptId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Receipt_product',
  });
  return Receipt_product;
};