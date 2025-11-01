const {User}=require("../models/index.model");
const bcrypt= require("bcryptjs")
const jwt= require("jsonwebtoken")

module.exports.register= async (req,res)=>{
    try {
        const { FirstName, LastName, Email, Password } = req.body;
        const currentUser=await User.findOne({
            where:{Email:Email}
        })

        if (currentUser){
            return res.status(401).json({
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
        return res.status(201).json(newUser.toJSON());

    } catch (err) {
        return res.status(500).json({
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
            message:"Tài khoản không tồn tại !"
        })
    

    // Kiểm tra mật khẩu sau
    const isValidPassword = await bcrypt.compare(Password, user.Password);
    if (!isValidPassword)
        return res.status(401).json({
            message:"Mật khẩu không chính xác !"
        })
    

    const token = jwt.sign({ 
        id:user.id ,
        Email: user.Email
    },process.env.JWT_SECRET_KEY,{ expiresIn: '1h' })

    return res.status(200).json({
        message:"Đăng nhập thành công",
        token: token
    })

} catch (err) {
    return res.status(500).json({
        message:"Đã có lỗi trong quá trình đăng nhập",
        error:err.message
    })
    
}
    
}