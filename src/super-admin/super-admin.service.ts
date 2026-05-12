import { Injectable, ConflictException, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { User } from '../users/entity/user.entity';
import { CompanyJobRole } from 'src/company/entity/company-job-role.entity';
import { Company } from 'src/company/entity/company.entity';
import { UserRole } from '../common/enums/user-roles.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { HashUtils } from 'src/common/utils/hash.util';
import { ProvisionCompanyDto } from './dto/provision-company.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { PasswordUtils } from 'src/common/utils/password.util';

@Injectable()
export class SuperAdminService implements OnModuleInit {
    private readonly logger = new Logger(SuperAdminService.name);

    constructor(
        private dataSource: DataSource,
        private mailerService: MailerService
    ) {}

    async onModuleInit() {
        await this.seedSuperAdmin();
    }

    private async seedSuperAdmin() {
        const email = 'superadmin@timework.com';
        const password = 'SuperPassword123!';
        
        const userRepository = this.dataSource.getRepository(User);
        const existing = await userRepository.findOne({ where: { email } });

        if (existing) return;

        const hashedPassword = await HashUtils.hashValue(password);
        
        const superAdmin = userRepository.create({
            firstName: 'System',
            lastName: 'Admin',
            email: email,
            password: hashedPassword,
            role: UserRole.SUPER_ADMIN,
            status: UserStatus.APPROVED,
            isActive: true,
            phoneNumber: '000-000-0000',
            employeeNumber: 'SA-001'
        });

        await userRepository.save(superAdmin);
        this.logger.log('Super Admin seed completed.');
    }

    async fullClientProvisioning(data: ProvisionCompanyDto) {
        const companyRepo = this.dataSource.getRepository(Company);
        const userRepo = this.dataSource.getRepository(User);

        const existingCompany = await companyRepo.findOne({ where: { name: data.companyName } });
        if (existingCompany) throw new ConflictException(`L'entreprise "${data.companyName}" existe déjà.`);

        const existingUser = await userRepo.findOne({ where: { email: data.managerEmail } });
        if (existingUser) throw new ConflictException(`L'email "${data.managerEmail}" est déjà utilisé.`);

        const rawPassword = PasswordUtils.generateSecurePassword(12);
        const hashedPassword = await HashUtils.hashValue(rawPassword);

        // 2. Transaction atomique
        const result = await this.dataSource.transaction(async (manager: EntityManager) => {
            // Créer l'entreprise
            const company = manager.create(Company, { 
                name: data.companyName, 
                operatingHours: data.operatingHours,
                address: data.companyAddress,
                phoneNumber: data.companyPhone
            });
            const savedCompany = await manager.save(company);

            // Configurer les rôles
            if (data.roles && data.roles.length > 0) {
                const jobRoles = data.roles.map(r => manager.create(CompanyJobRole, {
                    title: r.title,
                    baseHourlyRate: r.baseHourlyRate,
                    staffingNeedsPerDay: r.staffingNeeds, 
                    company: savedCompany
                }));
                await manager.save(jobRoles);
            }

            // Créer le manager
            const admin = manager.create(User, {
                firstName: data.managerFirstName,
                lastName: data.managerLastName,
                email: data.managerEmail,
                password: hashedPassword,
                role: UserRole.MANAGER,
                company: savedCompany,
                status: UserStatus.APPROVED,
                isActive: true,
                phoneNumber: data.managerPhone
            });
            const savedAdmin = await manager.save(admin);

            return {
                companyCode: savedCompany.companyCode,
                adminId: savedAdmin.id,
                companyName: savedCompany.name,
                tempPassword: rawPassword
            };
        });

        // 3. Envoi d'email (Asynchrone, ne bloque pas la réponse)
        this.sendProvisioningEmail(data, result).catch(err => 
            this.logger.error(`Email failed for ${data.managerEmail}: ${err.message}`)
        );

        return { ...result, status: 'DEPLOYED' };
    }

    private async sendProvisioningEmail(data: ProvisionCompanyDto, result: any) {
        await this.mailerService.sendMail({
            to: data.managerEmail,
            subject: `Welcome to TimeWork - ${result.companyName}`,
            template: 'provisioning-email',
            context: {
                firstName: data.managerFirstName,
                managerEmail: data.managerEmail,
                companyName: result.companyName,
                tempPassword: result.tempPassword,
                companyCode: result.companyCode
            }
        });
    }

    async getAllCompanies(): Promise<Company[]> {
        return this.dataSource.getRepository(Company).find({
            where: { isDeleted: false },
            relations: ['jobRoles', 'users']
        });
    }

    async getCompanyById(id: number): Promise<Company> {
        const company = await this.dataSource.getRepository(Company).findOne({
            where: { id, isDeleted: false },
            relations: ['jobRoles', 'users']
        });
        
        if (!company) throw new NotFoundException('Company not found');
        return company;
    }

async updateCompanyInfo(
    id: number,
    updateData: any
): Promise<Company> {

    return this.dataSource.transaction(async (manager) => {

        const companyRepo =
            manager.getRepository(Company);

        const userRepo =
            manager.getRepository(User);

        const roleRepo =
            manager.getRepository(CompanyJobRole);

        // FIND COMPANY

        const company = await companyRepo.findOne({
            where: {
                id,
                isDeleted: false,
            },
            relations: ['users', 'jobRoles'],
        });

        if (!company) {
            throw new NotFoundException(
                'Company not found'
            );
        }

        // UPDATE COMPANY

        company.name =
            updateData.companyName ??
            company.name;

        company.address =
            updateData.companyAddress ??
            company.address;

        company.phoneNumber =
            updateData.companyPhone ??
            company.phoneNumber;

        company.operatingHours =
            updateData.operatingHours ??
            company.operatingHours;

        await companyRepo.save(company);

        // UPDATE MANAGER

        const managerUser = company.users.find(
            (u) => u.role === UserRole.MANAGER
        );

        if (managerUser) {

            managerUser.firstName =
                updateData.managerFirstName ??
                managerUser.firstName;

            managerUser.lastName =
                updateData.managerLastName ??
                managerUser.lastName;

            managerUser.email =
                updateData.managerEmail ??
                managerUser.email;

            managerUser.phoneNumber =
                updateData.managerPhone ??
                managerUser.phoneNumber;

            await userRepo.save(managerUser);
        }

        // UPDATE ROLES

        await roleRepo
            .createQueryBuilder()
            .delete()
            .from(CompanyJobRole)
            .where('companyId = :id', {
                id: company.id,
            })
            .execute();

        if (
            updateData.roles &&
            updateData.roles.length > 0
        ) {

            const newRoles =
                updateData.roles.map((role) =>
                    roleRepo.create({
                        title: role.title,

                        baseHourlyRate:
                            Number(role.baseHourlyRate),

                        staffingNeedsPerDay:
                            role.staffingNeeds,

                        company,
                    })
                );

            await roleRepo.save(newRoles);
        }

        // RETURN UPDATED COMPANY

        const updatedCompany =
            await companyRepo.findOne({
                where: {
                    id: company.id,
                },
                relations: ['users', 'jobRoles'],
            });

        if (!updatedCompany) {
            throw new NotFoundException(
                'Updated company not found'
            );
        }

        return updatedCompany;
    });
}

    async deleteCompany(id: number) {
        const company = await this.getCompanyById(id);
        company.isDeleted = true;
        await this.dataSource.getRepository(Company).save(company);
        return { message: `Company ${id} soft-deleted successfully.` };
    }
}