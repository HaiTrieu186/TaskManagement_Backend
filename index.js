require("dotenv").config()

const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT || 5000
const bodyParser = require('body-parser')


const corsOptions = {
    origin: 'http://localhost:3000' 
}
app.use(cors(corsOptions));
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())


const sequelize= require("./config/database");
const route=require('./routes/index.route');


// gọi sequelize để kết nối tới database
sequelize;
route(app);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
