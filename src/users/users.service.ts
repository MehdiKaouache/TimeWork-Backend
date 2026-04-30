import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from '../common/enums/user-status.enum';
import { UserRole } from '../common/enums/user-roles.enum';
import { UpdateUserInfoDTO } from './dto/update-user.dto';
import { SetUserRoleSalaryDTO } from './dto/set-user-role-salary.dto';
import { HashUtils } from 'src/common/utils/hash.util';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly configService: ConfigService
    ) {}

    /**
     * Seeds an initial manager account when the module initializes.
     * This ensures there's at least one admin user to manage the system on first run.
     * The credentials are logged to the console for easy access during development/testing.
     */
    // async onModuleInit(): Promise<void> {
    //     await this.createInitialManager();
    // }
    
    /**
     * Retrieves all users from the database.
     * @returns {Promise<User[]>} An array of User entities.
     */
    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    /**
     * Retrieves all active and approved users from the database.
     * @returns {Promise<User[]>} An array of active User entities.
     */
    async findAllActive(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: true, status: UserStatus.APPROVED }
        });
    }

    /**
     * Retrieves all deactivated users from the database.
     * @returns {Promise<User[]>} An array of deactivated User entities.
     */
    async findAllDeactivated(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: false, status: UserStatus.APPROVED }
        });
    }

    /**
     * Retrieves all approved users from the database.
     * @returns {Promise<User[]>} An array of approved User entities.
     */
    async findAllApproved(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: true, status: UserStatus.APPROVED }
        });
    }

    /**
     * Retrieves all rejected users from the database.
     * @returns {Promise<User[]>} An array of rejected User entities.
     */
    async findAllRejected(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { status: UserStatus.REJECTED }
        });
    }

    /**
     * Retrieves all pending users from the database.
     * @returns {Promise<User[]>} An array of pending User entities.
     */
    async findPendingUsers(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { status: UserStatus.PENDING }
        });
    }

    /**
     * Retrieves a specific user by their unique ID.
     * @param {number} id - The ID of the user to retrieve.
     * @returns {Promise<User>} The found User entity.
     * @throws {NotFoundException} if the user is not found.
     */
    async findOne(id : number): Promise<User> {

        const user = await this.usersRepository.findOne({ where: { id } });
        
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    /**
     * Finds a user by their employee number.
     * @param {string} employeeNumber - The employee number of the user to find.
     * @returns {Promise<User>} The found User entity.
     * @throws {NotFoundException} if the user is not found.
     */
    async findUserByEmployeeNumber(employeeNumber: string): Promise<User> {
        
        const user = await this.usersRepository.findOne({ where: { employeeNumber } });
        
        if (!user) {
            throw new NotFoundException(`Employee #${employeeNumber} not found`);
        }

        return user;
    }

    /**
     * Finds a user by their email address.
     * @param {string} email - The email address of the user to find.
     * @returns {Promise<User | null>} The found User entity or null if not found.
     */
    async findUserByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: { email: email.toLowerCase().trim() }
        });
    }

    /**
     * Creates a new user entity (the registration process is handled separately in the AuthService).
     * @param {string} firstName - The user's first name.
     * @param {string} lastName - The user's last name.
     * @param {string} email - The user's email address.
     * @param {string} password - The user's hashed password.
     * @param {string} phoneNumber - The user's phone number.
     * @returns {Promise<User>} The created User entity.
    */
    async createUser(firstName: string, lastName: string, email: string, password: string, phoneNumber: string): Promise<User> {

        const user = this.usersRepository.create({
            firstName, 
            lastName,
            email,
            password,
            phoneNumber
        });

        return await this.usersRepository.save(user);
    }

    /**
     * Updates general profile information for a user.
     * @param {number} id - The ID of the user to update.
     * @param {UpdateUserInfoDTO} body - An object containing the fields to update (firstName and/or lastName).
     * @returns {Promise<{ user: User }>} The updated User entity.
     */
    async updateUser(id: number, body: UpdateUserInfoDTO) {

        const user = await this.findOne(id);

        if (Object.keys(body).length === 0) return {user};

        Object.assign(user, body)

        return await this.usersRepository.save(user);
    }
    
    /**
     * Soft-deletes a user from the database.
     * @param {number} id - The ID of the user to delete.
     * @returns {Promise<{ message: string }>} A success message.
     */
    async deleteUser(id: number): Promise<{ message: string }> {

        const user = await this.findOne(id);

        await this.usersRepository.softRemove(user);

        return { message: `User deleted successfully` };
    }

     /**
     * Updates a user's sensitive login credentials.
     * @param {number} id - User ID.
     * @param {string} email - New normalized email address.
     * @param {string} password - New hashed password.
     * @return {Promise<void>} No return value.
     */
    async updateUserCredentials(id: number, email: string, password: string): Promise<void> {
        const user = await this.findOne(id);
        
        user.email = email;
        user.password = password;

        await this.usersRepository.save(user);
    }
    
    /**
     * Updates the hashed refresh token stored in the database.
     * @param {number} id - User ID.
     * @param {string | null} refreshToken - The hashed token or null to invalidate.
     * @return {Promise<void>} No return value.
     */
    async updateRefreshToken(id: number, refreshToken: string | null): Promise<void> {
        await this.usersRepository.update(id, { refreshToken });
    }

    /**
     * Saves a password reset token for a user.
     * @param {number} userId - The ID of the user to save the token for.
     * @param {string | null} hashedToken - The hashed token or null to invalidate.
     * @param {Date | null} expiresAt - The expiration date or null if no expiration.
     * @return {Promise<void>} No return value.
     * @throws {NotFoundException} if the user is not found.
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
     * Updates a user's password.
     * @param {number} userId - The ID of the user whose password to update.
     * @param {string} hashedPassword - The new hashed password.
     * @returns {Promise<void>} A promise resolving when the operation is complete.
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
     * @param {number} id - User ID.
     * @param {User} manager - The manager performing the approval (used for audit purposes).
     * @returns {Promise<{ message: string }>} A success message indicating the user has been approved and activated.
     * @throws {BadRequestException} if the user is not in pending status.
     */
    async approveUser(id: number, manager: User): Promise<{ message: string }> {

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
     * @param {number} id - User ID.
     * @returns {Promise<{ message: string }>} A success message indicating the user has been rejected.
     * @throws {BadRequestException} if the user is not in pending status.
     */
    async rejectUser(id: number): Promise<{ message: string }> {

        const user = await this.findOne(id);

        if (user.status === UserStatus.APPROVED) {
            throw new BadRequestException("User is already approved");
        }

        if (user.status === UserStatus.REJECTED) {
            throw new BadRequestException("User is already rejected");
        }

        user.status = UserStatus.REJECTED;
        user.isActive = false;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} rejected successfully` };
    }

    /**
     * Toggles the activation status of a user.
     * @param {number} id - User ID.
     * @returns {Promise<User>} The updated user object.
     */
    async toggleUserActivation(id: number): Promise<User> {
        const user = await this.findOne(id);
        user.isActive = !user.isActive;
        return await this.usersRepository.save(user);
    }

    /**
     * Sets administrative properties for a user.
     * @param {number} id - User ID.
     * @param {SetUserRoleSalaryDTO} body - The role and hourly rate to assign.
     * @returns {Promise<{ message: string }>} A success message indicating the user's properties have been updated.
     */
    async setUserRoleAndHourlyRate(id: number, body: SetUserRoleSalaryDTO): Promise<{ message: string }> {

        const user = await this.findOne(id);

        user.role = body.role;
        user.hourlyRate = body.hourlyRate;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} role and hourly rate updated successfully` };
    }
    
    /**
     * Counts the number of pending users.
     * @returns {Promise<number>} A promise resolving to the count of pending users.
     */
    async countPendingUsers(): Promise<number> {
        return await this.usersRepository.count({ where: { status: UserStatus.PENDING } });
    }

    /**
     * Seeds an initial manager account for testing/first-run purposes.
     * @returns {Promise<void>} No return value.
     */
    async createInitialManager() {
        const managerEmail = this.configService.get<string>('INITIAL_MANAGER_EMAIL') || 'manager@test.com';     

        const existingManager = await this.findUserByEmail(managerEmail);
            
        if (existingManager) {
                return; // Sortir de la fonction si l'utilisateur existe déjà
            }

        const rawPassword = this.configService.get<string>('INITIAL_MANAGER_PASS') || 'Password123!';
        const hashedPassword = await HashUtils.hashValue(rawPassword);

        const manager = this.usersRepository.create({
            firstName: 'Manager',
            lastName: 'Test',
            email: managerEmail,
            password: hashedPassword,
            phoneNumber: '+1234567890',
            role: UserRole.MANAGER,
            status: UserStatus.APPROVED,
            isActive: true
        });

        await this.usersRepository.save(manager);
        console.log(`Initial Manager created with email: ${managerEmail} and password: ${rawPassword}`);
    }
}