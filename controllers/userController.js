const user = require("../db/models/user");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

const getProfile = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    const userDetail = await user.findByPk(userId);

    if (!userDetail) return next(new AppError('Invalid user id', 400));

    const userJson = userDetail.toJSON();
    delete userJson.password;
    delete userJson.deletedAt;
    delete userJson.roleId;

    return res.json({
        message: 'success',
        data: userJson
    });
});

module.exports = { getProfile }