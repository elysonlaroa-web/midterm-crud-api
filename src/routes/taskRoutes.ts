// src/routes/taskRoutes.ts
import { Router } from "express";
import { TaskController } from "../controllers/taskController";

export const taskRoutes = Router();

// Nested routes under users
taskRoutes.get("/users/:userId/tasks", TaskController.getUserTasks);
taskRoutes.post("/users/:userId/tasks", TaskController.createTask);

// User statistics route
taskRoutes.get("/users/:userId/stats", TaskController.getTaskStats);

// Direct task routes
taskRoutes.delete("/tasks/:id", TaskController.deleteTask);