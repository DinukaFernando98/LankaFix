# LankaFix

Sri Lanka's civic issue reporting platform. Report, track, and resolve local issues with your community.

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/) + MySQL (Railway)
- [NextAuth v5](https://authjs.dev/)
- [Framer Motion](https://www.framer-motion.com/)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3006](http://localhost:3006) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm start` | Start the production server |
| `npm run lint` | Lint the codebase |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed departments, categories & admin accounts |
| `npm run db:seed-test` | Seed 100 test users and 100 complaints |
| `npm run db:studio` | Open Prisma Studio |

## Project Structure

```
src/
  app/          # Next.js App Router pages and layouts
  components/   # Reusable UI components
  lib/          # Utility functions and shared logic
  types/        # TypeScript type definitions
prisma/
  schema.prisma # Database schema
  seed.ts       # Department/admin seed
  seed-test.ts  # Test data seed (100 users + 100 complaints)
```

## Admin Portal

The admin portal is accessible at [http://localhost:3006/admin](http://localhost:3006/admin).

Unauthenticated users see the admin sign-in form directly at `/admin`. Regular users are redirected to the homepage.

### Admin Accounts

All admin passwords: **`Admin@1234`**

| Email | Role |
|-------|------|
| `admin@lankafix.lk` | System Admin — full access to all departments |
| `roads.highways.admin@lankafix.lk` | Roads & Highways |
| `electrical.department.admin@lankafix.lk` | Electrical Department |
| `drainage.department.admin@lankafix.lk` | Drainage Department |
| `waste.management.admin@lankafix.lk` | Waste Management |
| `environmental.department.admin@lankafix.lk` | Environmental Department |
| `water.board.admin@lankafix.lk` | Water Board |
| `municipal.services.admin@lankafix.lk` | Municipal Services |
| `general.administration.admin@lankafix.lk` | General Administration |

### Test User Accounts

Created by `npm run db:seed-test`. All test users share the password: **`Test@1234`**

Email format: `{firstname}.{lastname}{number}@testuser.lk`
