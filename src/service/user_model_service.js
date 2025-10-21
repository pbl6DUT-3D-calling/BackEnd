const {UserModel } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("sequelize");

class UserModelService {
    static async getUserModelsByUserId(userId) {
        return await UserModel.findAll({
            where: { user_id: userId },
        });
    }

    static async addUserModel(userId, modelId) {
        return await UserModel.create({
            user_id: userId,
            model_id: modelId,
        });
    }
    static async removeUserModel(userId, modelId) {
        return await UserModel.destroy({
            where: {
                [Op.and]: [{ user_id: userId }, { model_id: modelId }],
            },
        });
    }

}

module.exports = UserModelService;