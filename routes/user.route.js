const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const AuthMiddleware = require("../middleware/auth/auth.verify.middleware");
const validateMiddleware = require("../middleware/user.validate.middleware");

router.use(AuthMiddleware.verifyToken);


router.get("/lookup", AuthMiddleware.verifyToken,controller.lookup);
router.get("/profile", AuthMiddleware.verifyToken, controller.getProfie);
router.patch("/profile", AuthMiddleware.verifyToken, validateMiddleware.validateUpdateProfile,controller.updateProfie);



// Admin only
router.patch("/:id/role",
    AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin, 
    validateMiddleware.validateUserId, validateMiddleware.validateUpdateRole,
    controller.changeRole
)
router.get("/", AuthMiddleware.verifyToken, AuthMiddleware.verifyAdmin,controller.getAll);

module.exports = router;