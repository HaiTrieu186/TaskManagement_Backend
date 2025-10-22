const model= require("../models/index.model");

module.exports.index = async (req, res) =>{
    const users= await model.User.findAll({
        where:{
            id:1
        },
        raw: true,
    });

    const tasks=await model.Task.findAll({
        raw:true
    })

    const projects=await model.Project.findAll({
        raw:true
    })

    const taskMembers=await model.TaskMember.findAll({
        raw:true
    })

    const projectMembers=await model.ProjectMember.findAll({
        raw:true
    })


    res.json({
        users,
        tasks,
        projects,
        taskMembers,
        projectMembers
    });
    
}