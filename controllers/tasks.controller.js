const model= require("../models/index.model");
const { Op} = require("sequelize");
const paginationHelper=require("../helpers/pagination.helper")
const sort_values=["ASC","DESC"];
const status_values=['initial', 'doing', 'finish', 'pending', 'notFinish'];
const priority_values=['low', 'medium', 'high'];

// [GET] /tasks
module.exports.index = async (req, res) =>{
   try {
        const find={
            Creator_id: req.user.id,
            deleted:false,
        }
        const sort=[];

        // Lọc theo trạng thái
        if (req.query.Status && status_values.includes(req.query.Status))
            find.Status=req.query.Status;

        // Lọc theo độ ưu tiên
        if (req.query.Priority && priority_values.includes(req.query.Priority))
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

        const totalTask= await model.Task.count({
            where :find,
            order:[...sort],
        })

        // Làm phân trang pagination
        const paginationObj= paginationHelper(req.query);
        const totalPage= Math.ceil(totalTask/paginationObj.limit);

         const tasks=await model.Task.findAll({
            where :find,
            include: [
                {
                    model:model.User,
                    as:"TaskMembers",
                    attributes:["id","FirstName","LastName"],
                    through:{
                        model:model.TaskMember,
                        attributes:["joined_at"]
                    }
                }
            ],
            order:[...sort],
            limit:paginationObj.limit,
            offset:paginationObj.offset
        })

    return res.status(200).json({
        success:true,
        message:"Lấy danh sách công việc thành công",
        tasks:tasks,
        totalPage:totalPage
    });

   } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã xảy ra khi lấy danh sách",
            error:error.message,
        })
        
   }
}

// [GET] /tasks/:id
module.exports.get = async (req, res) =>{
    try {
        const id= req.params.id
        const task=await model.Task.findOne({
            where :{id: id},
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

        if (task.Creator_id !== req.user.id)
            return res.status(401).json({
                success:false,
                message:"Bạn không có quyền lấy task này"
            })


        return res.status(200).json({
            success:true,
            message:"Lấy công việc thành công",
            task:task
        });

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã xảy ra lỗi khi lấy công việc",
            error:error.message,
        })
        
    }
}

// [POST] /tasks
module.exports.create= async (req,res) =>{
   try {
        const data= req.body;

        if (!priority_values.includes(data.Priority))
            return res.status(400).json({
                success:false,
                message:"Độ ưu tiên chưa chính xác"
            })

        if (!status_values.includes(data.Status))
            return res.status(400).json({
                success:false,
                message:"Trạng thái chưa chính xác"
            })
        
        const newTask= await model.Task.create({
            ...data,
            Creator_id:req.user.id,
            deleted:false
        })    
        
        return res.status(201).json({
            success:true,
            message:"Đã tạo công việc thành công",
            task:newTask
        })


   } catch (error) {
        res.status(500).json({
            success:false,
            message:"Đã có lỗi khi tạo task",
            error:error.message
        })
   }
        
}


// [POST] /tasks/:id/status 
module.exports.status= async (req ,res ) =>{
    try {
        
        // Check xem status có hợp lệ
        const {Status} = req.body;
        if (!status_values.includes(Status))
            return res.status(400).json({
                success:false,
                message:"Trạng thái không hợp lệ !"
            })


        // Kiểm tra công việc có hợp lệ không    
        const taskID = req.params.id;
        const task=  await model.Task.findOne({
            where:{id: taskID}
        })

        if (!task)
            return res.status(404).json({
                success:false,
                message:"Không tồn tại công việc!"
            })
            
        if (task.Creator_id !== req.user.id)
            return res.status(401).json({
                success:false,
                message:"Bạn không có quyền chính sửa task này"
                })
        
        task.Status=Status;
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
