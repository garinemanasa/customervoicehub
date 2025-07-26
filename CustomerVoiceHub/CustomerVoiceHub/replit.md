# FeedbackFlow - Customer Feedback Collection Platform

## Overview

FeedbackFlow is a modern web application that enables business owners to collect customer feedback through QR codes. Customers can share their experiences via video, audio, or text feedback through an interactive AI avatar interface. The platform provides comprehensive analytics and management tools for business owners to track and respond to customer feedback.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a full-stack TypeScript architecture with a clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

## Key Components

### Database Schema
- **Users Table**: Stores user profile information from Replit Auth
- **Stores Table**: Business locations with QR codes and metadata
- **Feedback Table**: Customer feedback entries with ratings, media, and text
- **Sessions Table**: Session storage for authentication

### Authentication System
- Replit Auth integration with passport.js
- OIDC-based authentication flow
- Session-based user management
- Automatic user profile synchronization

### File Upload System
- Multer middleware for handling video/audio uploads
- 50MB file size limit
- MIME type validation for media files
- Local file storage with organized directory structure

### QR Code Generation
- Dynamic QR code creation for each store
- Base64 encoded QR codes stored in database
- Downloadable QR code images
- Deep linking to feedback collection pages

## Data Flow

### Customer Feedback Flow
1. Customer scans QR code from physical store location
2. Redirected to feedback collection page with store context
3. AI avatar guides customer through feedback options
4. Customer selects feedback type (video, audio, or text)
5. Feedback captured and uploaded to server
6. Confirmation sent to customer

### Store Owner Dashboard Flow
1. Owner authenticates via Replit Auth
2. Dashboard loads with aggregated statistics
3. Real-time feedback monitoring and management
4. QR code generation and download capabilities
5. Feedback analytics and reporting

### Media Processing Flow
- Video/audio files uploaded via multipart form data
- Server validates file types and sizes
- Files stored with unique identifiers
- Metadata stored in database with file references

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations and migrations
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/**: Accessible UI component primitives
- **qrcode**: QR code generation library
- **multer**: File upload handling
- **passport**: Authentication middleware
- **openid-client**: OIDC authentication

### Development Dependencies
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Production JavaScript bundling
- **tailwindcss**: Utility-first CSS framework

## Deployment Strategy

### Development Environment
- Vite dev server for frontend with HMR
- tsx for running TypeScript server code
- Integrated development with Replit environment
- Database migrations via Drizzle Kit

### Production Build Process
1. Frontend built with Vite to static assets
2. Backend bundled with esbuild for Node.js execution
3. Environment variables for database and authentication
4. Session storage configured for production PostgreSQL

### Database Management
- PostgreSQL database (Neon serverless recommended)
- Drizzle migrations for schema management
- Connection pooling for scalability
- Environment-based configuration

The application is designed to run efficiently on Replit's infrastructure while maintaining compatibility with standard Node.js hosting environments.