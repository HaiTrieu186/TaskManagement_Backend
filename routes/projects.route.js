const express = require("express");
const router = express.Router();
const controller = require("../controllers/projects.controller");
const AuthMiddleware = require("../middleware/auth/auth.verifyToken.middleware");
const validateMiddleware = require("../middleware/project_validate.middleware");

router.use(AuthMiddleware.verifyToken);

router.get("/", controller.getProjects);
router.post("/create", validateMiddleware.validateCreate, controller.create);

router.get("/:id", validateMiddleware.validateProjectId, controller.getProject);
router.patch("/:id",validateMiddleware.validateProjectId,validateMiddleware.validateUpdate,controller.updateProject);
router.patch("/:id/add-members",validateMiddleware.validateProjectId, validateMiddleware.validateAddMembers,controller.addMembersToProject);
router.delete("/:id", validateMiddleware.validateProjectId, controller.delete);

module.exports = router;