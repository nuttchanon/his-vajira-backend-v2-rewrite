# HIS Vajira Backend V2 - Rewrite

A modern, microservices-based Hospital Information System (HIS) backend built with NestJS, TypeScript, and MongoDB.

## 📚 Documentation

📖 **Complete documentation is available in the [docs/](./docs/) folder**, organized by workflow:

- 🚀 **[Development](./docs/development/)** - Setup, coding standards, and development workflows
- 🚢 **[Deployment](./docs/deployment/)** - Production deployment, CI/CD, and monitoring
- 🏗️ **[Architecture](./docs/architecture/)** - System design, patterns, and technical decisions
- 🔌 **[API](./docs/api/)** - API documentation, endpoints, and integration guides
- 🧪 **[Testing](./docs/testing/)** - Testing strategies, tools, and best practices
- 🔧 **[Troubleshooting](./docs/troubleshooting/)** - Common issues, debugging, and problem resolution
- 📖 **[Guides](./docs/guides/)** - Step-by-step tutorials and best practices

**Quick Start**: [Development Setup](./docs/development/) | [API Reference](./docs/api/) | [Troubleshooting](./docs/troubleshooting/)

## 🏗️ Architecture Overview

This project follows a **domain-driven design (DDD)** approach with a **microservices architecture**. Each service is organized by domain rather than technical layers, promoting better maintainability and scalability.

### Key Architectural Patterns

- **Domain-Based Structure**: Services are organized by business domains (patient, auth, diagnostic, etc.)
- **Repository Pattern**: Standardized data access layer with robust query capabilities
- **Module Pattern**: Proper NestJS dependency injection and modularity
- **Microservices**: Independent, scalable services communicating via Moleculer

## 📁 Project Structure

```
his-vajira-backend-v2-rewrite/
├── packages/
│   └── shared/                   # Shared utilities and base classes
│       ├── src/
│       │   ├── constants/        # Error codes, status codes
│       │   ├── dto/              # Base DTOs, pagination
│       │   ├── entities/         # Base entities, FHIR types
│       │   ├── enums/            # Common enums
│       │   ├── interfaces/       # Service interfaces
│       │   ├── repositories/     # Base repository pattern
│       │   └── utils/            # Utility functions
│       └── package.json
├── services/
│   ├── api-gateway/              # API Gateway service
│   ├── auth-service/             # Authentication & Authorization
│   │   └── src/
│   │       └── auth/             # Auth domain
│   ├── patient-service/          # Patient management
│   │   └── src/
│   │       └── patient/          # Patient domain
│   ├── diagnostic-service/       # Diagnostic codes management
│   │   └── src/
│   │       └── diagnostic/       # Diagnostic domain
│   ├── eform-service/            # Electronic forms management
│   │   └── src/
│   │       └── eform/            # Eform domain
│   ├── encounter-service/        # Patient encounters
│   │   └── src/
│   │       └── encounter/        # Encounter domain
│   ├── financial-service/        # Financial management
│   │   └── src/
│   │       └── financial/        # Financial domain
│   ├── inventory-service/        # Inventory management
│   │   └── src/
│   │       └── inventory/        # Inventory domain
│   ├── order-service/            # Order management
│   │   └── src/
│   │       └── order/            # Order domain
│   ├── messaging-service/        # Messaging system
│   │   └── src/
│   │       └── messaging/        # Messaging domain
│   ├── printing-service/         # Report printing
│   │   └── src/
│   │       └── printing/         # Printing domain
│   └── filestore-service/        # File storage
│   │   └── src/
│   │       └── filestore/        # File storage domain
│   └── app/        # Messaging domain
├── docker/                       # Docker configurations
├── scripts/                      # Build and deployment scripts
└── package.json
```

## 🔧 Core Components

### 1. Base Repository Pattern

The `BaseRepository` class in `packages/shared/src/repositories/base.repository.ts` provides:

- **CRUD Operations**: `findById`, `findAll`, `create`, `update`, `delete`
- **Pagination**: Built-in pagination with sorting and filtering
- **Error Handling**: Comprehensive error handling and logging
- **Audit Trail**: Automatic audit trail for all operations
- **Soft Delete**: Soft delete functionality with `active` flag

```typescript
// Example usage in a domain repository
export class PatientRepository extends BaseRepository<Patient> {
  constructor() {
    super(getModelForClass(Patient));
  }

  // Domain-specific methods
  async findByMRN(mrn: string): Promise<Patient | null> {
    return this.findOne({ mrn });
  }
}
```

### 2. Module Pattern

Each domain follows the NestJS module pattern:

```typescript
@Module({
  controllers: [PatientController],
  providers: [PatientService, PatientRepository],
  exports: [PatientService, PatientRepository],
})
export class PatientModule {}
```

### 3. Domain-Based Structure

Each service is organized by domain:

- **Controllers**: Handle HTTP requests
- **Services**: Business logic layer
- **Repositories**: Data access layer
- **Entities**: Domain models
- **DTOs**: Data transfer objects
- **Modules**: Dependency injection configuration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 5+
- Docker (optional)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd his-vajira-backend-v2-rewrite
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**

   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:5

   # Or install MongoDB locally
   ```

5. **Run services**

   ```bash
   # Run all services
   npm run dev

   # Run specific service
   npm run dev:patient
   npm run dev:auth
   ```

## 🏥 Services Overview

### Authentication Service (`auth-service`)

- User management and authentication
- JWT token handling
- Role-based access control
- Password management

### Patient Service (`patient-service`)

- Patient registration and management
- Patient search and filtering
- Medical record management
- Patient demographics

### Diagnostic Service (`diagnostic-service`)

- Diagnostic codes management
- ICD-10/ICD-11 support
- Diagnosis tracking
- Medical coding

### EForm Service (`eform-service`)

- Electronic forms management
- Form templates and workflows
- Data collection and validation
- Form versioning

### Encounter Service (`encounter-service`)

- Patient encounter management
- Visit tracking and scheduling
- Clinical documentation
- Encounter workflows

### Financial Service (`financial-service`)

- Financial transaction management
- Billing and invoicing
- Payment processing
- Financial reporting

### Inventory Service (`inventory-service`)

- Medical supplies management
- Stock tracking and alerts
- Supplier management
- Inventory optimization

### Order Service (`order-service`)

- Medical order management
- Order workflows and approvals
- Order tracking and status
- Clinical decision support

### Messaging Service (`messaging-service`)

- Internal messaging system
- Email and SMS integration
- Notification management
- Communication workflows

## 🔄 Recent Refactoring

### Completed Refactoring Tasks

1. **✅ Project Restructuring**
   - Reorganized from layer-based to domain-based architecture
   - Created standardized folder structure for all services
   - Implemented proper NestJS modular structure

2. **✅ Base Repository Implementation**
   - Created robust `BaseRepository` class with production-ready features
   - Implemented comprehensive CRUD operations
   - Added pagination, filtering, and error handling
   - Included audit trail and soft delete functionality

3. **✅ Service Refactoring**
   - **Financial Service**: Complete domain-based restructuring
   - **Inventory Service**: Full refactoring with proper entities and DTOs
   - **Order Service**: Comprehensive restructuring with order management
   - **Messaging Service**: Complete messaging system implementation

4. **✅ Module Pattern Implementation**
   - Created proper NestJS modules for all services
   - Implemented dependency injection correctly
   - Added proper exports and imports

### Key Improvements

- **Domain-Driven Design**: Each service now follows proper DDD principles
- **Separation of Concerns**: Clear separation between controllers, services, and repositories
- **Type Safety**: Full TypeScript implementation with proper types
- **Validation**: Comprehensive input validation using class-validator
- **Documentation**: Complete API documentation with Swagger
- **Error Handling**: Robust error handling and logging throughout
- **Audit Trail**: Automatic audit trail for all database operations

## 📊 Architecture Benefits

### Before Refactoring

- Layer-based structure (controllers/, services/, entities/)
- Inconsistent patterns across services
- Mixed concerns in single files
- Limited reusability

### After Refactoring

- Domain-based structure (patient/, auth/, diagnostic/)
- Consistent patterns across all services
- Clear separation of concerns
- High reusability with BaseRepository
- Proper NestJS modular architecture

## 🛠️ Development Guidelines

### Adding New Services

1. Create service directory structure:

   ```
   service-name/
   └── src/
       └── domain-name/
           ├── domain-name.controller.ts
           ├── domain-name.service.ts
           ├── domain-name.repository.ts
           ├── domain-name.module.ts
           ├── entity/
           │   └── domain-name.entity.ts
           └── dto/
               └── create-domain-name.dto.ts
   ```

2. Extend BaseRepository for data access
3. Implement proper validation with DTOs
4. Add comprehensive error handling
5. Include proper logging and audit trails

### Best Practices

- Always extend `BaseRepository` for new repositories
- Use proper TypeScript types and interfaces
- Implement comprehensive validation with class-validator
- Add proper error handling and logging
- Follow NestJS dependency injection patterns
- Include API documentation with Swagger decorators

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
