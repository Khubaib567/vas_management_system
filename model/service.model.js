module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define("service", {
      service: {
        type: DataTypes.STRING,
        allowNull: false
      },
      msisdn: {
      type: DataTypes.STRING,
      allowNull: false
      },
      subscribe: {
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
    // Project.associate = models => {
    //   User.belongsTo(models.Project);
    // }
    return Service;
  };
  
  
   