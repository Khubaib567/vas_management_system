const createServiceFromSqldb = async (req, db) => {
  const {service , msisdn , subscribe } = req.body
  const Service = db.services;
  const User = db.users;

  try {

     // CREATE A PROJECT OBJECT.
      const serviceObj = {
          service: service,
          msisdn : msisdn ,
          subscribe: subscribe ? subscribe : false
      };
      // console.log(serviceObj.subscriber)
      
      // FETCH USER WITH PROJECT ARRIBUTE.
      const users = await User.findAll({ include: Service });
      
      const user = users.find((obj) => obj.msisdn === serviceObj.msisdn);
      // console.log(user)
    
      // UPDATE THE USER UPDATE ATTRIBUTE 
      const result = await User.update({ subscribe: serviceObj.subscribe }, { where: { id: user.id } });
      if(result) console.log("User 'Service' column has been updated!")
    
      // CREATE A PROJECT INSTANCE.
      const updatedService = await Service.create(serviceObj);
      // console.log(updatedService)
          
      // SET THE PROJECT INSTANCE WITH FOREIGN KEY BASED ON USER'ID
      if (user) {
           await user.setServices(updatedService);
      }


      return updatedService
    
  } catch (error) {
      throw new Error('Error during create a Service.' , error.message)
  }
}



const getAllSerivceFromSqldb = async (req , db) => {
  console.log('Hello From Server!')
  const Service = db.services;
  const Op = db.Sequelize.Op;

  const { service, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const condition = service
    ? { service: { [Op.like]: `%${service}%` } }
    : {};

  try {

    const data = await Service.findAndCountAll({
      where: condition,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return data;

  } catch (err) {
    throw new Error("Error find the services : " , err.message)
  };
}



const getOneServiceFromSqldb = async (req,id,db) => {
    const Service = db.services;
    const User = db.users;
    try {
      const data = await Service.findByPk(id , { include : User })
      return data
    } catch (error) {
      throw new Error("Error find the service : " , err.message)
    }

}

const updateServiceFromSqldb = async (req,id,db) => {
    const Service = db.services;
    const User = db.users;
    const { msisdn , subscribe} = req.body
    try {
      const data = await Service.update(req.body, { where: { id: id } })
      const userUpdated = await User.update({ subscribe: subscribe }, { where: { msisdn : msisdn } });
      if(userUpdated) console.log("User 'Serice' column has been updated!")
      return data
    } catch (error) {
      throw new Error("Error find the service : " , err.message)
    }

}


const deleteServiceFromSqldb = async (id,db) => {
    const Service = db.services;
    try {
      await Service.destroy({ where: { id: id } });
    } catch (error) {
      throw new Error("Error find the service : " , err.message)
    }

}

const deleteAllServiceFromSqldb = async (db) => {
    const Service = db.services;
    try {
      await Service.destroy({ where: {}, truncate: false });
    } catch (error) {
      throw new Error("Error find the service : " , err.message)
    }

}

const findAllUpdatedServiceFromSqldb = async (db) => {
    const Service = db.services;
    try {
      const data = await Service.findAll({ where: { subscribe: true } });;
      return data;
    } catch (error) {
      throw new Error("Error find the service : " , err.message)
    }

}

module.exports = {createServiceFromSqldb,getAllSerivceFromSqldb , getOneServiceFromSqldb , updateServiceFromSqldb , deleteServiceFromSqldb , deleteAllServiceFromSqldb , findAllUpdatedServiceFromSqldb}