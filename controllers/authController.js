const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const role = require("../db/models/role");
const user = require("../db/models/user");
const { sendPasswordResetEmail, sendResetSuccessEmail } = require('../mailtrap/emails'); 

const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const signup = catchAsync(async (req, res, next) => {
    const body = req.body;

    const existingUser = await user.findOne({ where: {email:body.email}});
    if (existingUser) {
       return next(new AppError('This email is alredy registered', 400))
    }

    const roleUp =  await role.findOne({where: {name: 'Tester'}});

    const newUser = await user.create({
        username: body.username,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
        confirmPassword: body.confirmPassword,
        roleId: roleUp.id,
    });

    if (!newUser) return next(new AppError('Failod to create the user', 400));

    const result = newUser.toJSON();

    delete result.password;
    delete result.deletedAt;

    result.token = generateToken({
        id: body.id,
        role: await role.findByPk(newUser.roleId)
    });

    return res.status(201).json({
        status: 'success',
        data: result 
    });
});

const login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) return next(new AppError('Email or Password not provided', 400));

    const result = await user.findOne({where: {email}});
    if (!result || !(await bcrypt.compare(password, result.password))) return next(new AppError('Incorrect email or password', 401));

    const token = generateToken({
        id: result.id,
        role: result.roleId
    });

    return res.json({
        status: 'success',
        data: token
    });
});

const authentication = catchAsync(async (req, res, next) => {
    let emailToken = '';
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        emailToken = req.headers.authorization.split(' ')[1];
    }

    if(!emailToken) return next(new AppError('Please login to get access', 401));

    const tokenDetails = jwt.verify(emailToken, process.env.JWT_SECRET_KEY);

    const freshUser = await user.findOne({where: {id: tokenDetails.id}});

    if (!freshUser) return next(new AppError('User no longer exists', 400));

    req.user = freshUser;
    return next();
});

const restrictTo = (...roleId) => {
    const checkPermission = (req, res, next) => {
        if (!roleId.includes(req.user.roleId)) return next(new AppError('You do not have permission to perform this action', 403));

        return next();
    }
    return checkPermission;
}

const resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    const currentUser = await user.findOne({ where: { resetPasswordToken: token }});
    if (!currentUser) return next(new AppError('Invalid or expired reset token', 400));

    if (currentUser.resetPasswordExpiresAt < Date.now()) return next(new AppError('Token expired', 400));

    if (newPassword != confirmNewPassword) return next(new AppError('Password does not match', 401));

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    currentUser.password = hashedPassword;
    currentUser.resetPasswordToken = undefined;
    currentUser.resetPasswordExpiresAt = undefined;
    await currentUser.save();

    await sendResetSuccessEmail(currentUser.email);
    return res.json({
        status: true,
        message: 'Password reset successful'
    });
});

const forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    const currentUser = await user.findOne({ where: { email }});
    if(!currentUser) return next(new AppError('User not found', 400));

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour

    currentUser.resetPasswordToken = resetToken;
    currentUser.resetPasswordExpiresAt = resetTokenExpiresAt;

    await currentUser.save();

    await sendPasswordResetEmail(currentUser.email, `${process.env.CLIENT_URL}/api/v1/auth/reset-password/${resetToken}`);

    res.status(200).json({success: true, message: "Password reset link sent to your email" });
});

const changePassword = catchAsync(async (req, res, next) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    const currentUser = await user.findByPk(req.user.id);

    const isPasswordCorrect = await bcrypt.compare(oldPassword, currentUser.password);
    if (!isPasswordCorrect || newPassword != confirmNewPassword) return next(new AppError('Password in correct or does not match', 401));

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    currentUser.password = hashedPassword;
    await currentUser.save();

    return res.json({
        message: 'Password changed successfully'
    });
});

module.exports = { signup, login, authentication, restrictTo, forgotPassword, resetPassword, changePassword };