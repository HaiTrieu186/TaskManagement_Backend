const taskRoute= require("./tasks.route")
const authRoute= require("./auth.route")

module.exports =(app) => {
    app.use("/auth",authRoute);
    app.use("/tasks",taskRoute);
}