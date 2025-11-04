const express = require("express");
const router= express.Router();
const controllers= require("../controllers/tasks.controller");
const authMiddleware = require("../middleware/auth/auth.verifyToken.middleware")
const validateMiddleware= require("../middleware/task.validate.middleware");

router.use(authMiddleware.verifyToken);

router.get("/",controllers.getTasks);
router.get("/join",controllers.getJoinedTask);
router.get("/deadline-soon",controllers.deadlineSoon)
router.get("/overdue",controllers.overdue)
router.post("/create",validateMiddleware.validateCreateTask,controllers.create);


router.get("/:id",validateMiddleware.validateTaskId,controllers.getTask);
router.patch("/:id",validateMiddleware.validateTaskId,validateMiddleware.validateUpdateTask,controllers.update);
router.patch("/:id/status",validateMiddleware.validateTaskId,validateMiddleware.validateChangeStatus,controllers.changeStatus);
router.patch("/:id/add-member-to-task",validateMiddleware.validateTaskId,controllers.addMembersToTask);
router.delete("/:id",validateMiddleware.validateTaskId,controllers.delete);


module.exports = router;