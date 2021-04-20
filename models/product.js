'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Product.belongsTo(models.Merchant)
      Product.hasMany(models.Receipt_product)
    }
  };
  Product.init({
    name: DataTypes.STRING,
    price: DataTypes.FLOAT,
    MerchantId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Product',
  });
  return Product;
};