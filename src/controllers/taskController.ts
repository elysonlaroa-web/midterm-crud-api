// src/controllers/taskController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { Task } from "../entities/Task";
import { User } from "../entities/User";
import { Category } from "../entities/Category";
import { CreateTaskDto } from "../dto/CreateTaskDto";

const taskRepository = AppDataSource.getRepository(Task);
const userRepository = AppDataSource.getRepository(User);
const categoryRepository = AppDataSource.getRepository(Category);

export class TaskController {
  // GET /api/users/:userId/tasks - Get all tasks for a user

  // GET /api/users/:userId/tasks - Get tasks with filtering

  static async getUserTasks(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);
      const { status, priority, categoryId, page, limit, sortBy, order } =
        req.query;

      // Validate user ID
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ID",
            message: "User ID must be a positive number",
          },
        });
      }
      // Validate pagination
      const pageNumber = page === undefined ? 1 : Number(page);
      const limitNumber = limit === undefined ? 10 : Number(limit);

      if (
        (page !== undefined && typeof page !== "string") ||
        (limit !== undefined && typeof limit !== "string") ||
        !Number.isInteger(pageNumber) ||
        pageNumber <= 0 ||
        !Number.isInteger(limitNumber) ||
        limitNumber <= 0
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PAGINATION",
            message: "Page and limit must be positive integers",
          },
        });
      }
      // Validate sorting
      const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "title",
        "priority",
        "status",
      ];

      const sortField = sortBy === undefined ? "createdAt" : sortBy;

      const sortOrder =
        order === undefined ? "DESC" : order.toString().toUpperCase();

      if (
        typeof sortField !== "string" ||
        !allowedSortFields.includes(sortField) ||
        !["ASC", "DESC"].includes(sortOrder)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_SORT",
            message: "Invalid sorting field or order",
          },
        });
      }

      // Check if user exists
      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }

      // Validate status
      const validStatuses = ["pending", "in-progress", "completed"];

      if (
        status !== undefined &&
        (typeof status !== "string" || !validStatuses.includes(status))
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Invalid status filter",
          },
        });
      }

      // Validate priority
      const validPriorities = ["low", "medium", "high"];

      if (
        priority !== undefined &&
        (typeof priority !== "string" || !validPriorities.includes(priority))
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PRIORITY",
            message: "Invalid priority filter",
          },
        });
      }

      // Validate category ID
      let parsedCategoryId: number | undefined;

      if (categoryId !== undefined) {
        if (
          typeof categoryId !== "string" ||
          !Number.isInteger(Number(categoryId)) ||
          Number(categoryId) <= 0
        ) {
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_CATEGORY_ID",
              message: "Category ID must be a positive number",
            },
          });
        }

        parsedCategoryId = Number(categoryId);

        const category = await categoryRepository.findOne({
          where: { id: parsedCategoryId },
        });

        if (!category) {
          return res.status(404).json({
            success: false,
            error: {
              code: "CATEGORY_NOT_FOUND",
              message: "Category not found",
            },
          });
        }
      }

      // Build filters and exclude soft-deleted tasks
      const queryBuilder = taskRepository
        .createQueryBuilder("task")
        .where("task.userId = :userId", { userId })
        .andWhere("task.isDeleted = :isDeleted", { isDeleted: false });

      if (status) {
        queryBuilder.andWhere("task.status = :status", { status });
      }

      if (priority) {
        queryBuilder.andWhere("task.priority = :priority", { priority });
      }

      if (parsedCategoryId !== undefined) {
        queryBuilder.andWhere("task.categoryId = :categoryId", {
          categoryId: parsedCategoryId,
        });
      }

      const [tasks, total] = await queryBuilder
        .orderBy(`task.${sortField}`, sortOrder as "ASC" | "DESC")
        .skip((pageNumber - 1) * limitNumber)
        .take(limitNumber)
        .getManyAndCount();

      return res.json({
        success: true,
        data: tasks,
        meta: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber),
        },
        filters: {
          status: status || null,
          priority: priority || null,
          categoryId: parsedCategoryId || null,
        },
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);

      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch tasks",
        },
      });
    }
  }

  // POST /api/users/:userId/tasks - Create a task for a user

  static async createTask(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);

      const { title, description, status, priority, dueDate, categoryId } =
        req.body as CreateTaskDto;

      // Validate user ID
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ID",
            message: "User ID must be a positive number",
          },
        });
      }

      // Validate title
      if (
        typeof title !== "string" ||
        title.trim().length === 0 ||
        title.length > 200
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_TITLE",
            message: "Title is required and must not exceed 200 characters",
          },
        });
      }

      // Check if user exists
      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }

      // Validate status and priority
      const validStatuses = ["pending", "in-progress", "completed"];
      const validPriorities = ["low", "medium", "high"];

      if (status !== undefined && !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Invalid status value",
          },
        });
      }

      if (priority !== undefined && !validPriorities.includes(priority)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PRIORITY",
            message: "Invalid priority value",
          },
        });
      }

      // Find and validate category
      let category: Category | null = null;

      if (categoryId !== undefined && categoryId !== null) {
        const parsedCategoryId = Number(categoryId);

        if (!Number.isInteger(parsedCategoryId) || parsedCategoryId <= 0) {
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_CATEGORY_ID",
              message: "Category ID must be a positive number",
            },
          });
        }

        category = await categoryRepository.findOne({
          where: { id: parsedCategoryId },
        });

        if (!category) {
          return res.status(404).json({
            success: false,
            error: {
              code: "CATEGORY_NOT_FOUND",
              message: "Category not found",
            },
          });
        }
      }

      // Create task with category relationship
      const task = taskRepository.create({
        title: title.trim(),
        description,
        status: status || "pending",
        priority: priority || "medium",
        dueDate: dueDate || null,
        userId,
        category,
      });

      const savedTask = await taskRepository.save(task);

      return res.status(201).json({
        success: true,
        message: "Task created successfully",
        data: savedTask,
      });
    } catch (error) {
      console.error("Error creating task:", error);

      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create task",
        },
      });
    }
  }

  // DELETE /api/tasks/:id - Soft delete a task
  static async deleteTask(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Task ID must be a positive number",
          },
        });
      }

      const task = await taskRepository.findOne({
        where: { id, isDeleted: false },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          error: {
            code: "TASK_NOT_FOUND",
            message: "Task not found",
          },
        });
      }

      // Mark task as deleted instead of removing it
      task.isDeleted = true;
      await taskRepository.save(task);

      return res.status(200).json({
        success: true,
        message: "Task deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting task:", error);

      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete task",
        },
      });
    }
  }

  // GET /api/users/:userId/stats - Get task statistics
  static async getTaskStats(req: Request, res: Response) {
    try {
      const userId = Number(req.params.userId);

      // Validate user ID
      if (!Number.isInteger(userId) || userId <= 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ID",
            message: "User ID must be a positive number",
          },
        });
      }

      // Check if user exists
      const user = await userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User not found",
          },
        });
      }

      // Count tasks
      const [totalTasks, completedTasks, pendingTasks] = await Promise.all([
        taskRepository.count({
          where: { userId, isDeleted: false },
        }),
        taskRepository.count({
          where: { userId, status: "completed", isDeleted: false },
        }),
        taskRepository.count({
          where: { userId, status: "pending", isDeleted: false },
        }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalTasks,
          completedTasks,
          pendingTasks,
        },
      });
    } catch (error) {
      console.error("Error fetching task statistics:", error);

      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch task statistics",
        },
      });
    }
  }
}
;
