const model = require("../models/index.model");
const { Op, literal, where } = require("sequelize");
const paginationHelper=require("../helpers/pagination.helper")
const {  sort_values} = require("../helpers/find_check.helper");
const ExcelJS= require("exceljs")

// [GET] /projects
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

// [GET] /projects/:id
module.exports.getProject= async (req , res) => {
    try {   
        const taskId =req.params.id;
        const userId= req.user.id;
        const find={
            deleted:false,
            id: taskId
        }

        const project= await model.Project.findOne({
            where:find,
            include:[
                {
                    model:model.User,
                    as:"ProjectMembers",
                    attributes:["id","FirstName","LastName","Email","avatar"],
                    through: {
                        attributes: ["role", "joined_at"]
                    }
                },
                {
                    model: model.User,
                    as: "ProjectManager",
                    attributes: ["FirstName", "LastName"],
                    required: false
                }
            ]
        })

        if (!project)
            return res.status(404).json({
                success:false,
                message:"Không có dự án hợp lệ"
            })

        if (req.user.Role !== "admin") {
            const isMember = project.ProjectMembers.some(member => member.id === userId);
            if (!isMember) {
                return res.status(403).json({ 
                    success: false,
                    message: "Bạn không có quyền truy cập dự án này"
                });
            }
        }    
      
        // Làm phẳng lại dữ liệu
        const projectJson = project.toJSON();
        if (projectJson.ProjectMembers && Array.isArray(projectJson.ProjectMembers)) {
            projectJson.ProjectMembers = projectJson.ProjectMembers.map(member => {
                // Gộp 'role' và 'joined_at' ra ngoài
                member.role = member.ProjectMember?.role;
                member.joined_at = member.ProjectMember?.joined_at;
                delete member.ProjectMember; // Xóa object lồng nhau
                return member;
            });
        }
        if (projectJson.ProjectManager) {
            projectJson.manager_name = `${projectJson.ProjectManager.FirstName} ${projectJson.ProjectManager.LastName}`;
            delete projectJson.ProjectManager; // Xóa object lồng nhau
        } else {
            projectJson.manager_name = "Không có";
        }



        return res.status(200).json({
            success:true,
            message:"Đã lấy thành công dự án",
            project:projectJson,
        }) 
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy dự án",
            error:error.message
        })
    }
};

// [DELETE] /projects/delete/:id
module.exports.delete = async (req , res) => {
    try {   
        const projectID =req.params.id;

        const project = await model.Project.findOne({
            where:{id:projectID, deleted:false},
        })

        if (!project)
            return res.status(404).json({
                success:false,
                message:"Không có dự án hợp lệ"
            })

        // Kiểm tra (chỉ lead và admin được xóa)
        if (req.user.Role!=="admin"){
             const isLead= project.Manager_id === req.user.id
             if (!isLead)
                return res.status(403).json({
                    success:false,
                    message:"Bạn không có quyền xóa dự án này"
                })
        }

        project.deleted=true;
        project.deleted_at= new Date();
        await project.save();
        
        return res.status(200).json({
            success:true,
            message:"Đã xóa dự án thành công !"
        }) 
        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy dự án",
            error:error.message
        })
    }
};

// [POST] /projects/create
module.exports.create = async (req, res) => {
    try {
        const data = req.body;
        const userId = req.user.id;

        const newProject = await model.Project.create({
            ...data,
            Manager_id: userId,
            deleted: false
        });

        //  thêm Manager (người tạo) vào bảng ProjectMember
        await newProject.addProjectMember(userId, {
            through: {
                role: 'lead', 
                joined_at: new Date()
            }
        });

        // Lấy lại project vừa tạo (kèm tên Manager) để trả về
        const project = await model.Project.findOne({
            where: { id: newProject.id },
            include: [{
                model: model.User,
                as: "ProjectManager",
                attributes: ["FirstName", "LastName"]
            }]
        });

        //  Làm phẳng
        const projectJson = project.toJSON();
        if (projectJson.ProjectManager) {
            projectJson.manager_name = `${projectJson.ProjectManager.FirstName} ${projectJson.ProjectManager.LastName}`;
            delete projectJson.ProjectManager;
        }

        return res.status(201).json({
            success: true,
            message: "Đã tạo dự án thành công",
            project: projectJson
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã có lỗi khi tạo dự án",
            error: error.message
        });
    }
};

// [PATCH] /projects/:id
module.exports.updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user.id;
        const dataToUpdate = req.body; 

        const project = await model.Project.findOne({
            where: { id: projectId, deleted: false }
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

       // Kiểm tra (chỉ lead và admin được sửa)
        if (req.user.Role!=="admin"){
             const isLead= project.Manager_id === userId
             if (!isLead)
                return res.status(403).json({
                    success:false,
                    message:"Bạn không có quyền cập nhật thông tin dự án này"
                })
        }

        // Cập nhật dữ liệu
        await project.update(dataToUpdate);

        // Lấy lại data (kèm tên Manager) để trả về
        const updatedProject = await model.Project.findOne({
            where: { id: project.id },
            include: [{
                model: model.User,
                as: "ProjectManager",
                attributes: ["FirstName", "LastName"]
            }]
        });
        
        //  Làm phẳng
        const projectJson = updatedProject.toJSON();
        if (projectJson.ProjectManager) {
            projectJson.manager_name = `${projectJson.ProjectManager.FirstName} ${projectJson.ProjectManager.LastName}`;
            delete projectJson.ProjectManager;
        }

        return res.status(200).json({
            success: true,
            message: "Cập nhật dự án thành công",
            project: projectJson
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Đã có lỗi khi cập nhật dự án",
            error: error.message
        });
    }
};

// [PATCH] /projects/:id/add-members
module.exports.addMembersToProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.user.id;
        const { members } = req.body; 

        const project = await model.Project.findOne({
            where: { id: projectId, deleted: false }
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy dự án"
            });
        }

        //  Check quyền (Chỉ Admin hoặc Lead/Manager)
        if (req.user.Role !== "admin") {
            const isManager = (project.Manager_id === userId);
            if (!isManager) {
                return res.status(403).json({
                    success: false,
                    message: "Bạn không có quyền thêm thành viên (Chỉ Manager/Lead mới được phép)"
                });
            }
        }
        
        const memberData = members.map(member => ({
            Project_id: projectId,
            Member_id: member.member_id,
            role: member.role,
            joined_at: new Date() 
        }));

        // 4. Thực hiện Upsert
        // - Tạo mới nếu (Project_id, Member_id) chưa tồn tại.
        // - Cập nhật (role) nếu (Project_id, Member_id) đã tồn tại.
        const promises = memberData.map(data => 
            model.ProjectMember.upsert(data)
        );
        
        await Promise.all(promises);

        return res.status(200).json({
            success: true,
            message: "Đã thêm/cập nhật thành viên vào dự án thành công"
        });

    } catch (error) {
        // Bắt lỗi  member_id không tồn tại (lỗi khóa ngoại)
         if (error.name === 'SequelizeForeignKeyConstraintError') {
             return res.status(404).json({
                success: false,
                message: "Một hoặc nhiều Member ID không tồn tại trong hệ thống (bảng Users).",
                error: error.message
            });
         }
        return res.status(500).json({
            success: false,
            message: "Đã có lỗi khi thêm thành viên",
            error: error.message
        });
    }
};


