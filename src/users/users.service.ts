import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from '../common/enums/user-status.enum';
import { UserRole } from '../common/enums/user-roles.enum';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}
    
    /**
     * Retrieves all users from the database.
     * @returns An array of User entities.
     * @throws NotFoundException if no users exist.
     */
    async findAll(): Promise<User[]> {

        const users = await this.usersRepository.find();
        
        if (!users || users.length === 0) {
            throw new NotFoundException('No users found');
        }

        return users;
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
     * Updates general profile information for a user.
     * @param id - The ID of the user to update.
     * @param body - Object containing optional firstName and lastName.
     * @returns A success message.
     */
    async updateUser(id: number, body: { firstName?: string; lastName?: string }) {

        const user = await this.findOne(id);

        if (body.firstName) { user.firstName = body.firstName; }
        if (body.lastName) { user.lastName = body.lastName; }

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} updated successfully` };
    }
    
    /**
     * Permanently removes a user from the database.
     * @param id - The ID of the user to delete.
     * @returns A success message.
     */
    async deleteUser(id: number) {

        const user = await this.findOne(id);

        await this.usersRepository.remove(user);

        return { message: `User ${user.firstName} ${user.lastName} deleted successfully` };
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
     * Finds a user by their email address.
     * Used primarily for authentication and registration checks.
     */
    async findUserByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    /**
     * Approves a pending user account.
     * @param id - User ID.
     */
    async approveUser(id: number) {

        const user = await this.findOne(id);

        if (user.status === UserStatus.APPROVED) {
            throw new BadRequestException("User is already approved");
        }

        user.status = UserStatus.APPROVED;
        user.isActive = true;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} approved and activated successfully` };
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
     * Sets administrative properties for a user.
     * @param id - User ID.
     * @param body - The role and hourly rate to assign.
     */
    async setUserRoleAndHourlyRate(id: number, body: { role: UserRole, hourlyRate: number }) {

        const user = await this.findOne(id);

        user.role = body.role;
        user.hourlyRate = body.hourlyRate;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} role and hourly rate updated successfully` };
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
        const user = await this.usersRepository.findOneBy({ id: userId });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.password = hashedPassword;
        
        // Safety measure: clear tokens when password is changed
        user.passwordResetToken = null;
        user.passwordResetExpiresAt = null;

        await this.usersRepository.save(user);
    }
    
    /**
     * Seeds an initial manager account for testing/first-run purposes.
     */
    async createInitialManager() {
        const email = 'manager@test.com';
        const existing = await this.findUserByEmail(email);

        if (existing) return;

        const password = 'password123';
        const salt = randomBytes(8).toString("hex");
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        const hashedPassword = `${salt}:${hash.toString('hex')}`;

        const manager = this.usersRepository.create({
            firstName: 'Manager',
            lastName: 'Test',
            email,
            password: hashedPassword,
            role: UserRole.MANAGER,
            isActive: true,
            status: UserStatus.APPROVED,
        });

        return await this.usersRepository.save(manager);
    }
}