import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
// import { User } from "./User";

export enum ProjectStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  project_id: string;

  // @ManyToOne(() => User, (user) => user.projects, { onDelete: "CASCADE" })
  // client: User;

  @Column({ type: "varchar", length: 200, nullable: false })
  title: string;

  @Column({ type: "text", nullable: false })
  description: string;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  budget_min?: number;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  budget_max?: number;

  @Column({ type: "date", nullable: true })
  deadline?: Date;

  @Column({ type: "enum", enum: ProjectStatus, default: ProjectStatus.OPEN })
  status: ProjectStatus;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updated_at: Date;
}
