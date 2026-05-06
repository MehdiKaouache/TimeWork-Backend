import { promisify } from 'util';
import { scrypt as _scrypt, randomBytes } from 'crypto';

const scrypt = promisify(_scrypt);

export class HashUtils {

    /**
     * Hashes a value using scrypt and a 16-byte salt.
     * @param value - The plain text value to hash
     * @returns A string containing the salt and the hash separated by a colon
    */
    static async hashValue(password: string): Promise<string> {
        const salt = randomBytes(8).toString('hex');
        const hash = (await scrypt(password, salt, 32)) as Buffer;
        return `${salt}:${hash.toString('hex')}`;
    }

    /**
    * Verifies a plain text value against a stored hash.
    * @param value - The plain text value to verify
    * @param storedHash - The stored string containing the salt and hash
    * @returns Boolean indicating if the value matches the hash
    */
static async verifyHash(hashFromDb: string, plainPassword: string): Promise<boolean> {
    const [salt, storedHash] = hashFromDb.split(':');
    const hash = (await scrypt(plainPassword, salt, 32)) as Buffer;
    return storedHash === hash.toString('hex');
}
}