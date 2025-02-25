import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "@/entities/user.entity";
import { Project } from "@/entities/project.entity";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  transactionId: string;

  @ManyToOne(() => User)
  fromUserId: User;

  @ManyToOne(() => User)
  toUserId: User;

  @ManyToOne(() => Project)
  projectId: Project;

  @Column("decimal", { precision: 12, scale: 2 })
  amount: number;

  @Column({ type: "varchar", length: 10 })
  currency: string;

  @Column({ type: "varchar", length: 100, unique: true })
  transactionHash: string;

  @Column({ type: "varchar", length: 20 })
  status: "pending" | "completed" | "failed" | "cancelled";

  @Column({ type: "varchar", length: 20 })
  type: "payment" | "escrow_deposit" | "escrow_release" | "refund";

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;
}
