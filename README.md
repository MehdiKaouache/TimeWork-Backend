# TimeWork – Backend (API)

API REST d'une application de **gestion des horaires de travail** pour les entreprises. Projet réalisé en équipe de 3 dans le cadre du cours de développement d'applications Web (Cégep Marie-Victorin, hiver 2026).

Le frontend React se trouve dans le dépôt [TimeWork-Frontend](https://github.com/KersenJ-Project/TimeWork-Frontend).

## Ce que fait l'application

Chaque entreprise cliente dispose de son propre espace, avec trois types d'utilisateurs :

| Rôle | Ce qu'il peut faire |
|---|---|
| **Super-admin** | Créer, modifier et supprimer les entreprises clientes |
| **Gérant / assistant-gérant** | Créer les horaires et les quarts de travail, suivre les disponibilités, approuver ou refuser les demandes de congé |
| **Employé** | Consulter ses quarts, saisir ses disponibilités, faire une demande de congé, pointer |

## Technologies

- **NestJS** (Node.js) et **TypeScript**
- **TypeORM** avec **SQLite**
- Authentification par **JWT** (jeton d'accès et jeton de rafraîchissement)

## Architecture

L'API est découpée en modules : `Users`, `Auth`, `Availability`, `LeaveRequest`, `Shift`, `Schedule`, `SuperAdmin`. Chaque module sépare trois couches :

- **Entities** : tables de la base de données et relations
- **Controllers** : points d'entrée de l'API, validation des données (DTO) et contrôle des rôles
- **Services** : logique métier et accès aux données

## Sécurité

- Guards d'authentification et de rôles sur les routes protégées
- Mots de passe hachés avec **bcrypt**
- Validation stricte des données entrantes (`ValidationPipe` avec `whitelist`)
- **Helmet** et **CORS** configurés
- Secrets stockés dans un fichier `.env` non versionné

## Routes principales

| Contrôleur | Exemples |
|---|---|
| `/auth` | `signup`, `signin`, `refresh`, `logout`, `forgot-password`, `whoami` |
| `/availability` | disponibilités de l'utilisateur ou de toute l'équipe |
| `/leave-request` | créer, approuver ou refuser une demande de congé |
| `/schedules` | créer et consulter les horaires |
| `/company` | consulter et modifier une entreprise |
| `/notifications` | consulter et marquer les notifications comme lues |

## Installation

<!-- À vérifier avant de publier : les scripts exacts dans package.json -->
```bash
git clone https://github.com/MehdiKaouache/TimeWork-Backend.git
cd TimeWork-Backend
npm install
```

Créez un fichier `.env` à la racine avec vos valeurs (secret JWT, etc.), puis lancez le serveur :

```bash
npm run start:dev
```

La base SQLite (`db.sqlite`) est créée à la racine du projet, sans serveur de base de données à installer.

## Équipe

Mehdi Kaouache, Anas Benguade et Nyle Kersen Joseph.
