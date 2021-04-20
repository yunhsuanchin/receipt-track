'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Receipt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Receipt.hasMany(models.Receipt_product)
      Receipt.belongsTo(models.User)
      Receipt.belongsTo(models.Merchant)
    }
  };
  Receipt.init({
    receipt_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    amount: DataTypes.FLOAT,
    payment_method: DataTypes.STRING,
    tagging: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    MerchantId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Receipt',
  });
  return Receipt;
};