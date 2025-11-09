

module.exports.validateUpdateProfile = (req, res, next) => {
    const { FirstName, LastName, avatar } = req.body;
    const errors = [];
 
    if (FirstName === undefined && LastName === undefined && avatar === undefined) {
         return res.status(400).json({
            success: false,
            message: 'Không có dữ liệu nào để cập nhật'
        });
    }

    if (FirstName !== undefined) {
        if (FirstName.trim() === '') {
             errors.push({ field: 'FirstName', message: 'Họ không được để trống' });
        } else if (FirstName.trim().length < 2 || FirstName.trim().length > 100) {
            errors.push({ field: 'FirstName', message: 'Họ phải từ 2-100 ký tự' });
        }
    }
   
    if (LastName !== undefined) {
        if (LastName.trim() === '') {
             errors.push({ field: 'LastName', message: 'Tên không được để trống' });
        } else if (LastName.trim().length < 2 || LastName.trim().length > 100) {
            errors.push({ field: 'LastName', message: 'Tên phải từ 2-100 ký tự' });
        }
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

module.exports.validateUpdateRole = (req, res, next) => {
    const { Role } = req.body;
    const { id } = req.params;
    const errors = [];

    // Validate ID 
    if (!id || isNaN(id) || parseInt(id) < 1) {
        return res.status(400).json({
            success: false,
            message: 'ID user không hợp lệ'
        });
    }
    
    //  Validate Role 
    if (!Role) {
        errors.push({ field: 'Role', message: 'Quyền (Role) không được để trống' });
    } else if (Role !== 'admin' && Role !== 'user') {
         errors.push({ field: 'Role', message: 'Quyền (Role) chỉ có thể là "admin" hoặc "user"' });
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

module.exports.validateUserId = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || isNaN(id) || parseInt(id) < 1) {
        return res.status(400).json({
            success: false,
            message: 'ID user không hợp lệ'
        });
    }
    next();
};