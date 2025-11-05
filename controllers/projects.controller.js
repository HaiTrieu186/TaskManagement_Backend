const model = require("../models/index.model");
const { Op, literal } = require("sequelize");
const paginationHelper=require("../helpers/pagination.helper")
const {  sort_values} = require("../helpers/find_check.helper");
const ExcelJS= require("exceljs")

module.exports.getProjects= async (req , res) => {
    try {   
        const id =req.user.id;
        const find={
            deleted:false
        }
        const sort=[];
        const includeObj={
            model: model.User,
            as: "ProjectMembers",
            attributes:[]
        }

        if (req.user.Role !== "admin") {
            includeObj.where = { id: req.user.id };
            includeObj.required = true; 
        } else {
            includeObj.required = false; 
        }

        // Lọc theo ngày tạo và kết thúc dự án
        if (req.query.start_from || req.query.end_to){
            find.End_date={}
            if (req.query.start_from)
                find.End_date[Op.gte]=new Date(req.query.start_from);
                
            if (req.query.end_to)
                find.End_date[Op.lte]=new Date(req.query.end_to);
        }
        
        // Tìm kiếm theo tên task
        if (req.query.search){
            find.Name={
                [Op.like]:`%${req.query.search}%`
            }
        }

        // Lọc theo manager_id
        if (req.query.manager_id)
            find.Manager_id=req.query.manager_id

        // Sắp xếp theo thuộc tính
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
        
        const JoinedProjects= await model.Project.findAll({
            where:find,
            include:[includeObj],
            attributes:["id"],
            distinct: true
        })

        if (!JoinedProjects || JoinedProjects.length===0)
            return res.status(404).json({
                success:false,
                message:"Không có dự án hợp lệ"
            })
        const listIdProject= JoinedProjects.map(project => project.id);

         // Làm phân trang pagination
        const totalProjects= listIdProject.length;
        const paginationObj= paginationHelper(req.query);
        const totalPage= Math.ceil(totalProjects/paginationObj.limit);
        
        
        const listFinalProjects= await model.Project.findAll({
            where:{
                id:{
                    [Op.in]:listIdProject
                }
            },
            attributes:["id", "Name", "Description", "Start_date", "End_date", "Manager_id", "created_at",
                    // 2. Cột 'total_tasks'
                    [
                        literal(`(
                            SELECT COUNT(*)
                            FROM tasks AS task
                            WHERE
                                task.project_id = Project.id AND task.deleted = false
                        )`),
                        'total_tasks'
                    ],
                    // 3. Cột 'completed_tasks'
                    [
                        literal(`(
                            SELECT COUNT(*)
                            FROM tasks AS task
                            WHERE
                                task.project_id = Project.id 
                                AND task.Status = 'finish' 
                                AND task.deleted = false
                        )`),
                        'completed_tasks'
                    ],
                    // 4.  Cột 'not_finish_tasks' (Không hoàn thành)
                    [
                        literal(`(
                            SELECT COUNT(*)
                            FROM tasks AS task
                            WHERE
                                task.project_id = Project.id 
                                AND task.Status = 'notFinish' 
                                AND task.deleted = false
                        )`),
                        'not_finish_tasks'
                    ],

                    // 5.  Cột 'in_progress_tasks' (initial/doing/pending)
                    [
                        literal(`(
                            SELECT COUNT(*)
                            FROM tasks AS task
                            WHERE
                                task.project_id = Project.id 
                                AND task.Status IN ('initial', 'doing', 'pending') 
                                AND task.deleted = false
                        )`),
                        'in_progress_tasks'
                    ]
            ],
            include:[
                {
                    model:model.User,
                    as:"ProjectMembers",
                    attributes:["id","FirstName","LastName"],
                    through:{
                        attributes:[]
                    }
                },
                {
                    model: model.User,
                    as: "ProjectManager", 
                    attributes: ["FirstName", "LastName"],
                    required: false // phòng trường hợp Manager_id là null
                }
            ],
            order:[...sort],
            offset:paginationObj.offset,
            limit: paginationObj.limit,
            distinct: true
        })

        return res.status(200).json({
            success:true,
            message:"Đã lấy thành công danh sách dự án",
            projects:listFinalProjects,
            pagination:{
                "totalPage": totalPage,
                "totalProjects": totalProjects,
                "currentPage": paginationObj.currentPage,
                "limit": paginationObj.limit
             }
        }) 
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy danh sách dự án",
            error:error.message
        })
    }
};