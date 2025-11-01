// const express = require("express");
// const axios = require("axios");


if(process.env.NODE !== "production"){
  require('dotenv').config({path:"../.secrets/.env"})
}

// require("../.secrets/.env")

const redis = require("redis");

// const app = express();
// const PORT = 3000;

// // ✅ Create Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient.on("error", (err) => console.error("Redis Client Error:", err));

redisClient.connect().then(() => {
  console.log("✅ Connected to Redis");
});

// ✅ Middleware for caching
module.exports =  cacheMiddleware =  async (req, res, next) =>  {
  const { id  } = req.params;

  try {
    if(id){
       const cacheData = await redisClient.get(`:${id}`);
      //  console.log("CachedData" , cacheData)
       if (cacheData) {
         console.log("Cache hit");
         return res.json(JSON.parse(cacheData));

       }
       console.log("Cache miss");
    }
    next();
  } catch (err) {
    console.error("Redis error:", err);
    next();
  }
}

// // ✅ Route: fetch post data from API or cache
// app.get("/posts/:id", cacheMiddleware, async (req, res) => {
//   const { id } = req.params;
//   const apiURL = `https://jsonplaceholder.typicode.com/posts/${id}`;

//   try {
//     const { data } = await axios.get(apiURL);

//     // Save response to Redis with 60s TTL
//     await redisClient.setEx(`post:${id}`, 60, JSON.stringify(data));

//     console.log("✅ Data cached in Redis");
//     res.json(data);
//   } catch (err) {
//     console.error("API Error:", err.message);
//     res.status(500).json({ message: "Error fetching data" });
//   }
// });

// // ✅ Start the Express server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });
