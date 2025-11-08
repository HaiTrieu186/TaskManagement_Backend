const express = require("express");
const router= express.Router();
const controllers= require("../controllers/tasks.controller");
const authMiddleware = require("../middleware/auth/auth.verify.middleware")
const validateMiddleware= require("../middleware/task.validate.middleware");

router.use(authMiddleware.verifyToken);

router.get("/",controllers.getTasks);
router.get("/deadline-soon",controllers.deadlineSoon);
router.get("/overdue",controllers.overdue);
router.get("/export",controllers.export);
router.post("/create",validateMiddleware.validateCreateTask,controllers.create);


router.get("/:id",validateMiddleware.validateTaskId,controllers.getTask);
router.get("/:id/members",validateMiddleware.validateTaskId,controllers.getTaskMembers);
router.patch("/:id",validateMiddleware.validateTaskId,validateMiddleware.validateUpdateTask,controllers.update);
router.patch("/:id/status",validateMiddleware.validateTaskId,validateMiddleware.validateChangeStatus,controllers.changeStatus);
router.patch("/:id/add-members",validateMiddleware.validateTaskId,controllers.addMembersToTask);
router.patch("/:id/remove-members",validateMiddleware.validateTaskId,controllers.removeMembersFromTask);
router.delete("/:id",validateMiddleware.validateTaskId,controllers.delete);



module.exports = router;