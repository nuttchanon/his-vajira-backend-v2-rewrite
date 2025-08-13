# HIS Backend v2 - Microservice Architecture

A modern, scalable backend system for Hospital Information System (HIS) built with NestJS, Moleculer, MongoDB, and Redis.

## 🏗️ Architecture Overview

This project implements a **microservice architecture** with the following key components:

- **Framework**: NestJS (for controllers and dependency injection) + Moleculer (for microservices)
- **Database**: MongoDB with Typegoose ODM
- **Caching**: Redis for performance optimization
- **Message Broker**: NATS for inter-service communication
- **Real-time**: Socket.io integration
- **Standards**: FHIR/HL7 compliant data models

## 📁 Project Structure

```
new-backend/
├── packages/
│   └── shared/                 # Shared utilities and types
│       ├── src/
│       │   ├── entities/       # Base entities and FHIR types
│       │   ├── dto/           # Data transfer objects
│       │   ├── enums/         # Enumerations
│       │   └── utils/         # Utility functions
│       └── package.json
├── services/
│   ├── api-gateway/           # API Gateway service
│   ├── patient-service/       # Patient management service
│   └── auth-service/          # Authentication service
├── scripts/
│   └── mongo-init.js          # MongoDB initialization
├── docker-compose.yml         # Development environment
├── package.json              # Root package.json
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd new-backend

# Copy environment variables
cp env.example .env

# Install dependencies
npm install
```

### 2. Start Development Environment

```bash
# Start all services with Docker Compose
npm run docker:up

# Install dependencies and build
npm run setup

# Start development servers
npm run dev
```

### 3. Access Services

- **API Gateway**: http://localhost:3001
- **Patient Service**: http://localhost:3002
- **Auth Service**: http://localhost:3003
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **NATS**: localhost:4222

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start all services in development mode
npm run start:dev        # Start with Docker services

# Building
npm run build           # Build all packages and services
npm run clean           # Clean build artifacts

# Testing
npm run test            # Run all tests
npm run test:coverage   # Run tests with coverage

# Linting
npm run lint            # Lint all code
npm run lint:fix        # Fix linting issues

# Docker
npm run docker:up       # Start Docker services
npm run docker:down     # Stop Docker services
npm run docker:logs     # View Docker logs
```

### Adding a New Service

1. Create a new directory in `services/`
2. Copy the structure from `patient-service/`
3. Update `package.json` with service-specific dependencies
4. Add service to `docker-compose.yml`
5. Update API Gateway routes

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **JSDoc**: Documentation for public methods
- **FHIR Compliance**: All healthcare entities follow FHIR standards

## 📊 Data Models

### FHIR-Compliant Entities

- **Patient**: Complete patient demographic information
- **Encounter**: Healthcare encounters and visits
- **ServiceRequest**: Orders and requests (lab, imaging, etc.)
- **BaseEntity**: Common fields for all entities

### Key Features

- **Audit Trail**: Automatic tracking of changes
- **Multi-tenancy**: Support for multiple organizations
- **Soft Deletes**: Data preservation with active/inactive status
- **Indexing**: Optimized database queries
- **Validation**: Comprehensive input validation

## 🔐 Authentication & Authorization

- **JWT-based** authentication
- **Role-based** access control
- **Permission-based** authorization
- **API Gateway** handles authentication centrally

## 🚀 Performance Features

- **Redis Caching**: Multi-layer caching strategy
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **Load Balancing**: Service discovery and load distribution

## 📈 Monitoring & Observability

- **Health Checks**: Service health monitoring
- **Metrics**: Prometheus metrics collection
- **Logging**: Structured logging with correlation IDs
- **Error Handling**: Comprehensive error management

## 🧪 Testing Strategy

- **Unit Tests**: 90%+ coverage requirement
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Critical workflow testing
- **Performance Tests**: Load testing capabilities

## 🐳 Deployment

### Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Production

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Configuration

### Environment Variables

Key configuration options in `.env`:

```bash
# Database
MONGODB_URI=mongodb://admin:password123@localhost:27017/his

# Redis
REDIS_URI=redis://:redis123@localhost:6379

# NATS
NATS_URI=nats://localhost:4222

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Services
API_GATEWAY_PORT=3001
PATIENT_SERVICE_PORT=3002
AUTH_SERVICE_PORT=3003
```

## 📚 API Documentation

- **Swagger UI**: Available at `/api/v2/docs` when services are running
- **OpenAPI Spec**: Auto-generated from code annotations
- **Postman Collection**: Available in `/docs/postman/`

## 🤝 Contributing

1. Follow the established code standards
2. Write comprehensive tests
3. Update documentation
4. Use conventional commit messages
5. Create feature branches

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For questions and support:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ by Ever Medical Technologies**
