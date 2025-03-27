import { Module, forwardRef } from '@nestjs/common';
import { InvoiceService } from './service';
import { PdfModule } from '../pdf/module';
import { TransactionsModule } from '../transactions/module';
import { UsersModule } from '../users/module';
import { ProjectsModule } from '../projects/module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../transactions/entity';
import { InvoiceController } from './controller';
import { StorageModule } from '../storage/module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction]),
    PdfModule,
    forwardRef(() => TransactionsModule),
    UsersModule,
    ProjectsModule,
    StorageModule
  ],
  controllers: [InvoiceController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule {}