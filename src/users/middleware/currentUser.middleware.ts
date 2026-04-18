import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';

/**
 * Augmenting the Express Request interface.
 * This adds 'session' and 'currentUser' to the type definitions 
 * so TypeScript recognizes them across your project.
 */
declare module 'express' {
  interface Request {
    session?: {
      userId?: number;
    };
    currentUser?: User;
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Now TypeScript knows exactly what 'session' and 'userId' are
    const userId = req.session?.userId;

    if (userId) {
      try {
        const user = await this.usersService.findOne(userId);
        req.currentUser = user;
      } catch (err) {
        // Silent catch: if user is not found, we simply don't set currentUser
      }
    }

    next();
  }
}