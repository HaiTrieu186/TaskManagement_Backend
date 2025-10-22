const sequelize= require("../config/database");
const {  DataTypes } = require('sequelize');


const User= sequelize.define("User",{
  id: {
    type: DataTypes.INTEGER,
    autoIncrement:true,
    allowNull:false,
    primaryKey:true
  },
  FirstName: {
    type: DataTypes.STRING(100),
    allowNull:false,
  },
  LastName: {
    type: DataTypes.STRING(100),
    allowNull:false,
  },
  Email: {
    type: DataTypes.STRING(100),
    unique:true,
    allowNull:false,
  },
  Password: {
    type: DataTypes.STRING,
    allowNull:false,
  },
  Role: {
    type: DataTypes.ENUM(['user','admin']),
    allowNull:false,
  },
  avatar: {
    type:DataTypes.TEXT("long"),
    allowNull:true,
},  
deleted:{
  type: DataTypes.BOOLEAN,
  allowNull:false
}

,deleted_at: {
   type: DataTypes.DATE,
}


},{
 tableName:"users",
 timestamps:true,
 createdAt: 'created_at', 
 updatedAt: 'updated_at',
});



module.exports= User;
