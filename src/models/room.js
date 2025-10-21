const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Room = sequelize.define(
    "Room",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "rooms",
      timestamps: false,
    }
  );

  Room.associate = function (models) {
    Room.belongsTo(models.User, { foreignKey: "created_by" });
    Room.hasMany(models.RoomUser, { foreignKey: "room_id" });
  };

  return Room;
};
