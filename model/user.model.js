module.exports = (sequelize, DataTypes) => {
const User = sequelize.define("users", {  
  name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role : {
      type: DataTypes.STRING,
    },
    token : {
      type: DataTypes.STRING,
    },
    updated: {
      type: DataTypes.BOOLEAN,
  },
    createdAt: {
    type: DataTypes.DATE,
    defaultValue: new Date(),
    
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
    }

})
    return User;
};


 