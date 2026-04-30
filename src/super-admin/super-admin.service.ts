// src/super-admin/super-admin.service.ts
import { Injectable, BadRequestException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../users/entity/user.entity';
import { CompanyJobRole } from 'src/company/entity/company-job-role.entity';
import { Company } from 'src/company/entity/company.entity';
import { UserRole } from '../common/enums/user-roles.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { HashUtils } from 'src/common/utils/hash.util';
import { ProvisionCompanyDto } from './dto/provisiom-company.dto';

// Note: We will need to create this service later to send the email with credentials to the manager. (ex: Nodemailer, SendGrid, etc.)
import { MailerService } from '@nestjs-modules/mailer';
import { PasswordUtils } from 'src/common/utils/password.util';

@Injectable()
export class SuperAdminService {
    private readonly logger = new Logger(SuperAdminService.name);

    constructor(
        private dataSource: DataSource,
        private mailerService: MailerService
    ) {}

    async fullClientProvisioning(data: ProvisionCompanyDto) {
            
        const rawPassword = PasswordUtils.generateSecurePassword(12);
        const hashedPassword = await HashUtils.hashValue(rawPassword);

        // Use a transaction to ensure database consistency across all steps
        const result = await this.dataSource.transaction(async (manager: EntityManager) => {

            // Create Company
            const company = await this.createCompany(data.companyName, data.operatingHours, manager);

            // Configure Job Roles
            await this.configureJobRoles(company, data.roles, manager);

            // Create Initial Manager with generated password
            const admin = await this.createInitialManager(
                company,
                data.managerFirstName,
                data.managerLastName,
                data.managerEmail,
                hashedPassword,
                manager
            );

            return {
                companyCode: company.companyCode,
                adminId: admin.id,
                companyName: company.name
            };
        });

        try {
            await this.mailerService.sendMail({
                to: data.managerEmail,
                subject: `Welcome to the Platform - ${result.companyName}`,
                template: 'provisioning-email',
                context: {
                    firstName: data.managerFirstName,
                    companyName: result.companyName,
                    email: data.managerEmail,
                    packagedPassword: rawPassword,
                }
            });
        } catch (error) {
            this.logger.error(`Failed to send provisioning email to ${data.managerEmail}`, error.stack);
            // We don't want to fail the entire provisioning process if the email fails, but we should log it for later review.
        }

        return { ...result, status: 'DEPLOYED' };
    }

    /**
    * UPDATE COMPANY INFO
    */
    async updateCompanyInfo(companyId: number, updateData: Partial<Company>): Promise<Company> {
        
        const company = await this.dataSource.getRepository(Company).findOne({ where: { id: companyId } });
        
        if (!company) {
            throw new NotFoundException('Company not found');
        }

        Object.assign(company, updateData);
        return await this.dataSource.getRepository(Company).save(company);
    }

    /**
     * DELETE COMPANY (Soft Delete)
     */
    async deleteCompany(companyId: number) {
        
        const company = await this.dataSource.getRepository(Company).findOne({ where: { id: companyId } });
        
        if (!company) {
            throw new NotFoundException('Company not found');
        }

        company.isDeleted = true;
        
        await this.dataSource.getRepository(Company).save(company);

        return {message: `Company ${companyId} and all related data deleted successfully.`};
    }

    // --- PRIVATE HELPER METHODS (Internal Logic) ---

    private async createCompany(name: string, hours: any, manager: EntityManager): Promise<Company> {
        const company = manager.create(Company, { 
        name, 
        operatingHours: hours 
        });
        return await manager.save(company);
    }

    private async configureJobRoles(company: Company, roles: any[], manager: EntityManager): Promise<void> {
        if (!roles || roles.length === 0) return;

        const jobRoles = roles.map(r => manager.create(CompanyJobRole, {
        ...r,
        company: company
        }));
        await manager.save(jobRoles);
    }

    private async createInitialManager(
        company: Company, 
        firstName: string, 
        lastName: string, 
        email: string, 
        hashedPassword: string, 
        manager: EntityManager
    ): Promise<User> {
        const existingUser = await manager.findOne(User, { where: { email } });
        if (existingUser) throw new ConflictException('Manager email already exists');

        const user = manager.create(User, {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: UserRole.MANAGER,
        company: company,
        status: UserStatus.APPROVED,
        isActive: true,
        phoneNumber: 'N/A' // Placeholder, since phone number is required but we don't have it at this stage
        });

        return await manager.save(user);
    }
}