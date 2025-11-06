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
                [literal("SUM(CASE WHEN Status IN ('initial', 'doing', 'pending') THEN 1 ELSE 0 END)"),"in_progress"],
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
        // Lập gom theo (tuần, tháng, năm) - tính từ hôm nay trờ về trưỡc
        if (period==="week"){
            range= { [Op.gte]: literal("DATE_SUB(NOW(), INTERVAL 7 DAY)")};
            groupBy= fn("DATE",col("Task.created_at"));
        }

        if (period==="month"){
            range= { [Op.gte]: literal("DATE_SUB(NOW(), INTERVAL 1 MONTH)")};
            groupBy= fn("WEEK",col("Task.created_at"));
        }

         if (period==="year"){
            range= { [Op.gte]: literal("DATE_SUB(NOW(), INTERVAL 1 YEAR)")};
            groupBy= fn("MONTH",col("Task.created_at"));
        }

        find.created_at=range;

        // Lọc dữ liệu
        const stats= await model.Task.findAll({
            where:find,
            include:[includeObj],
            attributes:[
                [groupBy, 'groupRange'],
                [fn("COUNT",col("Task.id")),"created"],
                [literal("SUM(CASE WHEN Status= 'finish' THEN 1 ELSE 0 END)"),"completed"]
            ],
            order: [[groupBy, 'ASC']],
            group:[groupBy],
            distinct:true
        })

        const formatLabel = (item) => {
            const created_at = item.getDataValue("Task.created_at");
            const year= new Date(created_at).getFullYear();

            if (period === 'week')  
                return `DAY: ${item.getDataValue("groupRange")}`;
            if (period === 'month') 
                return `WEEK: ${item.getDataValue("groupRange")} -${year}`;  
            if (period === 'year')  
                return `MONTH: ${item.getDataValue("groupRange")} -${year}`; 
           
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
                [literal("SUM(CASE WHEN Status='initial'   THEN 1 ELSE 0 END)"),"initial"],
                [literal("SUM(CASE WHEN Status='doing'     THEN 1 ELSE 0 END)"),"doing"],
                [literal("SUM(CASE WHEN Status='pending'   THEN 1 ELSE 0 END)"),"pending"],
                [literal("SUM(CASE WHEN Status='finish'    THEN 1 ELSE 0 END)"),"finish"],
                [literal("SUM(CASE WHEN Status='notFinish' THEN 1 ELSE 0 END)"),"notFinish"]
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

