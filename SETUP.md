# AI Content Writer - Setup Guide

## Project Infrastructure

This project has been set up with all required dependencies and configurations.

## Installed Packages

### Core Dependencies
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Component library

### Authentication & Database
- **Better Auth** - Authentication system
- **Prisma** - ORM for database operations
- **@prisma/client** - Prisma client for queries

### AI & Content Generation
- **@langchain/langgraph** - AI workflow orchestration
- **OpenAI API** (configured via env) - LLM for content generation

### Rich Text Editor
- **@tiptap/react** - Rich text editor framework
- **@tiptap/starter-kit** - Basic editor extensions
- **@tiptap/extension-image** - Image support

### Data Visualization
- **Recharts** - Chart library for graphs

### Animation
- **GSAP** - Animation library
- **@gsap/react** - GSAP React integration

### State Management & Data Fetching
- **@tanstack/react-query** - Server state management
- **Zod** - Schema validation

### UI Components
- **lucide-react** - Icon library

### Testing
- **Vitest** - Test runner
- **@testing-library/react** - React component testing
- **@testing-library/jest-dom** - DOM matchers
- **fast-check** - Property-based testing

## Configuration

### TypeScript
- Configured with path aliases (`@/*` → `./src/*`)
- Strict mode enabled
- Located in `tsconfig.json`

### Environment Variables
- Environment validation configured in `src/lib/env.ts`
- Example file: `.env.example`
- Required variables:
  - `DATABASE_URL` - PostgreSQL connection string
  - `BETTER_AUTH_SECRET` - Authentication secret (min 32 chars)
  - `BETTER_AUTH_URL` - Application URL
  - `OPENAI_API_KEY` - OpenAI API key
  - `SEARCH_API_KEY` - Web search API key
  - `UPLOAD_BUCKET_URL` - (Optional) File upload storage URL

### Testing
- Vitest configured with jsdom environment
- Test setup file: `src/test/setup.ts`
- Configuration: `vitest.config.ts`
- Run tests: `npm test`
- Watch mode: `npm run test:watch`

### Prisma
- Initialized with PostgreSQL
- Schema location: `prisma/schema.prisma`
- Configuration: `prisma.config.ts`

## Directory Structure

```
src/
├── app/                    # Next.js app router pages
├── components/
│   ├── landing/           # Landing page components
│   ├── auth/              # Authentication components
│   ├── dashboard/         # Dashboard components
│   ├── editor/            # Rich text editor components
│   ├── agent/             # AI agent interface components
│   └── graphs/            # Graph/chart components
├── lib/
│   ├── api/               # API utilities
│   ├── db/                # Database utilities
│   ├── env.ts             # Environment validation
│   └── utils.ts           # Utility functions
├── test/
│   └── setup.ts           # Test configuration
└── __tests__/
    ├── unit/              # Unit tests
    └── properties/        # Property-based tests
```

## Next Steps

1. **Configure Database**: Update `DATABASE_URL` in `.env` with your Neon PostgreSQL connection string
2. **Set API Keys**: Add your OpenAI and search API keys to `.env`
3. **Generate Auth Secret**: Run `openssl rand -base64 32` and add to `BETTER_AUTH_SECRET`
4. **Create Prisma Schema**: Define your data models in `prisma/schema.prisma`
5. **Run Migrations**: Execute `npx prisma migrate dev` to create database tables

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI

## Verification

All packages are installed and TypeScript compilation is working correctly. The test suite is configured and passing.
