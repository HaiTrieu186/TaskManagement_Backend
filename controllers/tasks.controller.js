const User= require("../models/user.model");

module.exports.index = async (req, res) =>{
    const users= await User.findAll({
        where:{
            id:1
        },
        raw: true,
    });
    console.log(users);

    res.json(users);
    
}