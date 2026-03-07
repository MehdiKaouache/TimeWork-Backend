import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { AdminsController } from './users/controllers/admins/admins.controller';

@Module({
  imports: [TypeOrmModule.forRoot(
    {
      type: "sqlite",
      database: "db.sqlite",
      entities: [User],
      synchronize: true,
    }
  ), UsersModule, ReportsModule ],
  controllers: [AppController, AdminsController],
  providers: [AppService],
})
export class AppModule {}
