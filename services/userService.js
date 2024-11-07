const UserResponseDto = require("../dto/user/userResponseDto");
const user = require('../db/models/user');
const role = require('../db/models/role');
const AppError = require('../utils/appError');

class UserService {
    async getUserById(userId){
        if (!userId) throw new AppError('User ID cannot be undefined', 400);

        const userDetail = await user.findByPk(userId);

        if (!userDetail) throw new AppError('Invalid user id', 400);

        const userResponseDto = new UserResponseDto(userDetail);
        userResponseDto.role = (await role.findByPk(userDetail.roleId)).name;

        return userResponseDto;
    }
}

module.exports = new UserService();