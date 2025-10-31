const taskRoute= require("./tasks.route")
const registerRoute= require("./register.route")

module.exports =(app) => {
    app.use("/register/",registerRoute);
    app.use("/tasks",taskRoute);
}