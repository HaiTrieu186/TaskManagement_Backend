const express= require("express");
const router= express.Router();
const controller= require("../controllers/auth.controller")
const validateMiddleware= require("../middleware/auth/auth.validate.middleware")
const authMiddleware =require("../middleware/auth/auth.verifyToken.middleware")

router.get("/me",authMiddleware.verifyToken,controller.me);
router.post("/login",validateMiddleware.validateLogin,controller.login);
router.post("/register",validateMiddleware.validateRegister,controller.register);


module.exports= router;