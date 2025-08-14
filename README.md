# H-Sales Bot

A comprehensive sales bot management system with backend API and frontend administration panel.

## 🎯 Project Overview

H-Sales Bot is a Next.js application that provides a complete solution for managing sales bots. The system includes:

- **Backend API**: RESTful API for bot operations and data management
- **Frontend Admin Panel**: Web interface for bot configuration and monitoring
- **Database**: Supabase integration for data persistence and real-time features
- **Message System**: Library for handling bot communications

## 🏗️ Architecture

```
h-sales-bot/
├── app/                    # Next.js App Router
├── components/             # Reusable UI components
├── lib/                    # Core libraries
│   ├── supabase/          # Database client and types
│   └── messages/          # Message handling system
└── specs/                 # Project specifications
```

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: SASS with CSS variables
- **Database**: Supabase (PostgreSQL)
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Architecture**: Kebab-case naming convention

## 📋 Features

### Backend
- RESTful API endpoints
- Database operations with Supabase
- Authentication and authorization
- Real-time data synchronization

### Frontend
- Admin dashboard for bot management
- Message configuration interface
- Real-time monitoring
- Responsive design

### Core Functionality
- Bot message management
- User authentication
- Data persistence
- Real-time updates

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account

### Setup
1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Run development server: `pnpm dev`

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📚 Documentation

- [Project Specifications](./specs/) - Detailed implementation specs
- [Supabase TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support) - Database integration guide

## 🔄 Development Workflow

1. Review specifications in `/specs/`
2. Implement features following kebab-case naming
3. Use SASS with CSS variables for styling
4. Generate Supabase types: `pnpm generate-types`
5. Test and deploy

## 📝 License

This project is part of the Henry Sales Bot initiative.
