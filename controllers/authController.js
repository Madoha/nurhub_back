const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const catchAsync = require("../utils/catchAsync");
const AppError = require('../utils/appError');
const role = require("../db/models/role");
const user = require("../db/models/user");
const authService = require('../services/auth/authService');
const UserRegistrationDto = require('../dto/userRegistrationDto');
const { OAuth2Client } = require('google-auth-library');

const oauth2Client = new OAuth2Client(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 'http://localhost:4001/api/auth/google/callback');

const signup = catchAsync(async (req, res, next) => {
    const body = req.body;
    const userRegDto = new UserRegistrationDto(body);
    
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

const googleLogin = catchAsync(async (req, res, next) => {
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['email'],
    })
    res.redirect(authUrl);
});

const googleCallback = catchAsync(async (req, res, next) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    
    const result = await authService.googleCallback(tokens, oauth2Client);
    console.log("result", result);
    // res.cookie('accessToken', result.accessToken, accessTokenCookieOptions(
    //     Date.now() + 1 * (60 * 60 * 1000)
    // ))
    res.cookie('refreshToken', result.refreshToken, refreshTokenCookieOptions(
        Date.now() + 7 * (24 * 60 * 60 * 1000)
    ))

    res.json({status: true, data: result.accessToken});
});

// const isSignedIn = catchAsync(async (req, res, next) => {
//     const accessToken = req.cookies.accessToken;

//     if (!accessToken) throw new AppError('Not signed in', 401);

//     jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET_KEY, (err, decoded) => {
//         if (err) {
//             throw new AppError('Not signed in', 401)
//         }

//         res.json({success: true, user: decoded})
//     });
// });

const googleLogout = catchAsync(async (req, res, next) => {
    // res.cookie('accessToken', accessTokenCookieOptions(0))
    res.cookie('refreshToken', refreshTokenCookieOptions(0))
    res.redirect('http://localhost:3000')
})

// function accessTokenCookieOptions(expires_ms){
//     let cookieOptions = {
//         secure: true,
//         sameSite: 'strict',
//         path: '/',
//         expires: new Date(expires_ms),
//         maxAge: expires_ms ? undefined : 0
//     }
//     return cookieOptions;
// }

function refreshTokenCookieOptions(expires_ms){
    let cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/',
        expires: new Date(expires_ms),
        maxAge: expires_ms ? undefined : 0
    }
    return cookieOptions;
}

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
    const refreshToken = req.cookies.refreshToken;
    
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

module.exports = { signup, login, googleLogin, googleCallback, googleLogout, restrictTo, logout, refreshToken, forgotPassword, resetPassword, changePassword };