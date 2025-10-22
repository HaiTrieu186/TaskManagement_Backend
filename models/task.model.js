const sequelize=require("../config/database");
const {DataTypes} = require("sequelize");

const Task= sequelize.define("Task",{
    id:{
        type:DataTypes.INTEGER,
        autoIncrement:true,
        primaryKey:true,
        allowNull:false,
    },
    TaskName:{
        type:DataTypes.STRING,
        allowNull:false
    },
    Description:{
        type: DataTypes.TEXT("long"),
        allowNull:true
    },
    Status:{
        type:DataTypes.ENUM(['initial','doing','finish','pending','notFinish']),
        allowNull:false
    },
    Priority:{
        type:DataTypes.ENUM(['low','medium','high']),
        allowNull:false
    },
    Start_date:{
        type:DataTypes.DATE,
        allowNull:true
    },
    End_date:{
        type:DataTypes.DATE,
        allowNull:true
    },
    completed_date:{
        type:DataTypes.DATE,
        allowNull:true
    },
    Creator_id:{
        type:DataTypes.INTEGER,
        allowNull:false
    },
    Parent_task_id:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    project_id:{
        type:DataTypes.INTEGER,
        allowNull:true
    },
    deleted:{
        type: DataTypes.BOOLEAN,
        allowNull:false
    },
    deleted_at: {
        type: DataTypes.DATE,
    }
},{
    tableName:"tasks",
    timestamps:true,
    createdAt: 'created_at', 
    updatedAt: 'updated_at',
});

module.exports= Task;