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

module.exports.validateChangePassword = (req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const errors = [];

    if (!oldPassword) {
        errors.push({ field: 'oldPassword', message: 'Mật khẩu cũ không được để trống' });
    }
    
    // Check 'newPassword'
    if (!newPassword) {
        errors.push({ field: 'newPassword', message: 'Mật khẩu mới không được để trống' });
    } else if (newPassword.length < 6) {
        errors.push({ field: 'newPassword', message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    if (newPassword===oldPassword)
         errors.push({ field: 'newPassword', message: 'Mật khẩu mới không được trùng mật khẩu cũ' });

    // Check 'confirmPassword'
    if (newPassword !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Xác nhận mật khẩu không khớp' });
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

// [POST] /auth/forgot-password
module.exports.validateForgotPassword = (req, res, next) => {
    const { Email } = req.body;
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

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: errors
        });
    }
    next();
};

// [POST] /auth/verify-otp
module.exports.validateVerifyOTP = (req, res, next) => {
    const { otp } = req.body;

    if (!otp || otp.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Dữ liệu không hợp lệ',
            errors: [{ field: 'otp', message: 'Mã OTP không được để trống' }]
        });
    }
    next();
};

// [POST] /auth/reset-password
module.exports.validateResetPassword = (req, res, next) => {
    const { otp, newPassword, confirmPassword } = req.body;
    const errors = [];

    if (!otp || otp.trim() === '') {
        errors.push({ field: 'otp', message: 'Mã OTP không được để trống' });
    }

    // Check 'newPassword'
    if (!newPassword || newPassword === '') {
        errors.push({ field: 'newPassword', message: 'Mật khẩu mới không được để trống' });
    } else if (newPassword.length < 6) {
        errors.push({ field: 'newPassword', message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
    }

    // Thêm check confirmPassword
    if (newPassword !== confirmPassword) {
        errors.push({ field: 'confirmPassword', message: 'Xác nhận mật khẩu không khớp' });
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