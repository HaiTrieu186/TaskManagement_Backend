const express = require("express");
const router= express.Router();
const controllers= require("../controllers/tasks.controller");

router.get("/",controllers.index);
router.get("/:id",controllers.get);


module.exports = router;