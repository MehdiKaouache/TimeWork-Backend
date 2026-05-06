import { Controller, Post, Body, Get, Param, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { ProvisionCompanyDto } from './dto/provision-company.dto';
import { Company } from 'src/company/entity/company.entity';

@Controller('super-admin')
export class SuperAdminController {
    constructor(private readonly superAdminService: SuperAdminService) {}

    /**
     * LIST ALL COMPANIES
     */
    @Get('companies')
    async getAllCompanies() {
        return this.superAdminService.getAllCompanies();
    }

    /**
     * GET ONE COMPANY BY ID
     */
    @Get('company/:id')
    async getCompanyById(@Param('id', ParseIntPipe) id: number) {
        return this.superAdminService.getCompanyById(id);
    }

    /**
     * PROVISION A NEW COMPANY AND INITIAL MANAGER
     * This is the entry point for onboarding a new client.
     */
    @Post('provision')
    async fullClientProvisioning(@Body() data: ProvisionCompanyDto) {
        return this.superAdminService.fullClientProvisioning(data);
    }

    /**
     * UPDATE COMPANY INFO
     */
    @Patch('company/:id')
    async updateCompanyInfo(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateData: Partial<Company>
    ) {
        return this.superAdminService.updateCompanyInfo(id, updateData);
    }

    /**
     * DELETE COMPANY (Mark as deleted)
     */
    @Delete('company/:id')
    async deleteCompany(@Param('id', ParseIntPipe) id: number) {
        return this.superAdminService.deleteCompany(id);
    }
}
