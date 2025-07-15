module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("project", {
      project_title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      project_created_by: {
      type: DataTypes.STRING,
      allowNull: false
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
    // Project.associate = models => {
    //   User.belongsTo(models.Project);
    // }
    return Project;
  };
  
  
   