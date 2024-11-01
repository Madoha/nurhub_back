const UserResponseDto = require("../dto/userResponseDto");
const user = require('../db/models/user');
const role = require('../db/models/role');
const AppError = require('../utils/appError');

class UserService {
    async getUserById(userId){
        const userDetail = await user.findByPk(userId);

        if (!userDetail) throw new AppError('Invalid user id', 400);

        const userResponseDto = new UserResponseDto(userDetail);
        userResponseDto.role = (await role.findByPk(userDetail.roleId)).name;

        return userResponseDto;
    }
}

module.exports = new UserService();