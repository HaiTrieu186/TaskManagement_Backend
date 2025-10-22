const sequelize=require("../config/database")
const {DataTypes} = require("sequelize");

const TaskMember= sequelize.define("TaskMember",{
    Task_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    Member_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    joined_at:{
        type:DataTypes.DATE,
        allowNull:false
    }
},{
    tableName:"task_members",
    timestamps:false
})

module.exports=TaskMember;