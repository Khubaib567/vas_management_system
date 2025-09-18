module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("service", {
      service: {
        type: DataTypes.STRING,
        allowNull: false
      },
      subscriber: {
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
    return Project;
  };
  
  
   