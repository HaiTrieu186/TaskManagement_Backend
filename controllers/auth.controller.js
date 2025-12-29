const {User}=require("../models/index.model");
const bcrypt= require("bcryptjs")
const jwt= require("jsonwebtoken")
const model = require("../models/index.model")
const transporter = require("../config/mail");

// [POST] /auth/register
module.exports.register= async (req,res)=>{
    try {
        const { FirstName, LastName, Email, Password } = req.body;
        const currentUser=await User.findOne({
            where:{Email:Email}
        })

        if (currentUser){
            return res.status(401).json({
                success:false,
                message:"Đã tồn tại tài khoản"
            })
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(Password, saltRounds);

        const newUser= await User.create({
            FirstName: FirstName,
            LastName: LastName,
            Email: Email,
            Password: hashedPassword,
        })

        console.log(newUser);
        return res.status(201).json({
            success:true,
            message:"Đăng ký thành công",
            user: {
                id: newUser.id,
                FirstName: newUser.FirstName,
                LastName: newUser.LastName,
                Email: newUser.Email
            }
        });

    } catch (err) {
        return res.status(500).json({
            success:false,
            message:"Tạo tài khoản thất bại",
            error:err.message
        })
        
    }
    
}

// [POST] /auth/login
module.exports.login= async (req,res)=>{
try {
    const {Email, Password}= req.body;

    const user= await User.findOne({
        where:{ Email: Email}
    })

    // Kiểm tra email trước
    if (!user) 
        return res.status(401).json({
            success:false,
            message:"Tài khoản không tồn tại !"
        })
    

    // Kiểm tra mật khẩu sau
    const isValidPassword = await bcrypt.compare(Password, user.Password);
    if (!isValidPassword)
        return res.status(401).json({
            success:false,
            message:"Mật khẩu không chính xác !"
        })
    

    const token = jwt.sign({ 
        id:user.id ,
        Email: user.Email,
        Role: user.Role
    },process.env.JWT_SECRET_KEY,{ expiresIn: '15m' })

    const refreshToken = jwt.sign({
       id: user.id 
    }, process.env.REFRESH_TOKEN_SECRET_KEY,{expiresIn: "15d"})

    // lưu vào Database
    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
        success:true,
        message:"Đăng nhập thành công",
        token: token,
        refreshToken: refreshToken
    })

} catch (err) {
    return res.status(500).json({
        success:false,
        message:"Đã có lỗi trong quá trình đăng nhập",
        error:err.message
    })
    
}
    
}

// [POST] /auth/logout
module.exports.logout= async (req,res) =>{
    try {
        const id= req.user.id;

        const user = await model.User.findByPk(id);

        if (user) {
            user.refreshToken=null;
            await user.save();

            return res.status(200).json({
                success:true,
                message:"Đăng xuất thành công"
            })
        } 

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi trong lúc đăng xuất",
            error:error.message
        })
    }
}

// [POST] /auth/refresh
module.exports.refresh= async (req,res) =>{
    try {
        const {refreshToken} = req.body;

        if (!refreshToken) 
            return res.status(401).json({
                success:false,
                message: "Refresh Token là bắt buộc" 
        });

        console.log(refreshToken);
        
        const user = await model.User.findOne({
            where:{refreshToken: refreshToken}
        });

        if (!user) 
            return res.status(403).json({
                success:false, 
                message: "Refresh Token không hợp lệ" 
            });

        jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET_KEY,(err, decoded) => {
        
            if (err || user.id !== decoded.id) {
                return res.status(403).json({ message: "Refresh Token không hợp lệ hoặc hết hạn" });
            }

            const newAccessToken = jwt.sign(
                { id: user.id, Email: user.Email, Role: user.Role },
                process.env.JWT_SECRET_KEY, 
                { expiresIn: '15m' });

            return res.status(200).json({
                success:true, 
                accessToken: newAccessToken 
            });
        })


        
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi trong lúc refresh token",
            error:error.message
        })
    }
}

// [POST] /auth/change-password 
module.exports.changePassword= async (req,res) =>{
    try {
        const {oldPassword, newPassword, confirmPassword} = req.body;
        
        const user= await  model.User.findOne({
            where:{id: req.user.id}
        })

        if (!user)
            return res.status(404).json({ 
            success: false, 
            message: "Không tìm thấy người dùng" 
        });

        const isValidPassword = await bcrypt.compare(oldPassword, user.Password);
        if (!isValidPassword)
        return res.status(401).json({
            success:false,
            message:"Mật khẩu hiện tại không chính xác !"
        })
        
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.Password=hashedPassword;
        await user.save();

        return res.status(200).json({
            success:true, 
            message:"Đổi mật khẩu thành công"
        });
    
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi trong lúc đổi mật khẩu",
            error:error.message
        })
    }
}

// [GET] /auth/me
module.exports.me= async (req,res) =>{
    try {
        const id = req.user.id;

        if (!id)
            return res.status(404).json({
                success:false,
                message:"Không tìm thấy user hợp lệ"
            })
        
        const User = await model.User.findOne({
            where:{id: id},
            attributes:["id","FirstName","LastName","Email","Role","avatar"]
        })

        return res.status(200).json({
                success:true,
                message:"Lấy thông tin user thành công",
                data:User
        })

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy thông tin người dùng",
            error:error.message
        })
    }

}



////////////////////-- QUÊN MẬT KHẨU --//////////////////////

// [POST] /auth/forgot-password
module.exports.forgotPassword = async (req, res) => {
  try {
    const { Email } = req.body;

    // Check user
    const user = await User.findOne({ where: { Email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email không tồn tại trong hệ thống.",
      });
    }

    // Tạo mã OTP ngẫu nhiên (6 chữ số)
    const otpRaw = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = 10;
    const hashedOTP = await bcrypt.hash(otpRaw, salt);

    // Lưu OTP đã hash và Thời gian hết hạn (5 phút = 300000ms)
    user.OTP = hashedOTP; 
    user.OTP_expires = Date.now() + 5 * 60 * 1000; 
    await user.save();

    // Gửi email chứa mã số (mã chưa hash)
    await transporter.sendMail({
      from: `"Task Management App" <${process.env.EMAIL_USER}>`,
      to: user.Email,
      subject: "Mã OTP khôi phục mật khẩu",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <p>Xin chào <b>${user.FirstName} ${user.LastName}</b>,</p>
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Mã xác thực của bạn là:</p>
            <h2 style="color: #007bff; letter-spacing: 5px;">${otpRaw}</h2>
            <p><i>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho ai khác.</i></p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Mã OTP đã được gửi đến email của bạn.",
    });

  } catch (err) {
    return res.status(500).json({ 
        success: false, 
        message: "Lỗi hệ thống khi gửi email", 
        error: err.message 
    });
  }
};

// [POST] /auth/verify-otp
module.exports.verifyOTP = async (req, res) => {
  try {
    const { Email, otp } = req.body; 

    const user = await User.findOne({ where: { Email } });
    if (!user) {
        return res.status(404).json({ success: false, message: "User không tồn tại" });
    }

    // Kiểm tra xem có OTP trong DB không
    if (!user.OTP || !user.OTP_expires) {
        return res.status(400).json({ success: false, message: "Vui lòng gửi yêu cầu lấy mã OTP trước" });
    }

    // Kiểm tra thời gian hết hạn 
    if (new Date() > user.OTP_expires) {
         return res.status(400).json({ success: false, message: "Mã OTP đã hết hạn. Vui lòng lấy mã mới." });
    }

    // Xác thực otp
    const isValidOTP = await bcrypt.compare(otp, user.OTP);
    
    if (!isValidOTP) {
        return res.status(400).json({ success: false, message: "Mã OTP không chính xác" });
    }

    return res.status(200).json({
      success: true,
      message: "Xác thực OTP thành công",
    });

  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// [POST] /auth/reset-password
module.exports.resetPassword = async (req, res) => {
  try {
    const { Email, otp, newPassword } = req.body;
    
    const user = await User.findOne({ where: { Email } });
    if (!user) return res.status(404).json({ success: false, message: "User không tồn tại" });

    // Validate lại OTP 
    if (!user.OTP || new Date() > user.OTP_expires) {
         return res.status(400).json({ success: false, message: "OTP đã hết hạn hoặc không hợp lệ" });
    }
    
    const isValidOTP = await bcrypt.compare(otp, user.OTP);
    if (!isValidOTP) {
        return res.status(400).json({ success: false, message: "Mã OTP không chính xác" });
    }

    // Đổi mật khẩu
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.Password = hashedPassword;
    
    // Xóa OTp
    user.OTP = null;
    user.OTP_expires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi khi đặt lại mật khẩu",
      error: err.message,
    });
  }
};

/////////////////////////////////////////////////////////////

