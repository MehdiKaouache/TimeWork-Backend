import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CompanyJobRole } from './entity/company-job-role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entity/company.entity';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company, CompanyJobRole])],
  providers: [CompanyService],
  controllers: [CompanyController],
  exports: [CompanyService, TypeOrmModule]
})

export class CompanyModule {}