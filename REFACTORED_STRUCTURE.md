# Refactored Project Structure

This document outlines the complete refactoring of the HIS Vajira Backend V2 project to follow a domain-based architecture with proper NestJS modular structure and standardized data access layer.

## 🎯 Refactoring Goals Achieved

### ✅ 1. Domain-Based Architecture

- Reorganized from layer-based to domain-based structure
- Each service now has domain-specific folders
- All related files (controller, service, dto, entity) are grouped by domain

### ✅ 2. Base Repository Pattern

- Created robust `BaseRepository` class in `packages/shared/src/repositories/base.repository.ts`
- Provides production-ready CRUD operations with pagination and filtering
- Includes comprehensive error handling and audit trail

### ✅ 3. Repository Pattern Implementation

- All domain repositories now extend `BaseRepository`
- Proper separation of concerns between service and data access layers
- Domain-specific query methods in each repository

### ✅ 4. NestJS Module Pattern

- Created proper module files for each domain
- Correct dependency injection configuration
- Exported services and repositories for reuse

## 📁 Complete Refactored Structure

```
his-vajira-backend-v2-rewrite/
├── packages/
│   └── shared/                           # Shared utilities and base classes
│       ├── src/
│       │   ├── constants/
│       │   │   ├── error-codes.ts        # Error code constants
│       │   │   └── status-codes.ts       # HTTP status codes
│       │   ├── dto/
│       │   │   ├── base.dto.ts           # Base DTO with common fields
│       │   │   └── pagination.dto.ts     # Pagination DTOs
│       │   ├── entities/
│       │   │   ├── base.entity.ts        # Base entity with audit fields
│       │   │   └── fhir.types.ts         # FHIR-compliant types
│       │   ├── enums/
│       │   │   ├── gender.enum.ts        # Gender enums
│       │   │   └── status.enum.ts        # Status enums
│       │   ├── interfaces/
│       │   │   ├── cache.interface.ts    # Cache interface
│       │   │   ├── database.interface.ts # Database interface
│       │   │   └── service.interface.ts  # Service interface
│       │   ├── repositories/
│       │   │   └── base.repository.ts    # 🆕 Base repository pattern
│       │   ├── utils/
│       │   │   ├── cache.utils.ts        # Cache utilities
│       │   │   ├── date.utils.ts         # Date utilities
│       │   │   └── validation.utils.ts   # Validation utilities
│       │   └── index.ts                  # Export all modules
│       └── package.json
├── services/
│   ├── api-gateway/                      # API Gateway service
│   │   └── src/
│   │       ├── index.ts
│   │       └── services/
│   │           └── api-gateway.service.ts
│   ├── auth-service/                     # Authentication & Authorization
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── index.ts
│   │       └── auth/                     # Auth domain
│   │           ├── auth.controller.ts    # HTTP request handling
│   │           ├── auth.service.ts       # Business logic
│   │           ├── auth.repository.ts    # 🆕 Data access layer
│   │           ├── auth.module.ts        # 🆕 Dependency injection
│   │           ├── auth.dto.ts           # Data transfer objects
│   │           ├── user.entity.ts        # User domain model
│   │           └── jwt.strategy.ts       # 🆕 JWT authentication
│   ├── patient-service/                  # Patient management
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── index.ts
│   │       └── patient/                  # Patient domain
│   │           ├── patient.controller.ts # HTTP request handling
│   │           ├── patient.service.ts    # Business logic
│   │           ├── patient.repository.ts # 🆕 Data access layer
│   │           ├── patient.module.ts     # 🆕 Dependency injection
│   │           ├── entity/
│   │           │   └── patient.entity.ts # Patient domain model
│   │           └── dto/
│   │               └── create-patient.dto.ts # Data transfer objects
│   ├── diagnostic-service/               # Diagnostic codes management
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── index.ts
│   │       └── diagnostic/               # Diagnostic domain
│   │           ├── diagnostic.controller.ts
│   │           ├── diagnostic.service.ts
│   │           ├── diagnostic.repository.ts # 🆕 Data access layer
│   │           ├── diagnostic.module.ts  # 🆕 Dependency injection
│   │           ├── diagnostic.entity.ts
│   │           └── create-diagnostic.dto.ts
│   ├── eform-service/                    # Electronic forms management
│   │   └── src/
│   │       ├── app.module.ts
│   │       ├── index.ts
│   │       └── eform/                    # Eform domain
│   │           ├── eform.controller.ts
│   │           ├── eform.service.ts
│   │           ├── eform.repository.ts   # 🆕 Data access layer
│   │           ├── eform.module.ts       # 🆕 Dependency injection
│   │           ├── eform.entity.ts
│   │           └── create-eform.dto.ts
│   ├── encounter-service/                # Patient encounters
│   │   └── src/
│   │       ├── app.module.ts             # 🆕 App module
│   │       ├── index.ts
│   │       └── encounter/                # Encounter domain
│   │           ├── encounter.controller.ts
│   │           ├── encounter.service.ts
│   │           ├── encounter.repository.ts # 🆕 Data access layer
│   │           ├── encounter.module.ts   # 🆕 Dependency injection
│   │           ├── encounter.entity.ts
│   │           └── encounter.dto.ts
│   ├── financial-service/                # Financial management
│   ├── inventory-service/                # Inventory management
│   ├── messaging-service/                # Messaging system
│   ├── order-service/                    # Order management
│   ├── printing-service/                 # Report printing
│   └── filestore-service/                # File storage
├── docker/                               # Docker configurations
├── scripts/                              # Build and deployment scripts
├── thunder-tests/                        # API testing collections
├── package.json
├── tsconfig.base.json
├── turbo.json
└── README.md                             # 🆕 Updated documentation
```

## 🔧 Key Components Added/Modified

### 1. Base Repository (`packages/shared/src/repositories/base.repository.ts`)

**Features:**

- ✅ `findById(id: string)`: Find document by ID with error handling
- ✅ `findAll(query: object)`: Find all documents with pagination and sorting
- ✅ `create(data: object)`: Create new document with validation
- ✅ `update(id: string, data: object)`: Update existing document with audit trail
- ✅ `delete(id: string)`: Soft delete document (set `active: false`)
- ✅ `findOne(filter)`: Find one document by filter
- ✅ `count(filter)`: Count documents matching filter
- ✅ `exists(filter)`: Check if document exists
- ✅ Query builder with search and filtering
- ✅ Comprehensive error handling and logging
- ✅ Audit trail for all operations

### 2. Domain Repositories

**Patient Repository (`patient-service/src/patient/patient.repository.ts`):**

- ✅ Extends `BaseRepository<Patient>`
- ✅ Domain-specific methods: `findByMRN`, `findByNationalId`, `findByName`
- ✅ Advanced search: `findByAgeRange`, `findByPhoneNumber`, `findByEmail`
- ✅ Statistics: `getPatientStatistics()`

**Auth Repository (`auth-service/src/auth/user.repository.ts`):**

- ✅ Extends `BaseRepository<User>`
- ✅ User-specific methods: `findByUsername`, `findByEmail`, `findByEmployeeId`
- ✅ Role-based queries: `findByRole`, `findByStatus`
- ✅ Security features: `incrementLoginAttempts`, `addRefreshToken`

**Diagnostic Repository (`diagnostic-service/src/diagnostic/diagnostic.repository.ts`):**

- ✅ Extends `BaseRepository<Diagnostic>`
- ✅ Code management: `findByCode`, `findByCodingSystem`
- ✅ Search methods: `findByName`, `findByCategory`

**Eform Repository (`eform-service/src/eform/eform.repository.ts`):**

- ✅ Extends `BaseRepository<Eform>`
- ✅ Form management: `findByCode`, `findByStatus`, `findByCategory`
- ✅ Template handling: `findTemplates`

**Encounter Repository (`encounter-service/src/encounter/encounter.repository.ts`):**

- ✅ Extends `BaseRepository<Encounter>`
- ✅ Patient encounters: `findByPatientId`, `findByStatus`, `findByClass`
- ✅ Advanced filtering: `findEncountersWithFilter`
- ✅ Statistics: `getEncounterStatistics`

### 3. Module Files

**Created/Updated Module Files:**

- ✅ `auth-service/src/auth/auth.module.ts`
- ✅ `patient-service/src/patient/patient.module.ts`
- ✅ `diagnostic-service/src/diagnostic/diagnostic.module.ts`
- ✅ `eform-service/src/eform/eform.module.ts`
- ✅ `encounter-service/src/encounter/encounter.module.ts`
- ✅ `encounter-service/src/app.module.ts`

### 4. JWT Strategy

**Added (`auth-service/src/auth/jwt.strategy.ts`):**

- ✅ Passport JWT strategy for authentication
- ✅ User validation and token verification
- ✅ Role and permission extraction

## 🚀 Benefits of Refactoring

### 1. **Maintainability**

- Domain-based organization makes code easier to understand
- Clear separation of concerns between layers
- Consistent patterns across all services

### 2. **Scalability**

- Repository pattern allows easy database changes
- Modular structure supports independent service scaling
- Base repository reduces code duplication

### 3. **Testability**

- Clear interfaces between layers
- Dependency injection enables easy mocking
- Isolated domain logic for unit testing

### 4. **Production Readiness**

- Comprehensive error handling
- Audit trail for compliance
- Proper logging and monitoring
- Security best practices

### 5. **Developer Experience**

- Consistent patterns across services
- Clear file organization
- Comprehensive documentation
- Type safety with TypeScript

## 🔄 Migration Summary

### Files Created:

1. `packages/shared/src/repositories/base.repository.ts` - Base repository pattern
2. `auth-service/src/auth/jwt.strategy.ts` - JWT authentication strategy
3. `encounter-service/src/app.module.ts` - App module for encounter service
4. `encounter-service/src/encounter/encounter.module.ts` - Encounter domain module

### Files Updated:

1. All domain repositories now extend `BaseRepository`
2. All module files updated with proper dependency injection
3. `packages/shared/src/index.ts` - Updated exports
4. `README.md` - Comprehensive documentation update

### Files Deleted:

- No files were deleted during refactoring
- All existing functionality preserved

## 🎉 Conclusion

The refactoring successfully transformed the project from a layer-based to a domain-based architecture while implementing:

- ✅ **Domain-Based Structure**: Organized by business domains
- ✅ **Repository Pattern**: Standardized data access layer
- ✅ **Module Pattern**: Proper NestJS dependency injection
- ✅ **Production-Ready Code**: Comprehensive error handling and audit trail
- ✅ **Maintainable Architecture**: Clear separation of concerns

The project now follows industry best practices and is ready for production deployment with a scalable, maintainable, and well-documented codebase.
