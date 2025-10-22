const sequelize=require("../config/database")
const {DataTypes} = require("sequelize");

const Project= sequelize.define("Project",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        allowNull:false,
        primaryKey:true
    },
    Name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    Description:{
        type: DataTypes.TEXT("long"),
        allowNull:true
    },
    Start_date:{
        type:DataTypes.DATE,
        allowNull:true
    },
    End_date:{
        type:DataTypes.DATE,
        allowNull:true
    },
    Manager_id:{
        type:DataTypes.INTEGER,
        allowNull:true,
    },
    deleted:{
        type: DataTypes.BOOLEAN,
        allowNull:false
    },
    deleted_at: {
        type: DataTypes.DATE,
    }

},{
    tableName:"projects",
    timestamps:true,
    createdAt:"created_at",
    updatedAt:"updated_at"
})

module.exports=Project;