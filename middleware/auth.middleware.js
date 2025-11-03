const jwt= require("jsonwebtoken")
const model=require("../models/index.model")

module.exports.verifyToken = async  (req,res, next )=> {
    
    try {
        const token = req.header("Authorization") && req.header("Authorization").replace("Bearer ","");

        if (!token)
            return res.status(401).json({
                success:false,
                message:"Vui lòng đăng nhập "
            })
       
       try {
            const data= jwt.verify(token,process.env.JWT_SECRET_KEY);
            req.user=data;

            const user = await model.User.findOne({
                where:{id: data.id}
            })

            if (!user)
                return res.status(403).json({
                    success:false,
                    message:"User khong hop le!"
            })
       } catch (error) {
            //console.log(" lỗi verify token:", error.message);
            //console.log(" Full error:", error); // Xem chi tiết
            return res.status(401).json({
                success:false,
                message:"Token không hợp lệ",
                error:error.message
            });
       }     
       
       
       next();

    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi xảy ra khi xác thực token",
            error:error.message
        });   
    }
}