import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { SuperAdminService } from './super-admin.service';
import { ProvisionCompanyDto } from './dto/provision-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

import { Roles } from 'src/common/decorator/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

import { UserRole } from 'src/common/enums/user-roles.enum';

@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {

  constructor(
    private readonly superAdminService: SuperAdminService
  ) {}

  @Post('provision')
  async provision(
    @Body() data: ProvisionCompanyDto
  ) {
    return this.superAdminService.fullClientProvisioning(data);
  }

  @Get('companies')
  async findAll() {
    return this.superAdminService.getAllCompanies();
  }

  @Get('company/:id')
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.superAdminService.getCompanyById(id);
  }

  @Patch('company/:id')
  async updateCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: UpdateCompanyDto
  ) {
    return this.superAdminService.updateCompanyInfo(
      Number(id),
      updateData
    );
  }

  @Delete('company/:id')
  async remove(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.superAdminService.deleteCompany(id);
  }
}