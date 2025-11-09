const taskRoute= require("./tasks.route")
const authRoute= require("./auth.route")
const projectRoute =require("./projects.route")
const statsRoute= require("./stats.route")
const userRoute= require("./user.route")

module.exports =(app) => {
    app.use("/api/auth",authRoute);
    app.use("/api/tasks",taskRoute);
    app.use("/api/projects",projectRoute);
    app.use("/api/stats",statsRoute);
    app.use("/api/users",userRoute);
}