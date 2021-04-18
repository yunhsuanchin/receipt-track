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
    static associate(models) {
      // define association here
    }
  };
  Receipt.init({
    receipt_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    amount: DataTypes.INTEGER,
    payment_method: DataTypes.STRING,
    tagging: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    MerchantId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Receipt',
  });
  return Receipt;
};