const streak = require("../db/models/streak");
const user = require("../db/models/user");
const userService = require('../services/userService');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const getProfile = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    
    const currentUser = await userService.getUserById(userId);

    return res.json({
        data: currentUser
    });
});

const getStreak = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    const currentUser = await user.findByPk(userId);

    if (!currentUser) {
        throw new AppError('course not found', 404)
    }

    const userStreak = await streak.findOne({where: { userId }})
    if (!userStreak) {
        throw new AppError('user streak not found', 404)
    }
  
    return res.json({
        success: true,
        userStreak
    });
});

module.exports = { getProfile, getStreak }