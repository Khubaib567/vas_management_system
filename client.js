const express = require('express')
const axios = require('axios')
const app = express()
const port = 4000

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// POST route to handle incoming data
app.post('/api/data', async (req, res) => {
 try {
     // Access the JSON data from the request body
  const requestData = req.body;

//   console.log(typeof(requestData))

  const url = "http://localhost:3000/api/user/"


  const data = await axios.post(url , requestData)
  
  // Log the received data to the server console
  // console.log('Received data:', requestData);
  
  // Send a response back to the client
  res.status(200).send({
    message: 'Data received successfully!',
    yourData: data
  });
 } catch (error) {
    res.status(500).send({
        message: error.message
    })
 }
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
