const {User}=require("../models/index.model");
const bcrypt= require("bcryptjs")
const jwt= require("jsonwebtoken")
const model = require("../models/index.model")

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
    },process.env.JWT_SECRET_KEY,{ expiresIn: '1h' })

    return res.status(200).json({
        success:true,
        message:"Đăng nhập thành công",
        token: token
    })

} catch (err) {
    return res.status(500).json({
        success:false,
        message:"Đã có lỗi trong quá trình đăng nhập",
        error:err.message
    })
    
}
    
}

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