const User=require("./user.model");
const Task=require("./task.model");
const Project=require("./project.model");
const TaskMember=require("./taskMember.model");
const ProjectMember=require("./projectMember.model");


//--- Quan hệ 1-N --------------------------

    //----1 User tạo nhiều task, mỗi task chỉ được tạo bởi một user.
    User.hasMany(Task,{
        foreignKey:"Creator_id",
        as:"CreatedTasks"
    });
    Task.belongsTo(User,{
        foreignKey:"Creator_id",
        as:"TaskCreator"
    })

    //----1 User tạo nhiều project, mỗi project chỉ được tạo bởi một user.
    User.hasMany(Project,{
        foreignKey:"Manager_id",
        as:"CreatedProjects"
    })
    Project.belongsTo(User,{
        foreignKey:"Manager_id",
        as:"ProjectManager"
    })


    //----1 Project có nhiều task, mỗi task chỉ thuộc về một project.
    Project.hasMany(Task,{
        foreignKey:"project_id",
        as:"ManagedTasks"
    })

    Task.belongsTo(Project,{
        foreignKey:"project_id",
        as:"ParentProject"
    })


    //--- Quan hệ đệ quy: 1 Task có thể gồm nhiều task con, 1 task con chỉ thuộc về một task cha.
    Task.hasMany(Task,{
        foreignKey:"Parent_task_id",
        as:"ChildTasks"
    })

    Task.belongsTo(Task,{
        foreignKey:"Parent_task_id",
        as:"ParentTask"
    })

//------- END ------------------------------
 
   





//--- Quan hệ N-N --------------------------


    //---- Quan hệ n-n: 1 user tham gia nhiều task, 1 task gồm nhiều member tham gia
    User.belongsToMany(Task,{
        through:TaskMember,
        foreignKey:"Member_id",
        otherKey:"Task_id",
        as:"JoinedTasks"
    })
    Task.belongsToMany(User,{
        through:TaskMember,
        foreignKey:"Task_id",
        otherKey:"Member_id",
        as:"TaskMembers"
    })


    //---- Quan hệ n-n: 1 user tham gia nhiều task, 1 task gồm nhiều member tham gia
    User.belongsToMany(Project,{
        through:ProjectMember,
        foreignKey:"Member_id",
        otherKey:"Project_id",
        as:"JoinedProjects"
    })
    Project.belongsToMany(User,{
        through:ProjectMember,
        foreignKey:"Project_id",
        otherKey:"Member_id",
        as:"ProjectMembers"

    })

    
//------- END ------------------------------

module.exports={
    User,
    Task,
    Project,
    ProjectMember,
    TaskMember
}