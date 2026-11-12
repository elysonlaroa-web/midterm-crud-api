import { DataSource, Repository } from "typeorm";
import { Task } from "../entities/Task";

export class TaskRepository extends Repository<Task> {
  constructor(dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async findOverdueTasks(): Promise<Task[]> {
    return this.createQueryBuilder("task")
      .leftJoinAndSelect("task.user", "user")
      .leftJoinAndSelect("task.category", "category")
      .where("task.dueDate < CURRENT_DATE")
      .andWhere("task.status != :completed", {
        completed: "completed",
      })
      .andWhere("task.isDeleted = :isDeleted", {
        isDeleted: false,
      })
      .orderBy("task.dueDate", "ASC")
      .getMany();
  }
}