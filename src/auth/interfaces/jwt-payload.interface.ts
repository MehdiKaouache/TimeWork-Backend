/**
 * Defines the structure of the data encoded within the JWT.
 */
export interface JwtPayload {
  sub: number;             // The User ID (subject)
  email: string;           // User's email address
  role: string;            // User's assigned role
  employeeNumber: string;  // Generated employee identifier
  iat?: number;            // Issued at (automatic)
  exp?: number;            // Expiration (automatic)
}