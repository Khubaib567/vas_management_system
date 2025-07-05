module.exports = (sequelize, DataTypes) => {
const User = sequelize.define("users", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      defaultValue: 1
    },
    name: {
      type: DataTypes.STRING,
      required: true
    },
    role : {
      type: DataTypes.STRING,
      defaultValue: 'STUDENT'
    },
    password: {
      type: DataTypes.STRING,
      required: true
    },
    email: {
      type: DataTypes.STRING,
      required: true
    },
    token : {
      type: DataTypes.STRING,
    },
    updated: {
      type: DataTypes.BOOLEAN
  },
    createdAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: new Date(),
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: new Date(),
    }

})
    return User;
};


 