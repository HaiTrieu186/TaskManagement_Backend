const taskRoute= require("./tasks.route")
const authRoute= require("./auth.route")
const projectRoute =require("./projects.route")

module.exports =(app) => {
    app.use("/auth",authRoute);
    app.use("/tasks",taskRoute);
    app.use("/projects",projectRoute);
}