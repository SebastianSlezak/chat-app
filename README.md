# Task Management System

Modern task management application built with Nuxt 4, Drizzle ORM, and PostgreSQL.

## Features

- 👤 User authentication with JWT and role-based access control
- 📊 Project and task management
- 💬 Real-time comments and notifications
- 🔔 Asynchronous notification processing with RabbitMQ
- 📱 Responsive design with Tailwind CSS
- 📚 Complete OpenAPI/Swagger documentation
- 🔒 Secure password hashing with bcrypt

## Tech Stack

### Backend
- **Nuxt 4**: Modern full-stack framework with excellent TypeScript support and server API
- **Drizzle ORM**: Type-safe, lightweight ORM with excellent PostgreSQL support
- **PostgreSQL**: Robust relational database in 3NF
- **RabbitMQ**: Message broker for asynchronous task processing
- **JWT**: Secure token-based authentication

### Frontend
- **Nuxt 4**: Vue 3 with auto-imports and server-side rendering
- **Tailwind CSS**: Utility-first CSS framework
- **Pinia**: State management
- **VueUse**: Composition utilities

### Justification
- **Nuxt 4** offers unified backend/frontend development with excellent DX, automatic code splitting, and SSR
- **Drizzle** provides type-safety without code generation overhead, perfect for rapid development
- **PostgreSQL** ensures ACID compliance and complex relationship management
- **RabbitMQ** enables reliable async processing for notifications and heavy operations

## Prerequisites

- Node.js 20+
- Docker and Docker Compose (for PostgreSQL and RabbitMQ)
- pnpm (recommended) or npm

## Installation

1. Clone repository:
```bash
git clone <repository-url>
cd task-management-system
