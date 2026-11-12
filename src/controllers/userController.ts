// src/controllers/userController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import bcrypt from "bcrypt";
import { CreateUserDto } from "../dto/CreateUserDto";
import { UpdateUserDto } from "../dto/UpdateUserDto";

const userRepository = AppDataSource.getRepository(User);

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