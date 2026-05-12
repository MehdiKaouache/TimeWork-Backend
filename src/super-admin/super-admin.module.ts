import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController } from './super-admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from 'src/company/entity/company.entity';
import { User } from 'src/users/entity/user.entity';
import { CompanyJobRole } from 'src/company/entity/company-job-role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, User, CompanyJobRole])
  ],
  providers: [SuperAdminService],
  controllers: [SuperAdminController],
  exports: [SuperAdminService]
})
export class SuperAdminModule {}
