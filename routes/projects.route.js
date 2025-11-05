const express = require("express");
const router= express.Router();
const controller= require("../controllers/projects.controller");
const AuthMiddleware= require("../middleware/auth/auth.verifyToken.middleware");

router.use(AuthMiddleware.verifyToken);
router.get("/",controller.getProjects);



module.exports = router;