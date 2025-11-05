
// Validate Project ID
module.exports.validateProjectId = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || isNaN(id) || parseInt(id) < 1) {
        return res.status(400).json({
            success: false,
            message: 'ID Project không hợp lệ'
        });
    }

    next();
};

// Validate khi tạo project
module.exports.validateCreate = (req, res, next) => {
    const { Name } = req.body;
    const errors = [];

    if (!Name || Name.trim() === '') {
        errors.push({ field: 'Name', message: 'Tên dự án không được để trống' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors
        });
    }
    
    next();
};


// Validate cập nhật (PATCH)
module.exports.validateUpdate = (req, res, next) => {
    const { Name, Start_date, End_date } = req.body;
    const errors = [];

    // Check tên project
    if (Name !== undefined && Name.trim() === '') {
         errors.push({ field: 'Name', message: 'Tên dự án không được để trống' });
    }

    // Check ngày hợp lệ 
    if (Start_date && isNaN(Date.parse(Start_date))) {
        errors.push({ field: 'Start_date', message: 'Ngày bắt đầu không hợp lệ' });
    }
    if (End_date && isNaN(Date.parse(End_date))) {
        errors.push({ field: 'End_date', message: 'Ngày kết thúc không hợp lệ' });
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors
        });
    }
    
    next();
};

// Validate khi thêm thành viên vào projects
module.exports.validateAddMembers = (req, res, next) => {
    const { members } = req.body;
    
    if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({
            success: false,
            message: "Trường 'members' là bắt buộc và phải là một mảng không rỗng."
        });
    }

    // Các vai trò hợp lệ (dựa trên model của bạn)
    const validRoles = ['member', 'lead', 'viewer'];

    for (const member of members) {
        if (!member.member_id || isNaN(member.member_id) || !member.role) {
             return res.status(400).json({
                success: false,
                message: "Mỗi thành viên phải có 'member_id' (là số) và 'role'."
            });
        }
        if (!validRoles.includes(member.role)) {
             return res.status(400).json({
                success: false,
                message: `Role '${member.role}' không hợp lệ. Chỉ chấp nhận: 'member', 'lead', 'viewer'.`
            });
        }
    }

    next();
};