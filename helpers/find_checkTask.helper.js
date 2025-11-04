const model = require("../models/index.model");
const status_values = ['initial', 'doing', 'finish', 'pending', 'notFinish'];
const priority_values = ['low', 'medium', 'high'];
const sort_values = ["ASC", "DESC"];

const findTaskAndCheck = async (taskId, currentUserId, Role) => {

    // tìm task tương ứng
    const task = await model.Task.findOne({
        where: { id: taskId, deleted: false },
        include: [{
            model: model.User,
            as: "TaskMembers",
            attributes:["id","FirstName","LastName"],
            through:{
                model:model.TaskMember,
                attributes:["joined_at"]
            }
        }]
    });


    // Check task tồn tại
    if (!task) {
        const error = new Error("Không tìm thấy công việc");
        error.statusCode = 404;
        throw error;
    }


    if (Role!=="admin"){
        // Check quyền 
        const isCreator = task.Creator_id === currentUserId;
        const isMember = task.TaskMembers.some(member => member.id === currentUserId);

        if (!isCreator && !isMember) {
            const error = new Error("Bạn không có quyền truy cập task này");
            error.statusCode = 403;
            throw error;
        }
    }
    
    return task;
}

module.exports = {
    status_values,
    priority_values,
    sort_values,
    findTaskAndCheck
}