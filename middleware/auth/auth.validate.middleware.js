module.exports.validateRegister = (req, res, next) => {
    const { FirstName, LastName, Email, Password } = req.body;
    const errors = [];

    // Kiểm tra FirstName
    if (!FirstName || FirstName.trim() === '') {
        errors.push({ field: 'FirstName', message: 'Họ không được để trống' });
    } else if (FirstName.trim().length < 2 || FirstName.trim().length > 100) {
        errors.push({ field: 'FirstName', message: 'Họ phải từ 2-100 ký tự' });
    }

    // Kiểm tra LastName
    if (!LastName || LastName.trim() === '') {
        errors.push({ field: 'LastName', message: 'Tên không được để trống' });
    } else if (LastName.trim().length < 2 || LastName.trim().length > 100) {
        errors.push({ field: 'LastName', message: 'Tên phải từ 2-100 ký tự' });
    }

    // Kiểm tra Email
    if (!Email || Email.trim() === '') {
        errors.push({ field: 'Email', message: 'Email không được để trống' });
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
            errors.push({ field: 'Email', message: 'Email không hợp lệ' });
        }
    }

    // Kiểm tra Password
    if (!Password || Password === '') {
        errors.push({ field: 'Password', message: 'Mật khẩu không được để trống' });
    } else if (Password.length < 6) {
        errors.push({ field: 'Password', message: 'Mật khẩu phải có ít nhất 6 ký tự' });
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

module.exports.validateLogin = (req, res, next) => {
    const { Email, Password } = req.body;
    const errors = [];

    // Kiểm tra Email
    if (!Email || Email.trim() === '') {
        errors.push({ field: 'Email', message: 'Email không được để trống' });
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(Email)) {
            errors.push({ field: 'Email', message: 'Email không hợp lệ' });
        }
    }

    // Kiểm tra Password
    if (!Password || Password === '') {
        errors.push({ field: 'Password', message: 'Mật khẩu không được để trống' });
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