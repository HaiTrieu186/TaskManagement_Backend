require("dotenv").config()

const express = require('express')
const app = express()
var cors = require('cors')
const port = process.env.PORT || 5000
const bodyParser = require('body-parser')

const helmet = require('helmet'); 
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 phút 
	max: 100, // Giới hạn mỗi IP 100 requests trong 15 phút
	message: 'Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau 15 phút'
});

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

app.use(helmet());
app.use('/api', limiter);


const sequelize= require("./config/database");
const route=require('./routes/index.route');


// gọi sequelize để kết nối tới database
sequelize;
route(app);



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
