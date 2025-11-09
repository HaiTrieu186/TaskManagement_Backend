const model= require("../models/index.model")


// [GET] /user/  (Admin)
module.exports.getAll=async (req, res) =>{
  try {

    const users = await model.User.findAll({
        where:{
            deleted:false,
        },
        attributes: {
            exclude: ["Password", "refreshToken", "OTP", "deleted", "deleted_at"],
      },
    })

    if (!users)
    return res.status(404).json({
        success:false,
        message:"Không tồn tại danh sách người dùng",
    })

    return res.status(200).json({
        success:true,
        message:"Lấy thông tin danh sách user hiện có thành công",
        data:users
    })

  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"Đã có lỗi khi lấy danh sách user hiện có",
        error:error.message
    })
  }
};

// [GET] /user/profile
module.exports.getProfile=async (req, res) =>{
  try {
    const id= req.user.id;

    const user = await model.User.findOne({
        where:{
        deleted:false,
        id:id,
        },
        attributes:["id","FirstName","LastName","Email","Role","avatar"]
    })

    if (!user)
    return res.status(404).json({
        success:false,
        message:"Không tồn tại người dùng",
    })

    return res.status(200).json({
        success:true,
        message:"Lấy thông tin user thành công",
        data:user
    })

  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"Đã có lỗi khi lấy dữ liệu profile",
        error:error.message
    })
  }
};

// [PATCH] /user/profile
module.exports.updateProfile=async (req, res) =>{
  try {
    const id= req.user.id;
    const {FirstName, LastName, avatar} = req.body;

    const user = await model.User.findOne({
        where:{
            deleted:false,
            id:id,
        }
    })

    if (!user)
    return res.status(404).json({
        success:false,
        message:"Không tồn tại người dùng",
    })

    if (FirstName!== undefined) user.FirstName=FirstName;
    if (LastName!== undefined) user.LastName=LastName;
    if (avatar!== undefined) user.avatar=avatar;

    await user.save();

    return res.status(200).json({
        success:true,
        message:"Sửa đổi user thành công",
    })

  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"Đã có lỗi khi thay đổi thông tin profile",
        error:error.message
    })
  }
};

// [GET] /user/lookup
module.exports.lookup=async (req, res) =>{
  try {

    const users = await model.User.findAll({
        where:{
            deleted:false,
        },
        attributes:["id","FirstName","LastName","avatar"],
        order: [
          ["LastName", "ASC"],
          ["FirstName", "ASC"]
      ]
    })

    if (!users)
    return res.status(404).json({
        success:false,
        message:"Không tồn tại danh sách người dùng",
    })

    return res.status(200).json({
        success:true,
        message:"Lấy thông tin thành công",
        data:users
    })

  } catch (error) {
    return res.status(500).json({
        success:false,
        message:"Đã có lỗi khi lấy danh sách lookup",
        error:error.message
    })
  }
};

// [PATCH] /user/:id/role
module.exports.changeRole= async (req, res) => { 
    try {
        const id= req.params.id;
        const { Role } = req.body;

        if (id ===req.user.id)
        return res.status(400).json({
            success: false,
            message: 'Không thể sửa role bản thân'
        });

        const user = await model.User.findOne({
            where:{
                deleted:false,
                id:id
            }
        })

        if (!user)
            return res.status(404).json({
                success:false,
                message:"Không tồn tại người dùng",
            })

        user.Role=Role;
        await user.save();

        return res.status(200).json({
            success:true,
            message:"Cập nhật role thành công !"
        })
            
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Đã có lỗi khi lấy danh sách lookup",
            error:error.message
        })
    }
};
