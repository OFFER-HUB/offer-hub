import { Controller, Post, Body } from "@nestjs/common";
import { TransactionsService } from "@/services/transactions.service";
import { CreateTransactionDto } from "@/dtos/transactions.dto";

@Controller("transactions")
export class TransactionsController {
  static create(arg0: string, create: any) {
      throw new Error("Method not implemented.");
  }
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.createTransaction(createTransactionDto);
  }
}