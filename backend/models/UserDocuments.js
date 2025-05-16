'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserDocuments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserDocuments.init({
    user_id: DataTypes.INTEGER,
    document_id: DataTypes.STRING,
    permission_level: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserDocuments',
  });
  return UserDocuments;
};