'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserDocuments', {
      user_id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        },
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      document_id: {
        primaryKey: true,
        type: Sequelize.STRING,
        allowNull: false
      },
      permission_level: {
        type: Sequelize.ENUM('read', 'write', 'owner'),
        allowNull: false,
        defaultValue: 'read'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserDocuments');
  }
};