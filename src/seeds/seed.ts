import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import bcrypt from "bcrypt";
import * as dotenv from "dotenv";

dotenv.config();

async function seed() {
  try {
    await AppDataSource.initialize();

    console.log("Database connected. Starting seeder...");

    const userRepository = AppDataSource.getRepository(User);
    const taskRepository = AppDataSource.getRepository(Task);

    const hashedPassword = await bcrypt.hash("SeedPassword123", 10);

    const seedUsers = [
      {
        name: "Seed User One",
        email: "seeduser1@example.com",
        phoneNumber: "09123456781",
      },
      {
        name: "Seed User Two",
        email: "seeduser2@example.com",
        phoneNumber: "09123456782",
      },
      {
        name: "Seed User Three",
        email: "seeduser3@example.com",
        phoneNumber: "09123456783",
      },
      {
        name: "Seed User Four",
        email: "seeduser4@example.com",
        phoneNumber: "09123456784",
      },
      {
        name: "Seed User Five",
        email: "seeduser5@example.com",
        phoneNumber: "09123456785",
      },
    ];

    const taskTitles = [
      [
        "Complete documentation",
        "Review project requirements",
        "Prepare presentation",
      ],
      [
        "Create API endpoints",
        "Test user registration",
        "Fix validation errors",
      ],
      [
        "Design database tables",
        "Review relationships",
        "Test database queries",
      ],
      [
        "Build frontend interface",
        "Improve dashboard",
        "Test responsive layout",
      ],
      ["Write unit tests", "Fix application bugs", "Finalize project report"],
    ];

    const statuses = ["pending", "in-progress", "completed"] as const;
    const priorities = ["high", "medium", "low"] as const;

    let usersCreated = 0;
    let tasksCreated = 0;

    for (let i = 0; i < seedUsers.length; i++) {
      const userData = seedUsers[i];

      let user = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!user) {
        user = userRepository.create({
          ...userData,
          password: hashedPassword,
        });

        user = await userRepository.save(user);
        usersCreated++;

        console.log(`Created user: ${user.email}`);
      }

      for (let j = 0; j < 3; j++) {
        const title = taskTitles[i][j];

        const existingTask = await taskRepository.findOne({
          where: {
            userId: user.id,
            title,
          },
        });

        if (!existingTask) {
          const task = taskRepository.create({
            title,
            description: `Seeded task: ${title}`,
            status: statuses[j],
            priority: priorities[j],
            isDeleted: false,
            dueDate: null,
            userId: user.id,
          });

          await taskRepository.save(task);
          tasksCreated++;

          console.log(`Created task: ${title}`);
        }
      }
    }

    console.log("--------------------------------");
    console.log("SEEDING COMPLETED!");
    console.log(`Users created: ${usersCreated}`);
    console.log(`Tasks created: ${tasksCreated}`);
    console.log("--------------------------------");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seed();