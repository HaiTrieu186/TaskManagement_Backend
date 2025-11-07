const express= require("express");
const router= express.Router();
const controller= require("../controllers/auth.controller")
const validateMiddleware= require("../middleware/auth/auth.validate.middleware")
const authMiddleware =require("../middleware/auth/auth.verifyToken.middleware")

router.get("/me",authMiddleware.verifyToken,controller.me);
router.post("/login",validateMiddleware.validateLogin,controller.login);
router.post("/register",validateMiddleware.validateRegister,controller.register);
router.post("/logout", authMiddleware.verifyToken, controller.logout);
router.post("/change-password", authMiddleware.verifyToken, validateMiddleware.validateChangePassword,controller.changePassword);
router.post("/refresh",controller.refresh);


// 3 router dành riêng cho việc quên mật khẩu
router.post("/forgot-password", validateMiddleware.validateForgotPassword, controller.forgotPassword);
router.post("/verify-otp", validateMiddleware.validateVerifyOTP, controller.verifyOTP);
router.post("/reset-password", validateMiddleware.validateResetPassword, controller.resetPassword);

module.exports= router;