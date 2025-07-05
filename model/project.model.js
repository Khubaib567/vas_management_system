module.exports = (sequelize, Sequelize) => {
  const Project = sequelize.define("project", {
      project_title: {
        type: Sequelize.STRING
      },
      project_created: {
      type: Sequelize.STRING
      },
      updated: {
        type: Sequelize.BOOLEAN
      }
  })
    // Project.associate = models => {
    //   User.belongsTo(models.Project);
    // }
    return Project;
  };
  
  
   