const jwt= require("jsonwebtoken")

module.exports.verifyToken = (req,res, next )=> {
    
    try {
        const token = req.header("Authorization") && req.header("Authorization").replace("Bearer ","");

        if (!token)
            return res.status(401).json({
                message:"Vui lòng đăng nhập để có token"
            })
       
       try {
            const data= jwt.verify(token,process.env.JWT_SECRET_KEY);
            req.user=data;
       } catch (error) {
            //console.log(" lỗi verify token:", error.message);
            //console.log(" Full error:", error); // Xem chi tiết
            return res.status(401).json({
                message:"Token không hợp lệ",
                error:error.message
            });
       }     
       
       
       next();

    } catch (error) {
        return res.status(500).json({
            message:"Đã có lỗi xảy ra khi xác thực token",
            error:error.message
        });   
    }
}