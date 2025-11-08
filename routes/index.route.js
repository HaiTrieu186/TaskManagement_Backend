const taskRoute= require("./tasks.route")
const authRoute= require("./auth.route")
const projectRoute =require("./projects.route")
const statsRoute= require("./stats.route")
const userRoute= require("./user.route")

module.exports =(app) => {
    app.use("/auth",authRoute);
    app.use("/tasks",taskRoute);
    app.use("/projects",projectRoute);
    app.use("/stats",statsRoute);
    app.use("/user",userRoute);
}