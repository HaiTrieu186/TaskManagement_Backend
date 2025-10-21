const taskRoute= require("./tasks.route")

module.exports =(app) => {
    app.use("/tasks",taskRoute);
}