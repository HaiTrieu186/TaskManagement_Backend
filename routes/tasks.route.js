const express = require("express");
const router= express.Router();
const controllers= require("../controllers/tasks.controller");

router.get("/",controllers.index);



module.exports = router;