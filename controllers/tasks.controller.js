const model= require("../models/index.model");
const sort_values=["ASC","DESC"];
const status_values=['initial', 'doing', 'finish', 'pending', 'notFinish'];
const priority_values=['low', 'medium', 'high'];

// [GET] /tasks
module.exports.index = async (req, res) =>{
   try {
        const find={
            deleted:false,
        }
        const sort=[];

        // Lọc theo trạng thái
        if (req.query.status && status_values.includes(req.query.status))
            find.Status=req.query.status;

        // Lọc theo độ ưu tiên
        if (req.query.priority && priority_values.includes(req.query.priority))
            find.Priority=req.query.priority;

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
            
        const tasks=await model.Task.findAll({
            where :find,
            order:[...sort],
            raw:true
        })
    return res.json(tasks)
   } catch (error) {
        return res.status(500).json({
            message:"Đã xảy ra lỗi",
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
            raw:true
        })
        if (!task){
            return res.status(404).json({
                message:"Task không tồn tại"
            })
        }
        return res.status(200).json(task);

    } catch (error) {
        return res.status(500).json({
            message:"Đã xảy ra lỗi",
            error:error.message,
        })
        
    }
}