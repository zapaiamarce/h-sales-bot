# H-Sales Bot

Sales bot management system with backend API and admin frontend.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: SASS with CSS variables
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **Package Manager**: pnpm

## 🏗️ Architecture

```
h-sales-bot/
├── app/                    # Next.js App Router
├── components/             # UI components
├── lib/                    # Core libraries
│   ├── supabase/          # Database client
│   └── messages/          # Message system
└── specs/                 # Project specs
```

## 🛠️ Quick Start

1. Clone repository
2. `pnpm install`
3. Set environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. `pnpm dev`

## 📚 Docs

- [Specifications](./specs/) - Implementation details
- [Supabase TypeScript](https://supabase.com/docs/reference/javascript/typescript-support) - Database guide
