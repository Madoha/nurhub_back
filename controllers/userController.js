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

module.exports = { getProfile }