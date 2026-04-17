import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';

@Injectable()
export class DateFormatInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(data => this.formatDates(data))
    );
  }

  private formatDates(obj: any): any {
    
    if (obj === null || typeof obj !== 'object') return obj;

    for (const key in obj) {
      if (obj[key] instanceof Date || (!isNaN(Date.parse(obj[key])) && typeof obj[key] === 'string' && key.toLowerCase().includes('date'))) {
      obj[key] = this.formatDate(new Date(obj[key]));
      } else if (typeof obj[key] === 'object') {
        this.formatDates(obj[key]);
      }
    }
    return obj;
  }

  private formatDate(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }
}