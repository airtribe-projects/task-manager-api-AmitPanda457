const express = require("express");
const {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskById,
  getTasksByPriority,
  updateTask,
} = require("../controller/taskController");

const route = express.Router();

route.get("/", getAllTasks);
route.get("/priority/:level", getTasksByPriority);
route.get("/:id", getTaskById);
route.post("/", createTask);
route.put("/:id", updateTask);
route.delete("/:id", deleteTask);

module.exports = route;
