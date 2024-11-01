const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const role = require("../db/models/role");
const user = require("../db/models/user");
const authService = require('../services/auth/authService');
const UserRegistrationDto = require('../dto/userRegistrationDto');

const signup = catchAsync(async (req, res, next) => {
    const body = req.body;
    const userRegDto = new UserRegistrationDto(body);
    console.log('userRegDto', userRegDto)
    const userData = await authService.registration(userRegDto);
    res.cookie('refreshToken', userData.refreshToken, { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true })

    return res.status(201).json(userData);
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    const userData = await authService.login(email, password);
    res.cookie('refreshToken', userData.refreshToken, { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true })

    return res.json(userData);
});

const restrictTo = (...allowedRoleIds) => {
    return (req, res, next) => {
        if (!allowedRoleIds.includes(req.user.roleId)) return next(new AppError('You do not have permission to perform this action', 403));

        return next();
    }
};

const logout = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    const token = await authService.logout(refreshToken);
    res.clearCookie('refreshToken');
    return res.json(token);
});

const refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.cookies;
    const userData = await authService.refresh(refreshToken);
    res.cookie('refreshToken', userData.refreshToken, { maxAge: 14 * 24 * 60 * 60 * 1000, httpOnly: true});
    return res.json(userData);
});

const resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    await authService.resetPassword(token, newPassword, confirmNewPassword);

    return res.json({
        status: true,
        message: 'Password reset successful'
    });
});

const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.status(200).json({success: true, message: "Password reset link sent to your email" });
});

const changePassword = catchAsync(async (req, res, next) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    await authService.changePassword(userId, oldPassword, newPassword, confirmNewPassword);

    return res.json({
        message: 'Password changed successfully'
    });
});

module.exports = { signup, login, restrictTo, logout, refreshToken, forgotPassword, resetPassword, changePassword };