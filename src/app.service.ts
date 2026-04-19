import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {

  getHello(): string {
    return 'TimeWork API is running smoothly!';
  }

  getAppVersion(): string {
    return '2.1.0';
  }
}