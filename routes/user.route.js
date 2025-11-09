const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const AuthMiddleware = require("../middleware/auth/auth.verify.middleware");
const validateMiddleware = require("../middleware/user.validate.middleware");

router.use(AuthMiddleware.verifyToken);


router.get("/lookup",controller.lookup);
router.get("/profile", controller.getProfile);
router.patch("/profile", validateMiddleware.validateUpdateProfile,controller.updateProfile);



// Admin only
router.patch("/:id/role",
    AuthMiddleware.verifyAdmin, 
    validateMiddleware.validateUserId, validateMiddleware.validateUpdateRole,
    controller.changeRole
)
router.get("/",  AuthMiddleware.verifyAdmin,controller.getAll);

module.exports = router;