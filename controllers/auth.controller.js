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

    const user = await User.findOne({ where: { Email } });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "Không tồn tại người dùng.",
      });

    // Tạo token làm OTP 
    const otp = jwt.sign(
      { id: user.id, Email: user.Email },
      process.env.OTP_SECRET_KEY,
      { expiresIn: "5m" }
    );

    user.OTP = otp;
    await user.save();

    //  Gửi otp qua email
    await transporter.sendMail({
      from: `"Tasks-Managerment APP Support" <${process.env.EMAIL_USER}>`,
      to: user.Email,
      subject: "Mã khôi phục mật khẩu của bạn",
      html: `
        <p>Xin chào ${user.FirstName + user.LastName || "bạn"},</p>
        <p>Mã đặt lại mật khẩu của bạn là:</p>
        <h3 style="color:blue;">${otp}</h3>
        <p>Mã này có hiệu lực trong 5 phút. Dán mã này vào ô “Mã khôi phục” trong app.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Mã khôi phục đã được gửi qua email.",
    });
  } catch (err) {
    return res.status(500).json({ 
        success: false, 
        message: "Lỗi khi gửi email", 
        error: err.message 
    });
  }
};

// [POST] /auth/verify-reset-token
module.exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp)
      return res.status(400).json({
        success: false,
        message: "Thiếu mã xác nhận để xác minh"
      });


    //  Verify otp
    let decoded;
    try {
      decoded = jwt.verify(otp, process.env.OTP_SECRET_KEY);
    } catch (err) {
      const msg =
        err.name === "TokenExpiredError"
          ? "Mã đã hết hạn, vui lòng yêu cầu lại"
          : "Mã không hợp lệ";
      return res.status(400).json({ success: false, message: msg });
    }

    //  Kiểm tra token có đúng không
    const user = await User.findOne({
      where: { id: decoded.id, OTP: otp },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "Mã không tồn tại hoặc đã được sử dụng",
      });

    return res.status(200).json({
      success: true,
      message: "Mã hợp lệ, bạn có thể tiếp tục",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xác minh OTP",
      error: err.message,
    });
  }
};

// [POST] /auth/reset-password
module.exports.resetPassword = async (req, res) => {
  try {
    const { otp, newPassword, confirmPassword } = req.body;
    if (!otp || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Thiếu token hoặc mật khẩu mới",
      });

    // Verify otp
    let decoded;
    try {
      decoded = jwt.verify(otp, process.env.OTP_SECRET_KEY);
    } catch (err) {
      const msg =
        err.name === "TokenExpiredError"
          ? "OTP đã hết hạn, vui lòng yêu cầu lại"
          : "OTP không hợp lệ";
      return res.status(400).json({ success: false, message: msg });
    }

    // Check OTP
    const user = await User.findOne({
      where: { id: decoded.id, OTP: otp },
    });

    if (!user)
      return res.status(400).json({
        success: false,
        message: "OTP không hợp lệ hoặc đã được sử dụng",
      });

    //  Cập nhật mật khẩu mới
    const hashed = await bcrypt.hash(newPassword, 10);
    user.Password = hashed;
    user.OTP = null; // xoá OTP
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công",
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

