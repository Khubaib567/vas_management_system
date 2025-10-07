if(process.env.NODE !== "production"){
    require('dotenv').config({path : "../.secrets/.env"})
}


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_CONNECTION_URI;



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

module.exports = mongodbConnector = async ()  => {
  try {
    // console.log('Hello from Server!')
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // return db
    return "Pinged your deployment. You successfully connected to MongoDB!";
  } catch(error) {
    // Ensures that the client will close when you finish/error
    throw new Error(error.message)
  }
}


// const getUtil = async () => {
//   const db = await mongodbConnector();
//   console.log(typeof(db))
// }

// getUtil()
// run().catch(console.dir);
