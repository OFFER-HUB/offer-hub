import { EntityRepository, Repository } from "typeorm";
import { Transaction } from "@/entities/transactions.entity";

@EntityRepository(Transaction)
export class TransactionsRepository extends Repository<Transaction> {}