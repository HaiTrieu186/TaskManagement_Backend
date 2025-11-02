const express = require("express");
const router= express.Router();
const controllers= require("../controllers/tasks.controller");
const authMiddleware = require("../middleware/auth.middleware")

router.use(authMiddleware.verifyToken);
router.get("/",controllers.getTasks);
router.get("/join",controllers.getJoinedTask);
router.get("/:id",controllers.getTask);
router.post("/create",controllers.create);
router.patch("/:id",controllers.update);
router.patch("/:id/status",controllers.changeStatus);
router.delete("/:id",controllers.delete);


module.exports = router;