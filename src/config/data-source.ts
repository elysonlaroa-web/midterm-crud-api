import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Task } from "../entities/Task";
import { Category } from "../entities/Category";
import * as dotenv from "dotenv";
import { InitialSchema1792861097536 } from "../migrations/1792861097536-InitialSchema";
import { AddPhoneNumberToUser1792862547855 } from "../migrations/1792862547855-AddPhoneNumberToUser";
import { SetTaskUserNullable1794500000000 } from "../migrations/1794500000000-SetTaskUserNullable";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "3308"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [User, Task, Category],

  synchronize: false,

  logging: process.env.NODE_ENV !== "development",

  migrations: [
    InitialSchema1792861097536,
    AddPhoneNumberToUser1792862547855,
    SetTaskUserNullable1794500000000,
  ],

  migrationsTransactionMode: "none",
});