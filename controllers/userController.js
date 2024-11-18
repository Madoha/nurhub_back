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
    
    const userStreak = await userService.getUserStreak(userId);

    return res.json({
        success: true,
        data: userStreak
    });
});

module.exports = { getProfile, getStreak }