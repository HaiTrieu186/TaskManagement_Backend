const express = require('express')
require("dotenv").config()
const route=require('./routes/index.route');
const app = express()

const port = process.env.PORT
const sequelize= require("./config/database");

// gọi sequelize để kết nối tới database
sequelize;

route(app);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
