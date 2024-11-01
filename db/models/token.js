'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const sequelize = require('../../config/database');
const user = require('./user');
const token = sequelize.define('token', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: {
      type: DataTypes.INTEGER
    },
    refreshToken: {
      type: DataTypes.STRING
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
}, {
  freezeTableName: true,
  modelName: 'token'
});

token.associate = (models) => {
  token.belongsTo(models.user, { foreignKey: 'userId' })
};

module.exports = token;