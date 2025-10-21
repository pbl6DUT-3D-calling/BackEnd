const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Models3D = sequelize.define(
    "Models3D",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      file_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "models3d",
      timestamps: false,
    }
  );

  Models3D.associate = function (models) {
    Models3D.hasMany(models.UserModel, { foreignKey: "model_id" });
  };

  return Models3D;
};
