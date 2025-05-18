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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    documentId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    permissionLevel: {
      type: DataTypes.ENUM('read', 'write', 'owner'),
      allowNull: false,
      defaultValue: 'read'
    }
  }, {
    sequelize,
    modelName: 'UserDocuments',
    timestamps: true,
    underscored: false
  });
  return UserDocuments;
};