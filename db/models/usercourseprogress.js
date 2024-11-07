'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const sequelize = require('../../config/database');

const userCourseProgress = sequelize.define('userCourseProgresses', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  userId: {
    type: DataTypes.INTEGER
  },
  courseId: {
    type: DataTypes.INTEGER
  },
  completedModules: {
    type: DataTypes.INTEGER
  },
  score: {
    type: DataTypes.FLOAT
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
  modelName: 'userCourseProgresses'
});

module.exports = userCourseProgress