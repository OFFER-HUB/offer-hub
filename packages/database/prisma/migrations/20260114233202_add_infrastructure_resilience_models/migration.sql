-- AlterTable
ALTER TABLE "audit_logs" ADD COLUMN     "user_id" TEXT,
ALTER COLUMN "actor_type" DROP NOT NULL,
ALTER COLUMN "result" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");
