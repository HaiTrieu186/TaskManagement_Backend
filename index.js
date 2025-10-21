const express = require('express')
const route=require('./routes/index.route');
const app = express()
require("dotenv").config()
const port = process.env.PORT
const sequelize= require("./config/database");

// gọi sequelize để kết nối tới database
sequelize;

route(app);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
