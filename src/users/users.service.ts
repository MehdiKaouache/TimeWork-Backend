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
        private usersRepository: Repository<User>,
    ) {}
    
    /**
     * Récupère tous les utilisateurs de la base de données.
     * @returns Un tableau d'objets User représentant tous les utilisateurs.
     * @throws NotFoundException si aucun utilisateur n'est trouvé.
     */

    async findAll() {

        const users = await this.usersRepository.find();
        
        if (!users || users.length === 0) {
            throw new NotFoundException("No users found");
        }

        return users;
    }

    /**
     * Récupère un utilisateur spécifique en fonction de son identifiant.
     * @param id - L'identifiant de l'utilisateur à récupérer.
     * @return Un objet User représentant l'utilisateur trouvé.
     * @throws NotFoundException si aucun utilisateur n'est trouvé avec l'identifiant fourni.
     */

    async findOne(id : number) {

        const user = await this.usersRepository.findOne({ where: { id } });
        
        if (!user) {
            throw new NotFoundException("User not found");
        }

        return user;
    }

    /**
     * Met à jour les informations d'un utilisateur existant.
     * @param id - L'identifiant de l'utilisateur à mettre à jour.
     * @param body - Un objet contenant les nouvelles valeurs pour les propriétés de l'utilisateur (firstName et/ou lastName).
     * @returns Un message de succès indiquant que l'utilisateur a été mis à jour avec succès.
     * @throws NotFoundException si aucun utilisateur n'est trouvé avec l'identifiant fourni.
     */

    async updateUser(id: number, body: { firstName?: string; lastName?: string }) {

        const user = await this.findOne(id);

        if (body.firstName) {
            user.firstName = body.firstName;
        }

        if (body.lastName) {
            user.lastName = body.lastName;
        }

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} updated successfully` };
    }
    
    /**
     * Supprime un utilisateur de la base de données en fonction de son identifiant.
     * @param id - L'identifiant de l'utilisateur à supprimer.
     * @return Un message de succès indiquant que l'utilisateur a été supprimé avec succès.
     * @throws NotFoundException si aucun utilisateur n'est trouvé avec l'identifiant fourni.
     */

    async deleteUser(id: number) {

        const user = await this.findOne(id);

        if (!user) {
            throw new NotFoundException("User not found");
        }

        await this.usersRepository.remove(user);

        return { message: `User ${user.firstName} ${user.lastName} deleted successfully` };
    }

    
    /**
     * Crée un nouvel utilisateur dans la base de données avec les informations fournies.
     * @param firstName - Le prénom de l'utilisateur à créer.  
     * @param lastName - Le nom de famille de l'utilisateur à créer.
     * @param email - L'adresse e-mail de l'utilisateur à créer.
     * @param password - Le mot de passe de l'utilisateur à créer.
     * @returns Un objet User représentant l'utilisateur créé.
    */
   
    async createUser(firstName: string, lastName: string, email: string, password: string) {

        const existingUser = await this.findUserByEmail(email);

        if (existingUser) {
            throw new BadRequestException("Email already in use");
        }

        const user = this.usersRepository.create({
                firstName, 
                lastName,
                email,
                password
            });

        await this.usersRepository.save(user);

        return user;
    }
    
    /**
     * Met à jour les informations de connexion d'un utilisateur existant, telles que l'adresse e-mail et le mot de passe.
     * @param id - L'identifiant de l'utilisateur à mettre à jour.
     * @param email - La nouvelle adresse e-mail de l'utilisateur.
     * @param password - Le nouveau mot de passe de l'utilisateur.
     * @returns Un objet User représentant l'utilisateur mis à jour.
     */

    async updateUserCredentials(id: number, email: string,  newPassword: string) {
        
        const user = await this.findOne(id);

        const existing = await this.findUserByEmail(email);

        if (existing && existing.id !== id) {
            throw new BadRequestException("Email already in use");
        }

        user.email = email;
        user.password = newPassword;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} credentials updated successfully` };
    }

    /**
    * Récupère un utilisateur en fonction de son adresse e-mail.
    * @param email - L'adresse e-mail de l'utilisateur à récupérer.
    * @return Un objet User représentant l'utilisateur trouvé.
    * @throws NotFoundException si aucun utilisateur n'est trouvé avec l'adresse e-mail fournie.
    */

    async findUserByEmail(email: string) {

        const user = await this.usersRepository.findOne({ where: { email } });

        return user;
    }

    /**
     * Approuve un utilisateur en mettant à jour son statut dans la base de données.
     * @param id - L'identifiant de l'utilisateur à approuver.
     * @return Un message de succès indiquant que l'utilisateur a été approuvé avec succès.
     * @throws NotFoundException si aucun utilisateur n'est trouvé avec l'identifiant fourni.
     * @throws BadRequestException si l'utilisateur est déjà approuvé.
     */

    async approveUser(id: number) {

        const user = await this.findOne(id);

        if (user.status === UserStatus.APPROVED) {
            throw new BadRequestException("User is already approved");
        }

        user.status = UserStatus.APPROVED;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} approved successfully` };
    }

    /**
     * Rejette un utilisateur en mettant à jour son statut dans la base de données.
     * @param id - L'identifiant de l'utilisateur à rejeter.
     * @return Un message de succès indiquant que l'utilisateur a été rejeté avec succès.
     * @throws NotFoundException si aucun utilisateur n'est trouvé avec l'identifiant fourni.
     * @throws BadRequestException si l'utilisateur est déjà rejeté.
     */

    async rejectUser(id: number) {

        const user = await this.findOne(id);

        if (user.status === UserStatus.REJECTED) {
            throw new BadRequestException("User is already rejected");
        }

        user.status = UserStatus.REJECTED;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} rejected successfully` };
    }

    async setUserRoleAndHourlyRate(id: number, body: { role: UserRole, hourlyRate: number }) {

        const user = await this.findOne(id);

        user.role = body.role;
        user.hourlyRate = body.hourlyRate;

        await this.usersRepository.save(user);

        return { message: `User ${user.firstName} ${user.lastName} role and hourly rate updated successfully` };
    }
    
    async createInitialManager() {
        const existing = await this.usersRepository.findOne({
            where: { email: 'manager@test.com' },
        });

        if (existing) return;

        const password = 'password123';

        const salt = randomBytes(8).toString("hex");

        const hash = (await scrypt(password, salt, 32)) as Buffer;

        const hashedPassword = `${salt}:${hash.toString('hex')}`;

        const manager = await this.usersRepository.create({
            firstName: 'Manager',
            lastName: 'Test',
            email: 'manager@test.com',
            password: hashedPassword,
            role: UserRole.MANAGER,
            isActive: true,
            status: UserStatus.APPROVED,
        });

        await this.usersRepository.save(manager);

        return manager;
    }
}