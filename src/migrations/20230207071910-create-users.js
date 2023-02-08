'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        allowNull: false,
        type: Sequelize.STRING(15)
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING(15)
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING(15)
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING(200)
      },
      gender: {
        type: Sequelize.ENUM('Male', 'Female')
      },
      birth: {
        type: Sequelize.DATE
      },
      occupation: {
        type: Sequelize.STRING(45)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};