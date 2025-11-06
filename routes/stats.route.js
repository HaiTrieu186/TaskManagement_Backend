const express= require("express");
const router= express.Router();
const controller= require("../controllers/stats.controller")
const authMiddleware =require("../middleware/auth/auth.verifyToken.middleware")

router.get("/overview",authMiddleware.verifyToken,controller.overview);
router.get("/progress-chart",authMiddleware.verifyToken,controller.progressChart);
router.get("/task-status",authMiddleware.verifyToken,controller.taskStatus);
router.get("/project-summary",authMiddleware.verifyToken,controller.projectSummary);
module.exports= router;