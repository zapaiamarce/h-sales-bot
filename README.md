# H-Sales Bot Workspace

A pnpm workspace for the H-Sales Bot project with separated applications and packages.

## Structure

```
h-sales-bot/
├── apps/
│   └── web/              # Next.js web application
├── packages/
│   ├── agents/           # Future: AI agents logic
│   ├── memory/           # Future: Memory management
│   ├── core/             # Future: Core utilities
│   └── types/            # Future: Shared types
└── specs/                # Project specifications
```

## Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Configure environment variables:

```bash
# Copy the example file
cp apps/web/.env.example apps/web/.env.local

# Edit with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Start development server:

```bash
pnpm dev
```

## Development

### Available Scripts

- `pnpm dev` - Start web app development server
- `pnpm build` - Build web app for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linting
- `pnpm clean` - Clean all node_modules

### Workspace Commands

- `pnpm --filter web dev` - Run web app only
- `pnpm --filter web build` - Build web app only

## Architecture

### Apps

- **web**: Next.js application with Supabase integration

### Future Packages

- **agents**: AI agents logic and management
- **memory**: Memory management and persistence
- **core**: Core utilities and shared functionality
- **types**: Shared TypeScript types

## Environment Variables

Create `apps/web/.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Notes

- Uses CSS variables instead of SASS variables
- Follows kebab-case naming convention
- No Turbo or complex monorepo setup
- Simple pnpm workspace structure
