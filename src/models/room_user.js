const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RoomUser = sequelize.define(
    "RoomUser",
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
      room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      joined_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "room_users",
      timestamps: false,
    }
  );

  RoomUser.associate = function (models) {
    RoomUser.belongsTo(models.User, { foreignKey: "user_id" });
    RoomUser.belongsTo(models.Room, { foreignKey: "room_id" });
  };

  return RoomUser;
};
