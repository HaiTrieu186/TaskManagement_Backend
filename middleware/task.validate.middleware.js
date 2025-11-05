const { status_values , priority_values} = require("../helpers/find_check.helper")


module.exports.validateCreateTask = (req, res, next) => {
    const { TaskName, Status, Priority, Start_date, End_date } = req.body;
    const errors = [];

    // Kiểm tra TaskName
    if (!TaskName || TaskName.trim() === '') {
        errors.push({ field: 'TaskName', message: 'Tên task không được để trống' });
    } else if (TaskName.trim().length < 3) {
        errors.push({ field: 'TaskName', message: 'Tên task phải có ít nhất 3 ký tự' });
    }

    // Kiểm tra Status
    if (!Status) {
        errors.push({ field: 'Status', message: 'Trạng thái không được để trống' });
    } else if (!status_values.includes(Status)) {
        errors.push({ field: 'Status', message: 'Trạng thái không hợp lệ' });
    }

    // Kiểm tra Priority
    if (!Priority) {
        errors.push({ field: 'Priority', message: 'Độ ưu tiên không được để trống' });
    } else if (!priority_values.includes(Priority)) {
        errors.push({ field: 'Priority', message: 'Độ ưu tiên không hợp lệ' });
    }

    // Kiểm tra Start_date và End_date
    if (Start_date && End_date) {
        const startDate = new Date(Start_date);
        const endDate = new Date(End_date);
        
        if (isNaN(startDate.getTime())) {
            errors.push({ field: 'Start_date', message: 'Ngày bắt đầu không hợp lệ' });
        }
        if (isNaN(endDate.getTime())) {
            errors.push({ field: 'End_date', message: 'Ngày kết thúc không hợp lệ' });
        }
        
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
            errors.push({ field: 'End_date', message: 'Ngày bắt đầu phải trước ngày kết thúc' });
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

// Validate Update Task
module.exports.validateUpdateTask = (req, res, next) => {
    const { TaskName, Status, Priority, Start_date, End_date } = req.body;
    const errors = [];

    // Kiểm tra TaskName (nếu có)
    if (TaskName !== undefined) {
        if (TaskName.trim() === '') {
            errors.push({ field: 'TaskName', message: 'Tên task không được để trống' });
        } else if (TaskName.trim().length < 3) {
            errors.push({ field: 'TaskName', message: 'Tên task phải có ít nhất 3 ký tự' });
        }
    }

    // Kiểm tra Status (nếu có)
    if (Status !== undefined) {
        if (!status_values.includes(Status)) {
            errors.push({ field: 'Status', message: 'Trạng thái không hợp lệ' });
        }
    }

    // Kiểm tra Priority (nếu có)
    if (Priority !== undefined) {
        if (!priority_values.includes(Priority)) {
            errors.push({ field: 'Priority', message: 'Độ ưu tiên không hợp lệ' });
        }
    }

    // Kiểm tra Start_date và End_date
    if (Start_date && End_date) {
        const startDate = new Date(Start_date);
        const endDate = new Date(End_date);
        
        if (isNaN(startDate.getTime())) {
            errors.push({ field: 'Start_date', message: 'Ngày bắt đầu không hợp lệ' });
        }
        if (isNaN(endDate.getTime())) {
            errors.push({ field: 'End_date', message: 'Ngày kết thúc không hợp lệ' });
        }
        
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate > endDate) {
            errors.push({ field: 'End_date', message: 'Ngày bắt đầu phải trước ngày kết thúc' });
        }
    }

    // Nếu có lỗi thì trả về
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors
        });
    }

    next();
};

// Validate Change Status
module.exports.validateChangeStatus = (req, res, next) => {
    const { Status } = req.body;
    const errors = [];

    // Kiểm tra Status
    if (!Status) {
        errors.push({ field: 'Status', message: 'Trạng thái không được để trống' });
    } else if (!status_values.includes(Status)) {
        errors.push({ field: 'Status', message: 'Trạng thái không hợp lệ' });
    }

    // Nếu có lỗi thì trả về
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors
        });
    }

    next();
};

// Validate Task ID
module.exports.validateTaskId = (req, res, next) => {
    const { id } = req.params;
    
    if (!id || isNaN(id) || parseInt(id) < 1) {
        return res.status(400).json({
            success: false,
            message: 'ID task không hợp lệ'
        });
    }

    next();
};