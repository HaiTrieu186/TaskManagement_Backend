const model= require("../models/index.model");
const { Op} = require("sequelize");
const paginationHelper=require("../helpers/pagination.helper")
const { task_status_values, task_priority_values, sort_values, findTaskAndCheck} = require("../helpers/find_check.helper");
const ExcelJS= require("exceljs")


// [GET] /tasks
module.exports.getTasks = async (req, res) =>{
   try {
    
        const find={
            deleted:false,
        }
        const sort=[];
        const includeObj={
            model:model.User,
            as:"TaskMembers",
            attributes:[],
        }

        if (req.user.Role !== "admin") {
            includeObj.where={id: req.user.id},
            includeObj.required = true; 
        } else {
            includeObj.required = false;
        }

        // Lọc theo trạng thái
        if (req.query.Status && task_status_values.includes(req.query.Status))
            find.Status=req.query.Status;

        // Lọc theo độ ưu tiên
        if (req.query.Priority && task_priority_values.includes(req.query.Priority))
            find.Priority=req.query.Priority;
        
        // Lọc theo tên project_id
        if (req.query.project_id)
            find.project_id=req.query.project_id

        // Lọc theo ngày deadline
        if (req.query.deadline_from || req.query.deadline_to){
            find.End_date={}
            if (req.query.deadline_from)
                find.End_date[Op.gte]=new Date(req.query.deadline_from);
                
            if (req.query.deadline_to)
                find.End_date[Op.lte]=new Date(req.query.deadline_to);
        }
        
        // Tìm kiếm theo tên task
        if (req.query.search){
            find.TaskName={
                [Op.like]:`%${req.query.search}%`
            }
        }

        const joinedTask= await model.Task.findAll({
            where:find,
            include:[includeObj],
            attributes:["id"]
        })

        if (!joinedTask|| joinedTask.length===0)
            return res.status(200).json({
                success:true,
                message:"Không có công việc nào",
        })

        const idTasksList= joinedTask.map(task => task.id);
        console.log(idTasksList.length);

        // Sắp xếp (nếu có)
        if (req.query.sortKey && req.query.sortValue){
            const sortKey=req.query.sortKey;
            const sortValue=req.query.sortValue;

            // Nếu nhận vào nhiều điều kiện sort
            if (Array.isArray(sortKey) && Array.isArray(sortValue) && sortKey.length==sortValue.length){
                for (let i=0;i<sortKey.length;i++)
                    if (sort_values.includes(sortValue[i]))
                        sort.push([sortKey[i],sortValue[i]]);
            } 
            
            // Nếu nhận vào 1 điều kiện sort
            else if (typeof sortKey === 'string' && typeof sortValue === 'string'){
                if (sort_values.includes(sortValue))
                    sort.push([sortKey,sortValue])
            }       
        }    

        // Làm phân trang pagination
        const totalTask= idTasksList.length;
        const paginationObj= paginationHelper(req.query);
        const totalPage= Math.ceil(totalTask/paginationObj.limit);

        const tasks=await model.Task.findAll({
            where :{
                id:{
                    [Op.in]: idTasksList,
                }
            },
            include: [{
                model:model.User,
                as:"TaskMembers",
                attributes:["id","FirstName","LastName"],
                through:{
                    attributes:[]
                }
            },
            {
             model:model.Project,
             as:"ParentProject",
             attributes:["Name","Description"]
            }],
            order:[...sort],
            limit:paginationObj.limit,
            offset:paginationObj.offset,
            distinct: true
        })

    return res.status(200).json({
        success:true,
        message:"Lấy danh sách công việc thành công",
        tasks:tasks,
        pagination:{
            "totalPage": totalPage,
            "totalTask": totalTask,
            "currentPage": paginationObj.currentPage,
            "limit": paginationObj.limit
        }
    });

   } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã xảy ra khi lấy danh sách",
            error:error.message,
        })
        
   }
}

// [GET] /tasks/deadline_soon 
module.exports.deadlineSoon= async (req,res) =>{
    try {
        const userID= req.user.id; 
        const today = new Date();
        today.setHours(0, 0, 0, 0);  
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);
        threeDaysLater.setHours(23, 59, 59, 999); 
        const find={
                deleted:false,
                Status:{
                    [Op.notIn]: ["finish","notFinish"]
                },
                End_date:{
                    [Op.between]: [today,threeDaysLater]
                }
        }

        const includeObj={
                model:model.User,
                as:"TaskMembers",
                attributes:[],
        }

        if (req.user.Role !== "admin") {
            includeObj.where={id: req.user.id},
            includeObj.required = true; 
        } else {
            includeObj.required = false;
        }


        const deadline_tasks = await model.Task.findAll({
            where:find,
            order:[["End_date","ASC"]],
            include:[includeObj],
            distinct: true
        })

        if (!deadline_tasks || deadline_tasks.length==0)
            return res.status(200).json({
                success:true,
                message:"Không có danh sách"
            })

        return res.status(200).json({
                success:true,
                message:"Lấy thành công danh sách sắp hết hạn",
                data: deadline_tasks
            }) 

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy danh sách sắp hết hạn",
            error:error.message
        })
    }
}

// [GET] /tasks/overdue
module.exports.overdue= async (req,res) =>{
    try {
        const userID= req.user.id; 
        const today = new Date();
        today.setHours(0, 0, 0, 0);  
        const find={
            deleted:false,
            Status:{
                [Op.notIn]: ["finish","notFinish"]
            },
            End_date:{
                [Op.lt]: today
            }
        }
        const includeObj={
                model:model.User,
                as:"TaskMembers",
                attributes:[]
        }

        if (req.user.Role !== "admin") {
            includeObj.where={id: req.user.id},
            includeObj.required = true; 
        } else {
            includeObj.required = false;
        }
        
        const overdue_tasks = await model.Task.findAll({
            where:find,
            order:[["End_date","DESC"]],
            include:[includeObj],
            distinct: true
        })

        if (!overdue_tasks || overdue_tasks.length==0)
            return res.status(200).json({
                success:true,
                message:"Không có danh sách"
            })

        return res.status(200).json({
                success:true,
                message:"Lấy thành công danh sách quá hạn",
                data: overdue_tasks
            }) 

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy danh sách quá hạn",
            error:error.message
        })
    }
}

// [GET] /tasks/:id
module.exports.getTask = async (req, res) =>{
    try {

        const id= req.params.id
        const task=await model.Task.findOne({
            where :{id: id, deleted:false},
            include:[
               {
                 model:model.User,
                 as:"TaskMembers",
                 attributes:["id","FirstName","LastName"],
                 through:{
                    model:model.TaskMember,
                    attributes:["joined_at"]
                 }
               }

            ]
        })
        if (!task){
            return res.status(404).json({
                success:false,
                message:"Task không tồn tại"
            })
        }

        if (req.user.Role==="user"){
            const isCreator = task.Creator_id === req.user.id;
            const isMember  = task.TaskMembers.some(member => member.id === req.user.id)

            if (!isCreator && !isMember )
                return res.status(401).json({
                    success:false,
                    message:"Bạn không có quyền lấy task này"
                })
        }

        return res.status(200).json({
            success:true,
            message:"Lấy công việc thành công",
            task:task.toJSON()
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã xảy ra lỗi khi lấy công việc",
            error:error.message,
        })
        
    }
}

// [GET] /tasks/:id/members
module.exports.getTaskMembers = async (req, res) =>{
    try {

        const id= req.params.id
        const task= await model.Task.findByPk(id);

         if (!task){
            return res.status(404).json({
                success:false,
                message:"Không tồn tại công việc"
            })
        }

        const members = await task.getTaskMembers({
            attributes: ["id", "FirstName", "LastName", "Email", "Role", "avatar"],
            joinTableAttributes: ['joined_at']
        });

        if (!members || members.length===0){
            return res.status(200).json({
                success:false,
                message:"Không có thành viên nào"
            })
        }

        if (req.user.Role==="user"){
            const isCreator = task.Creator_id === req.user.id;
            const isMember  = members.some(member => member.id === req.user.id)

            if (!isCreator && !isMember )
                return res.status(401).json({
                    success:false,
                    message:"Bạn không có quyền lấy task này"
                })
        }

        return res.status(200).json({
            success:true,
            message:"Lấy công việc thành công",
            members:members
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã xảy ra lỗi khi lấy công việc",
            error:error.message,
        })
        
    }
}

// [POST] /tasks/create
module.exports.create= async (req,res) =>{
   try {
        const data= req.body;
            
        const newTask= await model.Task.create({
            ...data,
            Creator_id:req.user.id,
            deleted:false
        })    

        await newTask.addTaskMember(req.user.id, {
            through:{
                joined_at: new Date()
            },
        })
        
        return res.status(201).json({
            success:true,
            message:"Đã tạo công việc thành công",
            task:newTask.toJSON()
        })


   } catch (error) {
        res.status(500).json({
            success:false,
            message:"Đã có lỗi khi tạo task",
            error:error.message
        })
   }
        
}

// [PATCH] /tasks/:id
module.exports.update = async (req,res) => {
    try {
        const { TaskName, Description, Status, Priority, Start_date, End_date }= req.body;
        const taskId= req.params.id;


        const task = await findTaskAndCheck(taskId,req.user.id,req.user.Role);

        if (TaskName !== undefined) task.TaskName = TaskName;
        if (Description !== undefined) task.Description = Description;
        if (Status !== undefined) task.Status = Status;
        if (Priority !== undefined) task.Priority = Priority;
        if (Start_date !== undefined) task.Start_date = Start_date;
        if (End_date !== undefined) task.End_date = End_date;


        await task.save();    
        return res.status(200).json({
            success:true,            
            message:"Đã cập nhật công việc thành công",
            task: task.toJSON()
        })

    } catch (error) {
        return res.status(500).json({
            success:false,            
            message:"Đã có lỗi khi thay đổi trạng thái tasks",
            error: error.message
        })
        
    }
}

// [PATCH] /tasks/:id/status 
module.exports.changeStatus= async (req ,res ) =>{
    try {
        const {Status} = req.body;
        const taskId= req.params.id;

        const task = await findTaskAndCheck(taskId,req.user.id, req.user.Role);    
        
        task.Status=Status;

        if (Status === 'finish') {
            task.completed_date = new Date();
        }

        await task.save();        
        
        return res.status(200).json({
            success:true,
            message:"Cập nhật trạng thái thành công"
        })
        

    } catch (error) {
        return res.status(500).json({
            success:false,            
            message:"Đã có lỗi khi thay đổi trạng thái tasks",
            error: error.message
        })
        
    }
}

// [DELETE] /task/:id
module.exports.delete= async (req, res ) =>{
    try {
        const id=req.params.id;

        const task =await model.Task.findOne({
            where:{id: id, deleted:false},
        })

        if (!task)
            return res.status(404).json({
                success:false,
                message:"Không tìm thấy công việc"
            })

        
       if (req.user.Role==="user"){
            const isCreator = (task.Creator_id === req.user.id);
            
            if (!isCreator)    
                return res.status(403).json({
                    success:false,
                    message:"Bạn không có quyền xóa task này"
                })
       } 

        task.deleted=true;
        task.deleted_at= new Date();
        await task.save();    

        return res.status(200).json({
            success:true,
            message:"Đã xóa công việc thành công !"
        })
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi xóa tasks"
        })
    }

}

// [PATCH] /task/:id/add-members
module.exports.addMembersToTask= async (req, res) =>{
    try {
        const taskID= req.params.id;
        const listIDUser= req.body.data;

        if (!listIDUser || !Array.isArray(listIDUser) || listIDUser.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp một mảng memberIds"
            });
        }

        const task = await findTaskAndCheck(taskID, req.user.id,req.user.Role);

        await task.addTaskMembers(listIDUser,{
            through:{
                joined_at: new Date()
            },
        })

        return res.status(200).json({
            success:true,
            message:"Đã thêm thành viên thành công"
        })
        
        
    } catch (error) {
        return  res.status(500).json({
            success:false,
            message:"Đã có lỗi xảy ra khi thêm thành viên vào task"
        })
    }
}

// [PATCH] /task/:id/remove-members
module.exports.removeMembersFromTask= async (req, res) =>{
    try {
        const taskID= req.params.id;
        const listIDUser= req.body.data;

        const task = await findTaskAndCheck(taskID, req.user.id,req.user.Role);

        if (!listIDUser || !Array.isArray(listIDUser) || listIDUser.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp một mảng memberIds (ID:[a,b,...])"
            });
        }

        await task.removeTaskMembers(listIDUser)

        return res.status(200).json({
            success:true,
            message:"Đã xóa thành viên thành công"
        })
        
        
    } catch (error) {
        return  res.status(500).json({
            success:false,
            message:"Đã có lỗi xảy ra khi xóa thành viên vào task"
        })
    }
}

// [GET] /tasks/export
module.exports.export= async (req,res) =>{
    try {
        const sort=[];
        const find={
            deleted:false
        }

        const includeObj={
            model:model.User,
            as:"TaskMembers",
            attributes:[]
        };

        // Phân quyền
        if (req.user.Role !== "admin") {
            includeObj.where = { id: req.user.id };
            includeObj.required = true;
        } else {
            includeObj.required = false;
        }
        
        // Các filter giống getTasks
        if (req.query.Status && task_status_values.includes(req.query.Status))
            find.Status = req.query.Status;

        if (req.query.Priority && task_priority_values.includes(req.query.Priority))
            find.Priority = req.query.Priority;

        if (req.query.project_id)
            find.project_id = req.query.project_id;

        if (req.query.deadline_from || req.query.deadline_to) {
            find.End_date = {};
            if (req.query.deadline_from)
                find.End_date[Op.gte] = new Date(req.query.deadline_from);
            if (req.query.deadline_to)
                find.End_date[Op.lte] = new Date(req.query.deadline_to);
        }

        if (req.query.search) {
            find.TaskName = {
                [Op.like]: `%${req.query.search}%`
            };
        }

         // Lấy danh sách các task mình tham gia hoặc tạo
        const joinedTask= await model.Task.findAll({
            where:find,
            include:[includeObj],
            attributes:["id"]
        })

        if (!joinedTask|| joinedTask.length===0)
            return res.status(200).json({
                success:true,
                message:"Không có công việc nào",
            })

        const idTasksList= joinedTask.map(task => task.id);
        console.log(idTasksList.length);
        

        // Sắp xếp
        if (req.query.sortKey && req.query.sortValue) {
            const sortKey = req.query.sortKey;
            const sortValue = req.query.sortValue;

            if (Array.isArray(sortKey) && Array.isArray(sortValue) && sortKey.length == sortValue.length) {
                for (let i = 0; i < sortKey.length; i++)
                    if (sort_values.includes(sortValue[i]))
                        sort.push([sortKey[i], sortValue[i]]);
            } else if (typeof sortKey === 'string' && typeof sortValue === 'string') {
                if (sort_values.includes(sortValue))
                    sort.push([sortKey, sortValue]);
            }
        }
        
        const finalList= await model.Task.findAll({
            where:{
                id:{
                    [Op.in]:idTasksList
                }
            },
            include:[
                {
                    model: model.User,
                    as:"TaskMembers",
                    attributes:["id","FirstName","LastName"],
                    through:{
                        attributes:["joined_at"]
                    }
                },
                {
                    model: model.User,
                    as:"TaskCreator",
                    attributes:["FirstName","LastName"]
                },
                {
                    model: model.Project,
                    as:"ParentProject",
                    attributes:["Name"]
                }
            ],
            order:[...sort]
        })
       
        // 1. Tạo Workbook và Worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Danh sách Công việc');

        // 2. Định nghĩa các cột (headers)
        worksheet.columns = [
            { header: 'STT', key: 'stt', width: 10 },
            { header: 'Tên công việc', key: 'taskName', width: 35 },
            { header: 'Dự án', key: 'project', width: 25 },
            { header: 'Trạng thái', key: 'status', width: 15 },
            { header: 'Độ ưu tiên', key: 'priority', width: 15 },
            { header: 'Ngày bắt đầu', key: 'startDate', width: 15 },
            { header: 'Deadline', key: 'endDate', width: 15 },
            { header: 'Ngày hoàn thành', key: 'completedDate', width: 15 },
            { header: 'Người tạo', key: 'creator', width: 20 },
            { header: 'Người tham gia', key: 'members', width: 40 },
            { header: 'Mô tả', key: 'description', width: 50 }
        ];

        // 3. Style cho hàng tiêu đề
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


        // 4. Helper để xử lý dữ liệu trước khi thêm vào
        // Helper format ngày
        const formatDate = (date) => {
            if (!date) return '';
            const d = new Date(date);
            return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        };

        // Helper map trạng thái
        const statusMap = {
            'initial': 'Khởi tạo',
            'doing': 'Đang làm',
            'finish': 'Hoàn thành',
            'pending': 'Đang chờ',
            'notFinish': 'Chưa hoàn thành'
        };

        // Helper map độ ưu tiên
        const priorityMap = {
            'low': 'Thấp',
            'medium': 'Trung bình',
            'high': 'Cao'
        };

        // 5. Thêm dữ liệu (finalList) vào worksheet
        finalList.forEach((task, index) => {
            const taskJson = task.toJSON(); // Dùng toJSON() để lấy data sạch

            // Xử lý dữ liệu từ các quan hệ
            const creator = taskJson.TaskCreator 
                ? `${taskJson.TaskCreator.FirstName} ${taskJson.TaskCreator.LastName}` 
                : '';
            
            const project = taskJson.ParentProject?.Name || 'Không thuộc dự án';

            const members = taskJson.TaskMembers && taskJson.TaskMembers.length > 0
                ? taskJson.TaskMembers.map(m => `${m.FirstName} ${m.LastName}`).join(', ')
                : 'Không có';

            // Thêm dòng mới vào file
            worksheet.addRow({
                stt: index + 1,
                taskName: taskJson.TaskName,
                project: project,
                status: statusMap[taskJson.Status] || taskJson.Status,
                priority: priorityMap[taskJson.Priority] || taskJson.Priority,
                startDate: formatDate(taskJson.Start_date),
                endDate: formatDate(taskJson.End_date),
                completedDate: formatDate(taskJson.completed_date),
                creator: creator,
                members: members,
                description: taskJson.Description || ''
            });
        });

        // 6. Cấu hình wrap text cho các ô
        worksheet.eachRow((row) => {
            row.eachCell((cell) => {
                cell.alignment = { vertical: 'middle', wrapText: true };
            });
        });

        // 7. Set headers cho response
        const fileName = `danh_sach_cong_viec_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

        // 8. Ghi file Excel ra response
        await workbook.xlsx.write(res);
        res.end(); // Kết thúc response
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi xuất file Excel",
            error: error.message
        })
    }
}

