// src/controllers/userController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from "bcrypt";
import { CreateUserDto } from "../dto/CreateUserDto";
import { UpdateUserDto } from "../dto/UpdateUserDto";
import { Task } from "../entities/Task";
import { Category } from "../entities/Category";

const userRepository = AppDataSource.getRepository(User);

// Sanitize HTML tags from input
function sanitizeInput(value: string): string {
  return value.replace(/<[^>]*>/g, "").trim();
}

// Validate optional phone number
function validatePhoneNumber(value: unknown): {
  valid: boolean;
  value: string | null;
} {
  // Phone number is optional
  if (value === undefined || value === null || value === "") {
    return { valid: true, value: null };
  }

  // Must be a string
  if (typeof value !== "string") {
    return { valid: false, value: null };
  }

  const phoneNumber = value.trim();

  // Empty input is treated as no phone number
  if (phoneNumber === "") {
    return { valid: true, value: null };
  }

  // Database column supports up to 20 characters
  if (phoneNumber.length > 20) {
    return { valid: false, value: null };
  }

  // Remove common formatting characters for validation
  const normalized = phoneNumber.replace(/[()\s.-]/g, "");

  // Allow optional + followed by 7–15 digits
  const phoneRegex = /^\+?\d{7,15}$/;

  if (!phoneRegex.test(normalized)) {
    return { valid: false, value: null };
  }

  return { valid: true, value: phoneNumber };
}

class TransactionRequestError extends Error {
  constructor(
    public statusCode: number,
    public errorCode: string,
    message: string,
  ) {
    super(message);
    this.name = "TransactionRequestError";
  }
}

export class UserController {
  // GET /api/users – Get all users[cite: 12]
  static async getAll(req: Request, res: Response) {
    try {
      const users = await userRepository.find({
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch users",
        },
      });
    }
  }

  // GET /api/users/:id – Get user by ID[cite: 12]
  static async getById(req: Request, res: Response) {
    try {
      const idParam = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const id = parseInt(idParam, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ID",
            message: "User ID must be a number",
          },
        });
      }

      const user = await userRepository.findOne({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User with ID ${id} does not exist",
          },
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch user",
        },
      });
    }
  }

  // POST /api/users/with-initial-task
  static async createWithInitialTask(req: Request, res: Response) {
    try {
      const body = req.body as {
        name?: string;
        email?: string;
        password?: string;
        phoneNumber?: string;
        task?: {
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          dueDate?: string | null;
          categoryId?: number;
        };
      };

      const { name, email, password, phoneNumber } = body;
      const taskInput = body.task;

      // Validate required user fields
      if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof email !== "string" ||
        !email.trim() ||
        typeof password !== "string" ||
        !password ||
        !taskInput ||
        typeof taskInput.title !== "string" ||
        !taskInput.title.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "Name, email, password, and task title are required",
          },
        });
      }

      // Validate phone number
      const phoneValidation = validatePhoneNumber(phoneNumber);

      if (!phoneValidation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PHONE_NUMBER",
            message: "Invalid phone number",
          },
        });
      }

      // Validate task title length
      if (taskInput.title.trim().length > 200) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_TITLE",
            message: "Task title must not exceed 200 characters",
          },
        });
      }

      // Validate task description
      if (
        taskInput.description !== undefined &&
        taskInput.description !== null &&
        typeof taskInput.description !== "string"
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_DESCRIPTION",
            message: "Task description must be a string",
          },
        });
      }

      // Validate status and priority
      const allowedStatuses = ["pending", "in-progress", "completed"];
      const allowedPriorities = ["low", "medium", "high"];

      if (
        taskInput.status !== undefined &&
        !allowedStatuses.includes(taskInput.status)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Invalid task status",
          },
        });
      }

      if (
        taskInput.priority !== undefined &&
        !allowedPriorities.includes(taskInput.priority)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PRIORITY",
            message: "Invalid task priority",
          },
        });
      }

      // Validate due date
      let dueDate: Date | null = null;

      if (taskInput.dueDate) {
        dueDate = new Date(taskInput.dueDate);

        if (isNaN(dueDate.getTime())) {
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_DUE_DATE",
              message: "Invalid task due date",
            },
          });
        }
      }

      // Validate optional category ID
      if (
        taskInput.categoryId !== undefined &&
        (!Number.isInteger(taskInput.categoryId) || taskInput.categoryId <= 0)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_CATEGORY_ID",
            message: "Category ID must be a positive integer",
          },
        });
      }

      // Hash password before starting the transaction
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create User and Task in ONE database transaction
      const result = await AppDataSource.transaction(async (manager) => {
        const users = manager.getRepository(User);
        const tasks = manager.getRepository(Task);
        const categories = manager.getRepository(Category);

        // Check duplicate email inside transaction
        const existingUser = await users.findOne({
          where: { email: email.trim() },
        });

        if (existingUser) {
          throw new TransactionRequestError(
            409,
            "EMAIL_EXISTS",
            "A user with this email already exists",
          );
        }

        // 1. Create User
        const user = users.create({
          name: name.trim(),
          email: email.trim(),
          password: hashedPassword,
          phoneNumber: phoneValidation.value,
        });

        const savedUser = await users.save(user);

        // 2. Find optional Category
        let category: Category | null = null;

        if (taskInput.categoryId !== undefined) {
          category = await categories.findOne({
            where: { id: taskInput.categoryId },
          });

          if (!category) {
            throw new TransactionRequestError(
              404,
              "CATEGORY_NOT_FOUND",
              "The specified category does not exist",
            );
          }
        }

        // 3. Create initial Task
        const task = tasks.create({
          title: sanitizeInput(String(taskInput.title)),
          description:
            typeof taskInput.description === "string"
              ? sanitizeInput(taskInput.description)
              : (taskInput.description ?? null),
          status: (taskInput.status ?? "pending") as
            | "pending"
            | "in-progress"
            | "completed",
          priority: (taskInput.priority ?? "medium") as
            | "low"
            | "medium"
            | "high",
          dueDate,
          isDeleted: false,
          user: savedUser,
          userId: savedUser.id,
          category,
        });

        const savedTask = await tasks.save(task);

        // Both records are committed when the callback succeeds
        return {
          user: savedUser,
          task: savedTask,
        };
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = result.user;

      return res.status(201).json({
        success: true,
        message: "User and initial task created successfully",
        data: {
          user: userWithoutPassword,
          task: {
            ...result.task,
            user: userWithoutPassword,
          },
        },
      });
    } catch (error) {
      console.error("Error creating user with initial task:", error);

      if (error instanceof TransactionRequestError) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.errorCode,
            message: error.message,
          },
        });
      }

      return res.status(500).json({
        success: false,
        error: {
          code: "TRANSACTION_FAILED",
          message:
            "Failed to create user and initial task. All changes were rolled back.",
        },
      });
    }
  }

  // POST /api/users – Create a new user[cite: 14]
  static async create(req: Request, res: Response) {
    try {
      const { name, email, password, phoneNumber } = req.body as CreateUserDto;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: {
            code: "MISSING_FIELDS",
            message: "Name, email, and password are required",
          },
        });
      }

      // Validate optional phone number
      const phoneValidation = validatePhoneNumber(phoneNumber);

      if (!phoneValidation.valid) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_PHONE_NUMBER",
            message:
              "Phone number must contain 7 to 15 digits and may include a leading +, spaces, hyphens, dots, or parentheses. Maximum length is 20 characters.",
          },
        });
      }

      // Check if email already exists
      const existingUser = await userRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: "EMAIL_EXISTS",
            message: "A user with this email already exists",
          },
        });
      }

      // Create new user
      // Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = userRepository.create({
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneValidation.value,
      });

      const savedUser = await userRepository.save(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser;

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error("Error creating user:", error);

      return res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create user",
        },
      });
    }
  }

  // PUT /api/users/:id – Update a user[cite: 14]
  static async update(req: Request, res: Response) {
    try {
      const idParam = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const id = parseInt(idParam, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ID",
            message: "User ID must be a number",
          },
        });
      }

      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User with ID ${id} does not exist",
          },
        });
      }

      const { name, email, isActive } = req.body as UpdateUserDto;

      // Check if email is being changed and already exists
      if (email && email !== user.email) {
        const existingUser = await userRepository.findOne({ where: { email } });
        if (existingUser) {
          return res.status(409).json({
            success: false,
            error: {
              code: "EMAIL_EXISTS",
              message: "A user with this email already exists",
            },
          });
        }
      }

      // Update fields
      if (name !== undefined) user.name = name;
      if (email !== undefined) user.email = email;
      if (isActive !== undefined) user.isActive = isActive;

      const updatedUser = await userRepository.save(user);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        message: "User updated successfully",
        data: userWithoutPassword,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update user",
        },
      });
    }
  }

  // DELETE /api/users/:id – Delete a user[cite: 14]
  static async delete(req: Request, res: Response) {
    try {
      const idParam = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const id = parseInt(idParam, 10);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_ID",
            message: "User ID must be a number",
          },
        });
      }

      const user = await userRepository.findOne({ where: { id } });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "User with ID ${id} does not exist",
          },
        });
      }

      await userRepository.remove(user);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete user",
        },
      });
    }
  }
}