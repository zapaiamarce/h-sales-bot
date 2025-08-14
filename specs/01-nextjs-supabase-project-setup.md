# Spec 01: Next.js Project Setup with Supabase Integration

## Overview

Create a simple Next.js project with Supabase integration, SASS styling, and kebab-case architecture. The project will include a messages library that connects to Supabase for data management.

## Project Requirements

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: SASS (no Tailwind CSS)
- **Database**: Supabase
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Architecture**: Simple, kebab-case naming convention

### Architecture Guidelines

- Use kebab-case for all folders and files
- Simple folder structure
- CSS variables instead of SASS variables
- No Tailwind CSS

## Project Structure

```
h-sales-bot/
├── app/
│   ├── globals.scss
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── types.ts
│   └── messages/
│       ├── types.ts
│       └── service.ts
├── specs/
│   └── 01-nextjs-supabase-project-setup.md
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## Implementation Steps

### 1. Initialize Next.js Project

```bash
pnpm create next-app@latest h-sales-bot --typescript --tailwind=false --eslint=true --app --src-dir=false --import-alias="@/*"
```

### 2. Install Dependencies

```bash
pnpm add @supabase/supabase-js
pnpm add -D sass @types/node
```

### 3. Configure SASS

- Create `app/globals.scss` with CSS variables
- Configure Next.js to use SASS
- Set up CSS variables for theming

### 4. Supabase Setup

#### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Supabase Client Configuration

- Create `lib/supabase/client.ts` for Supabase client initialization
- Set up TypeScript types generation

#### Type Generation Script

Add to `package.json`:

```json
{
  "scripts": {
    "generate-types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts"
  }
}
```

### 5. Messages Library

#### Database Schema

Create tables in Supabase:

```sql
-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON messages
  FOR DELETE USING (auth.uid() = user_id);
```

#### Messages Service

Create `lib/messages/service.ts` with CRUD operations:

- `getMessages()` - Fetch user messages
- `createMessage(content: string)` - Create new message
- `updateMessage(id: string, content: string)` - Update message
- `deleteMessage(id: string)` - Delete message

#### Types

Create `lib/messages/types.ts` with TypeScript interfaces:

```typescript
export interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageData {
  content: string;
}

export interface UpdateMessageData {
  content: string;
}
```

### 6. Component Structure

#### UI Components

Create reusable components in `components/ui/`:

- `message-card.tsx` - Individual message display
- `message-form.tsx` - Message creation/editing form
- `message-list.tsx` - List of messages

### 7. Main Page Implementation

Create `app/page.tsx` with:

- Message list display
- Message creation form
- Real-time updates using Supabase subscriptions

### 8. Styling with SASS

#### Global Styles (`app/globals.scss`)

```scss
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --background-color: #ffffff;
  --text-color: #333333;
  --border-color: #dee2e6;
  --success-color: #28a745;
  --error-color: #dc3545;
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

body {
  color: var(--text-color);
  background: var(--background-color);
}

a {
  color: inherit;
  text-decoration: none;
}
```

## Configuration Files

### next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    includePaths: ["./app"],
  },
};

module.exports = nextConfig;
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "generate-types": "supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts"
  }
}
```

## Development Workflow

### 1. Setup Environment

1. Create Supabase project
2. Get project URL and anon key
3. Add environment variables
4. Run `pnpm generate-types` to generate TypeScript types

### 2. Database Setup

1. Execute SQL schema in Supabase SQL editor
2. Configure RLS policies
3. Test authentication flow

### 3. Development

1. Run `pnpm dev` for development server
2. Implement components following kebab-case naming
3. Use SASS for styling with CSS variables
4. Test Supabase integration

## Testing Strategy

### Manual Testing

- Message CRUD operations
- Real-time updates
- Authentication flow
- Responsive design

### Type Safety

- TypeScript compilation
- Generated Supabase types
- Component prop validation

## Deployment Considerations

### Environment Variables

- Production Supabase credentials
- Next.js build optimization
- Static asset optimization

### Build Process

- Type generation before build
- SASS compilation
- TypeScript compilation
- Next.js optimization

## Success Criteria

- [ ] Next.js project runs without errors
- [ ] SASS styling works with CSS variables
- [ ] Supabase connection established
- [ ] Message CRUD operations functional
- [ ] TypeScript types generated and working
- [ ] Kebab-case naming convention followed
- [ ] No Tailwind CSS dependencies
- [ ] Simple, clean architecture implemented

## Notes

- Use CSS variables instead of SASS variables as per workspace rules
- Avoid running `next build` during development (use `next dev`)
- Follow kebab-case for all file and folder names
- Keep architecture simple and maintainable
- Generate types regularly when database schema changes
