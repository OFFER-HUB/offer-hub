import { IsUUID, IsDecimal, IsString, IsIn } from "class-validator";

export class CreateTransactionDto {
  @IsUUID()
  fromUserId: string;

  @IsUUID()
  toUserId: string;

  @IsUUID()
  projectId: string;

  @IsDecimal()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  transactionHash: string;

  @IsIn(["pending", "completed", "failed", "cancelled"])
  status: "pending" | "completed" | "failed" | "cancelled";

  @IsIn(["payment", "escrow_deposit", "escrow_release", "refund"])
  type: "payment" | "escrow_deposit" | "escrow_release" | "refund";
}
