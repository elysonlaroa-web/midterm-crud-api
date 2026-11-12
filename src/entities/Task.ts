import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";

import { User } from "./User";
import { Category } from "./Category";

@Entity("tasks")
@Index(["userId"])
export class Task {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 200 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({
    type: "enum",
    enum: ["pending", "in-progress", "completed"],
    default: "pending",
  })
  status!: "pending" | "in-progress" | "completed";

  @Column({
    type: "enum",
    enum: ["low", "medium", "high"],
    default: "medium",
  })
  priority!: "low" | "medium" | "high";

  @Column({ type: "boolean", default: false })
  isDeleted!: boolean;

  @Column({ type: "date", nullable: true })
  dueDate!: Date | null;

  // Many tasks belong to one user
  @ManyToOne(() => User, (user) => user.tasks, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "userId" })
  user!: User | null;

  @Column({ type: "int", nullable: true })
  userId!: number | null;

  // Many tasks can belong to one category
  @ManyToOne(() => Category, (category) => category.tasks, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "categoryId" })
  category!: Category | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}