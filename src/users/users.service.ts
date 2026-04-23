import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from '../common/enums/user-status.enum';
import { UserRole } from '../common/enums/user-roles.enum';
import {  scrypt as _scrypt } from 'crypto';
import { UpdateUserInfoDTO } from './dto/update-user.dto';
import { SetUserRoleSalaryDTO } from './dto/set-user-role-salary.dto';
import { HashUtils } from 'src/common/hash.util';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly configService: ConfigService
    ) {}

    async onModuleInit() {
        await this.createInitialManager();
    }
    
    /**
     * Retrieves all users from the database.
     * @returns An array of User entities.
     */
    async findAll(): Promise<User[]> {

        const users = await this.usersRepository.find();

        return users;
    }

    /**
     *  
     * @returns An array of active User entities.
     */
    async findAllActive(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: true, status: UserStatus.APPROVED }
        });
    }

    /**
     *  
     * @returns An array of deactivated User entities.
     */
    async findAllDeactivated(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: false, status: UserStatus.APPROVED }
        });
    }

    /**
     *  
     * @returns An array of approved User entities.
     */
    async findAllApproved(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: true, status: UserStatus.APPROVED }
        });
    }

    /**
     * 
     * @returns An array of rejected User entities.
     */
    async findAllRejected(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: false, status: UserStatus.REJECTED }
        });
    }

    /**
     * 
     * @returns An array of pending User entities.
     */
    async findPendingUsers(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { status: UserStatus.PENDING }
        });
    }

    /**
     * Retrieves a specific user by their unique ID.
     * @param id - The ID of the user to retrieve.
     * @returns The found User entity.
     * @throws NotFoundException if the user is not found.
     */
    async findOne(id : number): Promise<User> {

        const user = await this.usersRepository.findOne({ where: { id } });
        
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    /**
     * 
     * @param employeeNumber 
     * @return 
     */
    async findUserByEmployeeNumber(employeeNumber: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { employeeNumber } });
        if (!user) {
            throw new NotFoundException(`Employee #${employeeNumber} not found`);
        }
        return user;
    }

    /**
     * 
     * @param email 
     * @returns 
     */
    async findUserByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({
             where: { email: email.toLowerCase().trim() } 
        });
    }

    /**
     * Creates a new user entity.
     * Note: Password hashing and uniqueness checks are coordinated by the AuthService.
    */
    async createUser(firstName: string, lastName: string, email: string, password: string) {

        const user = this.usersRepository.create({
            firstName, 
            lastName,
            email,
            password
        });

        return await this.usersRepository.save(user);
    }

    /**
     * Updates general profile information for a user.
     * @param id - The ID of the user to update.
     * @param body - Object containing optional firstName and lastName.
     * @returns A success message.
     */
    async updateUser(id: number, body: UpdateUserInfoDTO) {

        const user = await this.findOne(id);

        if (Object.keys(body).length === 0) return {user};

        Object.assign(user, body)

        return await this.usersRepository.save(user);
    }
    
    /**
     * Permanently removes a user from the database.
     * @param id - The ID of the user to delete.
     * @returns A success message.
     */
    async deleteUser(id: number) {

        const user = await this.findOne(id);

        await this.usersRepository.softRemove(user);

        return { message: `User deleted successfully` };
    }

     /**
     * Updates a user's sensitive login credentials.
     * @param id - User ID.
     * @param email - New normalized email address.
     * @param password - New hashed password.
     */
    async updateUserCredentials(id: number, email: string, password: string) {
        const user = await this.findOne(id);
        
        user.email = email;
        user.password = password;

        await this.usersRepository.save(user);
    }
    
    /**
     * Updates the hashed refresh token stored in the database.
     * @param id - User ID.
     * @param refreshToken - The hashed token or null to invalidate.
     */
    async updateRefreshToken(id: number, refreshToken: string | null): Promise<void> {
        await this.usersRepository.update(id, { refreshToken });
    }

    /**
     * 
     * @param userId 
     * @param hashedToken 
     * @param expiresAt 
     */
    async savePasswordResetToken(userId: number, hashedToken: string | null, expiresAt: Date | null): Promise<void> {
        const user = await this.usersRepository.findOneBy({ id: userId });
        
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.passwordResetToken = hashedToken;
        user.passwordResetExpiresAt = expiresAt;

        await this.usersRepository.save(user);
    }

    /**
     * 
     * @param userId 
     * @param hashedPassword 
     * @returns 
     */
    async updatePassword(userId: number, hashedPassword: string): Promise<void> {

        await this.usersRepository.update(userId, {
            password: hashedPassword,
            passwordResetToken: null,
            passwordResetExpiresAt: null,
            refreshToken: null 
        });
    }
    
    /**
     * Approves a pending user account.
     * @param id - User ID.
     */
    async approveUser(id: number, manager: User) {

        const user = await this.findOne(id);

        if (user.status !== UserStatus.PENDING) {
            throw new BadRequestException(`User is not in pending status (Current: ${user.status})`);
        }

        user.status = UserStatus.APPROVED;
        user.isActive = true;
        user.approvedAt = new Date();
        user.approvedBy = manager;

        await this.usersRepository.save(user);

        return { message: `User approved by ${manager.firstName} and activated successfully` };
    }

    /**
     * Rejects a pending user account.
     * @param id - User ID.
     */
    async rejectUser(id: number) {

        const user = await this.findOne(id);

        if (user.status === UserStatus.REJECTED) {
            throw new BadRequestException("User is already rejected");
        }

        user.status = UserStatus.REJECTED;
        user.isActive = false;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} rejected successfully` };
    }

    /**
     * 
     * @param id 
     * @returns 
     */
    async toggleUserActivation(id: number): Promise<User> {
        const user = await this.findOne(id);
        user.isActive = !user.isActive;
        return await this.usersRepository.save(user);
    }

    /**
     * Sets administrative properties for a user.
     * @param id - User ID.
     * @param body - The role and hourly rate to assign.
     */
    async setUserRoleAndHourlyRate(id: number, body: SetUserRoleSalaryDTO) {

        const user = await this.findOne(id);

        user.role = body.role;
        user.hourlyRate = body.hourlyRate;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} role and hourly rate updated successfully` };
    }
    
    /**
     * 
     * @returns 
     */
    async countPendingUsers(): Promise<number> {
        return await this.usersRepository.count({ where: { status: UserStatus.PENDING } });
    }

    /**
     * Seeds an initial manager account for testing/first-run purposes.
     */
    async createInitialManager() {
        const managerEmail = this.configService.get<string>('INITIAL_MANAGER_EMAIL') || 'manager@test.com';
    
        // call create user (name, pw..)
        // call set role (manager...)
        

        const rawPassword = this.configService.get<string>('INITIAL_MANAGER_PASS') || 'Password123!';

        const hashedPassword = await HashUtils.hashValue(rawPassword);

        const manager = this.usersRepository.create({
            firstName: 'Manager',
            lastName: 'Test',
            email: managerEmail,
            password: hashedPassword,
            role: UserRole.MANAGER,
            status: UserStatus.APPROVED,
            isActive: true
        });

        await this.usersRepository.save(manager);
        console.log(`Initial Manager created with email: ${managerEmail} and password: ${rawPassword}`);
    }
}