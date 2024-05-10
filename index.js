const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleWare
app.use(
    cors({
      origin: [
        "http://localhost:5173"
      ],
      credentials: true,
    })
  );
  app.use(express.json());


  app.get('/',(req,res)=>{
    res.send('the query server is running .')
  })

  app.listen(port,()=>{
    console.log(`the port number is: ${port}`)
  })