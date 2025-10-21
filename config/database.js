const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql'
  }
);

sequelize.authenticate().then(() => {
   console.log('Kết nối MySQL thành công !.');
}).catch((error) => {
   console.error('Không thể kết nối tới MySQL: ', error);
});

module.exports= sequelize;