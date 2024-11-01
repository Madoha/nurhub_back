const jwt = require('jsonwebtoken');
const token = require('../../db/models/token');
const AppError = require("../../utils/appError");

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET_KEY, { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN });
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET_KEY, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken){
        const tokenData = await token.findOne({where: {userId: userId}});

        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return await tokenData.save();
        }

        const newData = await token.create({ userId: userId, refreshToken: refreshToken });
        return newData;
    }

    async removeToken(refreshToken){
        const tokenData = await token.deleteOne({where: {refreshToken: refreshToken}});
        return tokenData;
    }

    async validateAccessToken(token){
        const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET_KEY);
        if(!userData) return null;
        return userData;
    }

    async validateRefreshToken(token){
        const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET_KEY);
        if(!userData) return null;
        return userData;
    }

    async findToken(refreshToken){
        const userData = await token.findOne({where: {refreshToken: refreshToken}});
        if(userData) return null;
        return userData;
    }
}

module.exports = new TokenService();