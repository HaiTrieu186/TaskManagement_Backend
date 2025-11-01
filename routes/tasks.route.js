const express = require("express");
const router= express.Router();
const controllers= require("../controllers/tasks.controller");
const authMiddleware = require("../middleware/auth.middleware")

router.use(authMiddleware.verifyToken);
router.get("/",controllers.index);
router.get("/:id",controllers.get);
router.post("/create",controllers.create);


module.exports = router;