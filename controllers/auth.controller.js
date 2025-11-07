const {User}=require("../models/index.model");
const bcrypt= require("bcryptjs")
const jwt= require("jsonwebtoken")
const model = require("../models/index.model")

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

        const user = await model.User.findOne({
            where:{refreshToken: refreshToken}
        });

        if (!user) return 
            res.status(403).json({
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