const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv');
const app = express();
dotenv.config()
const booking = require('./routes/booking');


// connect to database
mongoose.connect(process.env.DATABASE_URL)
.then(()=>console.log("successfully connted"))
.catch((err)=>console.log(`failed to connect ${err}`))

//middleware
app.use(express.json())
app.use(cors())

// define routes
app.use("/api",booking);

// server start
app.listen(process.env.PORT,()=>{
    console.log(`listening to ${process.env.PORT}`);
})