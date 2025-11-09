const express= require("express");
const router= express.Router();
const controller= require("../controllers/stats.controller")
const authMiddleware =require("../middleware/auth/auth.verify.middleware")

router.use(authMiddleware.verifyToken);

router.get("/overview",controller.overview);
router.get("/progress-chart",controller.progressChart);
router.get("/task-status",controller.taskStatus);
router.get("/project-summary",controller.projectSummary);
router.get("/user-performance", authMiddleware.verifyAdmin,controller.userPerformance);

module.exports= router;