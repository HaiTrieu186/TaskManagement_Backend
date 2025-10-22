const sequelize=require("../config/database")
const {DataTypes} = require("sequelize");

const ProjectMember= sequelize.define("ProjectMember",{
    Project_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    Member_id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        allowNull:false
    },
    role:{
        type:DataTypes.ENUM(["member","lead","viewer"]),
        allowNull:true,
    },
    joined_at:{
        type:DataTypes.DATE,
        allowNull:false
    }
},{
    tableName:"project_members",
    timestamps:false
})

module.exports=ProjectMember;