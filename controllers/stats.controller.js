const model = require("../models/index.model");
const { Op, fn, col, literal } = require("sequelize");

// [GET] /stats/overview
module.exports.overview= async (req, res) =>{
    try {
        const userID = req.user.id;
        const find={
            deleted:false
        }
        const includeObj={
            model:model.User,
            as:"TaskMembers",
            attributes:[],
            required: false
        }

        if (req.user.Role!=="admin"){
             includeObj.where={id: userID}
             includeObj.required= true
        }

        const overviewObj= await model.Task.findOne({
            where:find,
            include:[includeObj],
            attributes:[
                [fn("COUNT", col("Task.id")),"total"],
                [literal("SUM(CASE WHEN Status ='finish' THEN 1 ELSE 0 END)"),"completed"],
                [literal("SUM(CASE WHEN Status ='notFinish' THEN 1 ELSE 0 END)"),"failed"],
                [literal("SUM(CASE WHEN (Status IN ('initial', 'doing', 'pending') AND (End_date >= NOW() OR End_date IS NULL)) THEN 1 ELSE 0 END)"),"in_progress"],
                [literal("SUM(CASE WHEN End_date < NOW() AND Status IN ('initial', 'doing', 'pending') THEN 1 ELSE 0 END)"),"overdue"]
                //     [literal(`(
                //         CASE
                //             -- 1. Tránh lỗi chia cho 0
                //             WHEN COUNT(Task.id) = 0 THEN 0 
                            
                //             -- 2. Công thức tính %
                //             ELSE (SUM(CASE WHEN Status = 'finish' THEN 1 ELSE 0 END) * 100.0) / COUNT(Task.id)
                //         END
                //     )`),
                //     'completion_rate' // Tên cột
                // ]
            ],
            distinct:true
        }) 

        if (!overviewObj) {
            return res.status(404).json({
                success: false,
                message: "Không thể lấy dữ liệu thống kê"
            });
        }

        //console.log(overviewObj);
        const data = overviewObj.toJSON();
        //console.log(data);
        

        const total = parseInt(data.total) || 0;
        const completed = parseInt(data.completed) || 0;
        const failed = parseInt(data.failed) || 0;
        const in_progress = parseInt(data.in_progress) || 0;
        const overdue = parseInt(data.overdue) || 0;


        if (total===0)
            return res.status(200).json({
                success:true,
                message:"Chưa có công việc nào để thống kê !",
                overview: { total: 0, completed: 0, failed: 0, in_progress: 0, overdue: 0, completion_rate: 0 }
            })

        const completion_rate = Math.round(( completed*100 )/total);

        return res.status(200).json({
            success:true,
            message:"Lấy thống kê tổng quan thành công",
            overview: {
                total: total,
                completed: completed,
                failed: failed,
                in_progress:in_progress,
                overdue: overdue,
                completion_rate
            }
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy thống kê tổng quan",
            error: error.message
        })
    }
}

// [GET] /stats/progress-chart
module.exports.progressChart=async (req, res) =>{
    try {
        const userID = req.user.id;
        const period= req.query.period || "month"
        const labels=[];
        const created=[];
        const completed=[];
        const find={
            deleted:false
        }
        const includeObj={
            model:model.User,
            as:"TaskMembers",
            attributes:[],
            required: false
        }

        if (req.user.Role!=="admin"){
             includeObj.where={id: userID}
             includeObj.required= true
        }

        let groupBy;
        let range;
        let attributes 
        // Lập gom theo (tuần, tháng, năm) - tính từ hôm nay trờ về trưỡc
        if (period==="week"){
            range= { [Op.gte]: literal("DATE_SUB(NOW(), INTERVAL 7 DAY)")};
            groupBy= [fn("DATE",col("Task.created_at"))];
            attributes = [
                [fn("DATE", col("Task.created_at")), "groupDate"],
            ];
        }

        if (period==="month"){
            range= { [Op.gte]: literal("DATE_SUB(NOW(), INTERVAL 1 MONTH)")};
            groupBy= [
                fn("WEEK",col("Task.created_at")),
                fn("YEAR",col("Task.created_at"))
            ];
            attributes = [
                [fn("YEAR", col("Task.created_at")), "groupYear"],  
                [fn("WEEK", col("Task.created_at")), "groupWeek"], 
            ];
        }

         if (period==="year"){
            range= { [Op.gte]: literal("DATE_SUB(NOW(), INTERVAL 1 YEAR)")};
            groupBy= [
                fn("MONTH",col("Task.created_at")),
                fn("YEAR",col("Task.created_at"))
            ];
            attributes = [
                [fn("YEAR", col("Task.created_at")), "groupYear"],   
                [fn("MONTH", col("Task.created_at")), "groupMonth"],
            ];
        }

        find.created_at=range;

        // Lọc dữ liệu
        const stats= await model.Task.findAll({
            where:find,
            include:[includeObj],
            attributes:[
                ...attributes,
                [fn("COUNT",col("Task.id")),"created"],
                [literal("SUM(CASE WHEN Status= 'finish' THEN 1 ELSE 0 END)"),"completed"]
            ],
            order: [[groupBy[0], "ASC"], ...(groupBy[1] ? [[groupBy[1], "ASC"]] : [])],
            group:groupBy,
            distinct:true
        })

        const formatLabel = (item) => {
            if (period === 'week') {
                const date = item.getDataValue("groupDate");
                return `DAY: ${date}`; // Trả về 'DAY: 2025-11-08'
            }
            if (period === 'month') {
                const year = item.getDataValue("groupYear");
                const week = item.getDataValue("groupWeek");
                return `WEEK:${week} - ${year}`; // Trả về 'WEEK: 45-2025'
            }
            if (period === 'year') {
                const year = item.getDataValue("groupYear");
                const month = item.getDataValue("groupMonth");
                return `MONTH:${month} - ${year}`; // Trả về 'MONTH: 11-2025'
            }
        };

        for (let item of stats){
            labels.push(formatLabel(item));
            created.push(parseInt(item.getDataValue("created"),10))
            completed.push(parseInt(item.getDataValue("completed"),10))
        }
        
        return res.status(200).json({
            success:true,
            message:"Lấy thống kê tổng quan thành công",
            data:{
                labels,
                created,
                completed
            }
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy dữ liệu cho biểu đồ tiến độ",
            error: error.message
        })
    }
}

// [GET] /stats/task-status 
module.exports.taskStatus=async (req, res) =>{
    try {
        const userID = req.user.id;
         const find={
            deleted:false
        }
        const includeObj={
            model:model.User,
            as:"TaskMembers",
            attributes:[],
            required: false
        }

        if (req.user.Role!=="admin"){
             includeObj.where={id: userID}
             includeObj.required= true
        }

        const stats= await model.Task.findOne({
            where:find,
            attributes:[
                [literal("SUM(CASE WHEN Status='initial' AND (End_date >= NOW() OR End_date IS NULL)  THEN 1 ELSE 0 END)"),"initial"],
                [literal("SUM(CASE WHEN Status='doing'   AND (End_date >= NOW() OR End_date IS NULL)  THEN 1 ELSE 0 END)"),"doing"],
                [literal("SUM(CASE WHEN Status='pending' AND (End_date >= NOW() OR End_date IS NULL)  THEN 1 ELSE 0 END)"),"pending"],
            ],
            include:[includeObj],
            distinct:true
        })

        const data = stats.toJSON();
        const statusData = {
            initial: parseInt(data.initial) || 0,
            doing: parseInt(data.doing) || 0,
            pending: parseInt(data.pending) || 0,
            finish: parseInt(data.finish) || 0,
            notFinish: parseInt(data.notFinish) || 0
        };
        const total = Object.values(statusData).reduce((sum, val) => sum + val, 0);
        
        if (total === 0) {
            return res.status(200).json({
                success: true,
                message: "Chưa có công việc nào để thống kê",
                stats: statusData
            });
        }

        return res.status(200).json({
            success:true,
            message:"Lấy thống kê tổng quan thành công",
            stats: statusData
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy dữ liệu phân bố trạng thái công việc",
            error: error.message
        })
    }
}

// [GET] /stats/project-summary
module.exports.projectSummary= async (req, res) =>{
    try {
        const userID = req.user.id;
         const find={
            deleted:false
        }
        const includeObj={
            model:model.User,
            as:"ProjectMembers",
            attributes:[],
            required: false
        }

        if (req.user.Role!=="admin"){
             includeObj.where={id: userID}
             includeObj.required= true
        }

        const joinProject = await model.Project.findAll({
            where:find,
            include:[includeObj],
            attributes:["id"]
        })

        if (!joinProject || joinProject.length===0)
            return res.status(404).json({
                success:true,
                message:"Không có dự án nào để thống kê"
            })

        const idList= joinProject.map(project => project.id);
        
        const statsProject = await model.Project.findAll({
            where:{
                id:{
                    [Op.in]:idList
                }
            },
            include:[
                {
                    model:model.Task,
                    as:"ManagedTasks",
                    attributes:[],
                    required: false
                }
            ],
            attributes:[
                "id","Name",
                [fn("COUNT",col("ManagedTasks.id")),"total_tasks"],
                [literal("SUM(CASE WHEN ManagedTasks.Status='finish' THEN 1 ELSE 0 END)"),"completed_tasks"],
                [literal(`(CASE WHEN COUNT(ManagedTasks.id) = 0 THEN 0 
                ELSE (SUM(CASE WHEN ManagedTasks.Status = 'finish' THEN 1 ELSE 0 END) * 100.0) / COUNT(ManagedTasks.id) END)`),'completion_rate']
            ],
            distinct:true,
            group: ["Project.id"]
        })

        const data= statsProject.map( project =>{
            const projectJSON= project.toJSON();
            return {
                id:projectJSON.id,
                Name: projectJSON.Name,
                total_tasks: parseInt(projectJSON.total_tasks, 10), 
                completed_tasks: parseInt(projectJSON.completed_tasks, 10) || 0, // (|| 0 để xử lý null)
                completion_rate: parseFloat(parseFloat(projectJSON.completion_rate).toFixed(2))
            }
        })


        return res.status(200).json({
            success:true,
            message:"Lấy thống kê tổng quan thành công",
            stats: data
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy dữ liệu thống kê theo dự án",
            error: error.message
        })
    }
}

// [GET] /stats/user-performance
module.exports.userPerformance= async (req, res) =>{
    try {
        const find={
            Role:{
                [Op.ne]:"admin"
            },
            deleted:false
        }
        const includeObj={
            model:model.Task,
            as:"JoinedTasks",
            attributes:[],
            required: false
        }

        const statsUser= await model.User.findAll({
            where:find,
            include:[includeObj],
            attributes:[
                "id","FirstName","LastName","Email",
                [literal("SUM(CASE WHEN JoinedTasks.Creator_id= User.id THEN 1 ELSE 0 END)"),"tasks_created"],
                [literal("SUM(CASE WHEN JoinedTasks.Status='finish' THEN 1 ELSE 0 END)"),"tasks_completed"],
                [literal("SUM(CASE WHEN JoinedTasks.Creator_id!= User.id THEN 1 ELSE 0 END)"),"task_assigned"]
            ],
            group:["User.id"],
            distinct:true,
        })

        const data= statsUser.map(user =>{
            const json=user.toJSON();

            return {
                id:json.id,
                FirstName:json.FirstName,
                LastName:json.LastName,
                Email:json.Email,
                tasks_created: parseInt(json.tasks_created,10),
                tasks_completed: parseInt(json.tasks_completed,10),
                task_assigned: parseInt(json.task_assigned,10),
            }
        })

       
        return res.status(200).json({
            success:true,
            message:"Lấy thống kê tổng quan thành công",
            stats: data
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy dữ liệu thống kê theo dự án",
            error: error.message
        })
    }
}
