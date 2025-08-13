# HIS Vajira Backend V2 - Rewrite

A modern, production-ready healthcare information system backend built with NestJS, TypeScript, and MongoDB.

## 🏗️ Architecture Overview

This project follows a **Domain-Driven Design (DDD)** approach with a **microservices architecture**. Each service is organized by domain rather than technical layers, promoting better maintainability and scalability.

### Key Architectural Patterns

- **Domain-Based Structure**: Services are organized by business domains (patient, diagnostic, eform, etc.)
- **Repository Pattern**: Robust data access layer with reusable base repository
- **NestJS Modular Architecture**: Proper dependency injection and module organization
- **Event-Driven Communication**: Inter-service communication via events
- **Audit Trail**: Comprehensive audit logging for all data changes

## 📁 Project Structure

```
his-vajira-backend-v2-rewrite/
├── packages/
│   └── shared/                    # Shared utilities and base classes
│       ├── src/
│       │   ├── repositories/
│       │   │   └── base.repository.ts    # Base repository with CRUD operations
│       │   ├── entities/
│       │   │   └── base.entity.ts        # Base entity with audit fields
│       │   ├── dto/
│       │   │   └── pagination.dto.ts     # Pagination DTOs
│       │   └── index.ts
├── services/                      # Microservices
│   ├── patient-service/           # Patient management domain
│   │   └── src/
│   │       ├── patient/           # Domain-specific folder
│   │       │   ├── patient.entity.ts
│   │       │   ├── patient.repository.ts
│   │       │   ├── patient.service.ts
│   │       │   ├── patient.controller.ts
│   │       │   ├── patient.module.ts
│   │       │   └── create-patient.dto.ts
│   │       └── app.module.ts
│   ├── diagnostic-service/        # Diagnostic management domain
│   │   └── src/
│   │       ├── diagnostic/        # Domain-specific folder
│   │       │   ├── diagnostic.entity.ts
│   │       │   ├── diagnostic.repository.ts
│   │       │   ├── diagnostic.service.ts
│   │       │   ├── diagnostic.controller.ts
│   │       │   ├── diagnostic.module.ts
│   │       │   └── create-diagnostic.dto.ts
│   │       └── app.module.ts
│   ├── eform-service/             # Electronic forms domain
│   │   └── src/
│   │       ├── eform/             # Domain-specific folder
│   │       │   ├── eform.entity.ts
│   │       │   ├── eform.repository.ts
│   │       │   ├── eform.service.ts
│   │       │   ├── eform.controller.ts
│   │       │   ├── eform.module.ts
│   │       │   └── create-eform.dto.ts
│   │       └── app.module.ts
│   ├── auth-service/              # Authentication & authorization
│   ├── encounter-service/         # Patient encounters
│   ├── financial-service/         # Financial management
│   ├── filestore-service/         # File storage
│   ├── messaging-service/         # Messaging system
│   ├── order-service/             # Order management
│   ├── inventory-service/         # Inventory management
│   ├── printing-service/          # Printing services
│   └── api-gateway/               # API Gateway
└── docker-compose.yml
```

## 🔧 Repository Pattern Implementation

### Base Repository

The `BaseRepository` class provides robust, reusable query functions with:

- **CRUD Operations**: Create, Read, Update, Delete with proper error handling
- **Pagination Support**: Built-in pagination with sorting and filtering
- **Audit Trail**: Automatic audit logging for all operations
- **Soft Delete**: Soft delete functionality with `active` flag
- **Query Builder**: Flexible query building with search and filter options

```typescript
// Example usage in a domain repository
@Injectable()
export class PatientRepository extends BaseRepository<Patient> {
  constructor() {
    const patientModel = getModelForClass(Patient);
    super(patientModel);
  }

  // Domain-specific methods
  async findByIdentifier(system: string, value: string): Promise<Patient | null> {
    return await this.findOne({
      'identifier.system': system,
      'identifier.value': value,
      active: true,
    });
  }
}
```

### Key Features

- **Production-Ready**: Comprehensive error handling and logging
- **Type-Safe**: Full TypeScript support with proper typing
- **Flexible**: Supports complex queries with pagination and filtering
- **Auditable**: Built-in audit trail for compliance requirements
- **Optimistic Locking**: Version control for concurrent updates

## 🏛️ NestJS Modular Architecture

Each service follows NestJS best practices with proper module organization:

### Domain Module Structure

```typescript
@Module({
  controllers: [PatientController],
  providers: [PatientService, PatientRepository],
  exports: [PatientService, PatientRepository],
})
export class PatientModule {}
```

### Service Layer

Services contain business logic and orchestrate operations:

```typescript
@Injectable()
export class PatientService {
  constructor(private readonly patientRepository: PatientRepository) {}

  async createPatient(createPatientDto: CreatePatientDto, context: any): Promise<Patient> {
    // Business logic here
    const savedPatient = await this.patientRepository.createPatient(createPatientDto, context);

    // Event emission for other services
    if (this.broker) {
      this.broker.emit('patient.created', {
        patientId: savedPatient._id,
        identifier: savedPatient.identifier[0]?.value,
      });
    }

    return savedPatient;
  }
}
```

### Controller Layer

Controllers handle HTTP requests with proper validation and documentation:

```typescript
@Controller('patients')
@ApiTags('Patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPatient(
    @Body() createPatientDto: CreatePatientDto,
    @Request() req: any
  ): Promise<Patient> {
    return await this.patientService.createPatient(createPatientDto, req);
  }
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB 6+

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

4. **Start the services**
   ```bash
   docker-compose up -d
   ```

### Development

1. **Start a specific service**

   ```bash
   cd services/patient-service
   npm run start:dev
   ```

2. **Run tests**

   ```bash
   npm run test
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

## 📊 API Documentation

Each service provides comprehensive API documentation via Swagger/OpenAPI:

- **Patient Service**: `http://localhost:3001/api-docs`
- **Diagnostic Service**: `http://localhost:3002/api-docs`
- **Eform Service**: `http://localhost:3003/api-docs`

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Fine-grained permission system
- **Audit Logging**: Complete audit trail for compliance
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against abuse

## 📈 Monitoring & Observability

- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Health Checks**: Built-in health check endpoints
- **Metrics**: Prometheus metrics for monitoring
- **Tracing**: Distributed tracing support

## 🧪 Testing Strategy

- **Unit Tests**: Service and repository layer testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow testing
- **Performance Tests**: Load testing for critical paths

## 🔄 Event-Driven Architecture

Services communicate via events for loose coupling:

```typescript
// Event emission
this.broker.emit('patient.created', {
  patientId: patient._id,
  identifier: patient.identifier[0]?.value,
});

// Event handling
this.broker.on('patient.created', data => {
  // Handle patient creation event
});
```

## 📝 Contributing

1. Follow the established domain-based structure
2. Use the repository pattern for data access
3. Implement proper error handling and logging
4. Add comprehensive tests
5. Update documentation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For support and questions, please contact the development team or create an issue in the repository.
