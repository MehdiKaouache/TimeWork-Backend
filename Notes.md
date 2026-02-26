Installer des librairies : npm install @nestjs/typeorm sqlite3

Ajouter import { TypeOrmModule } from '@nestjs/typeorm'; au module principal pour qu'il soit utilisé dans toute l'application

Ajouter ces propriéteé a TypeOrmModule.forRoot(
    {
      type: "sqlite",
      database: "db.sqlite", ** base de données temporaires
      entities: [Rajouter les entités qu'on doit utiliser],
      synchronize: true,
    }
  )

typeorm c'est ce qui perment de communiquer avec une base de données

On a crée une entité et dans service on vas appeler la base de donnée pour faire des opérations avec l'utilisateur avec : @InjectRepository(User) private userRepository: Repository<User>

Utiliser SQLite extension VSCode pour voir la base de données


Installation a faire pour utiliser les cookies : npm install cookie-session @types/cookie-session