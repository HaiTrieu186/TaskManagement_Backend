const {User}=require("../models/index.model");

module.exports.index= async (req,res)=>{
    const FirstName= req.body.FirstName;
    const LastName=req.body.LastName;
    const Email=req.body.Email;
    const Password=req.body.Password;

    const currentUser=await User.findOne({
        where:{Email:Email}
    })

    if (currentUser){
        return res.status(400).json({
            message:"Đã tồn tại tài khoản"
        })
    }

    try {
        const newUser= await User.create({
        FirstName: FirstName,
        LastName: LastName,
        Email: Email,
        Password: Password,
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