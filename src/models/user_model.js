const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const UserModel = sequelize.define(
    "UserModel",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      model_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      applied_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "user_models",
      timestamps: false,
    }
  );

  UserModel.associate = function (models) {
    UserModel.belongsTo(models.User, { foreignKey: "user_id" });
    UserModel.belongsTo(models.Models3D, { foreignKey: "model_id" });
  };

  return UserModel;
};
