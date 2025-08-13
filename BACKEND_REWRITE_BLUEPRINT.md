# Backend System Rewrite Blueprint

## Comprehensive Analysis and Strategic Plan

### Executive Summary

This document presents a comprehensive analysis of the current HIS (Hospital Information System) backend architecture and provides a detailed blueprint for a complete rewrite. The current system exhibits significant technical debt, architectural inconsistencies, and performance bottlenecks that necessitate a systematic overhaul while maintaining backward compatibility and core architectural principles.

---

## 1. Current System Analysis

### 1.1 Architecture Overview

The current system follows a **Moleculer-based microservice architecture** with the following characteristics:

-   **Service Mesh**: Moleculer framework with NATS messaging
-   **API Gateway**: Centralized routing and authentication
-   **Database**: MongoDB with Typegoose ODM
-   **Authentication**: JWT-based with role-based access control
-   **Communication**: REST APIs with Socket.io for real-time features

### 1.2 Microservices Inventory

**Core Services (15 total):**

1. **ever-api-gateway** - API routing and authentication
2. **ever-api-aaa** - Authentication, Authorization, and Accounting
3. **ever-api-administration** - Patient management and hospital administration
4. **ever-api-medication** - Medication and order management
5. **ever-api-diagnostic** - Diagnostic services and ICD codes
6. **ever-api-clinical** - Clinical workflows
7. **ever-api-financial** - Financial and billing operations
8. **ever-api-eform** - Electronic forms management
9. **ever-api-foundation** - Core infrastructure and utilities
10. **ever-api-filestore** - File storage and IPFS integration
11. **ever-api-global-sequence** - Global sequence management
12. **ever-api-messaging** - Messaging and notifications
13. **ever-api-printing** - Report generation and printing
14. **ever-api-task** - Task management (Go-based)
15. **ever-public-api** - Public API endpoints

### 1.3 Critical Issues Identified

#### 1.3.1 Architectural Problems

**Monolithic Microservices Pattern:**

-   **ever-api-administration**: 1,416-line service file with 100+ controller mixins
-   **ever-api-medication**: 5,690-line orderRequest service with complex business logic
-   **Lack of proper separation of concerns** within services
-   **Tight coupling** between business logic and data access layers

**Inconsistent Service Structure:**

-   No standardized internal architecture across services
-   Mixed patterns for controller, service, and repository layers
-   Inconsistent error handling and validation approaches

#### 1.3.2 Data Layer Issues

**Schema Design Problems:**

-   **Non-FHIR compliant** data structures
-   **Inconsistent relationship modeling** (embedded vs. referenced documents)
-   **Missing proper indexing strategies** for performance
-   **No data versioning or audit trail standardization**

**Repository Pattern Inconsistencies:**

-   Base repository provides basic CRUD but lacks specialized query methods
-   No standardized caching layer
-   Missing transaction management patterns

#### 1.3.3 Performance Bottlenecks

**Database Performance:**

-   **N+1 query problems** in patient and order management
-   **Missing compound indexes** for complex queries
-   **No query optimization** for frequently accessed data
-   **Large document sizes** without proper denormalization strategies

**Service Communication:**

-   **Synchronous inter-service calls** causing latency
-   **No circuit breaker patterns** for fault tolerance
-   **Missing request/response caching**

#### 1.3.4 Code Quality Issues

**Technical Debt:**

-   **Massive service files** (5,690 lines in orderRequest service)
-   **Duplicate business logic** across services
-   **Inconsistent error handling** patterns
-   **Missing comprehensive logging** and monitoring

**Maintainability Problems:**

-   **No standardized documentation** approach
-   **Inconsistent naming conventions**
-   **Missing unit test coverage**
-   **Complex dependency injection** patterns

---

## 2. Architectural Blueprint

### 2.1 New Service Architecture Pattern

#### 2.1.1 Standardized Service Structure

```
service-name/
├── src/
│   ├── api/
│   │   └── domain/
│   │       ├── controllers/
│   │       │   ├── base.controller.mixin.ts
│   │       │   ├── entity.controller.mixin.ts
│   │       │   └── custom.controller.mixin.ts
│   │       ├── services/
│   │       │   ├── base.service.ts
│   │       │   ├── entity.service.ts
│   │       │   └── business.service.ts
│   │       ├── repositories/
│   │       │   ├── base.repository.ts
│   │       │   ├── entity.repository.ts
│   │       │   └── specialized.repository.ts
│   │       ├── dto/
│   │       │   ├── request/
│   │       │   └── response/
│   │       ├── entities/
│   │       │   ├── base.entity.ts
│   │       │   └── domain.entity.ts
│   │       ├── interfaces/
│   │       ├── validators/
│   │       ├── transformers/
│   │       └── utils/
│   ├── config/
│   ├── middleware/
│   ├── utils/
│   └── index.ts
├── tests/
├── docs/
└── package.json
```

#### 2.1.2 Service Decomposition Strategy

**Break Down Monolithic Services:**

**ever-api-administration → Split into:**

-   **patient-service** - Patient management only
-   **encounter-service** - Encounter and episode management
-   **location-service** - Hospital locations and departments
-   **appointment-service** - Appointment scheduling
-   **admission-service** - Admission and discharge workflows

**ever-api-medication → Split into:**

-   **order-service** - Order request management
-   **medication-service** - Medication-specific operations
-   **lab-service** - Laboratory request management
-   **imaging-service** - Imaging request management
-   **pharmacy-service** - Pharmacy operations

#### 2.1.3 Service Communication Patterns

**Synchronous Communication:**

-   Use Moleculer's built-in service discovery
-   Implement circuit breaker patterns
-   Add request/response caching

**Asynchronous Communication:**

-   Implement event-driven patterns using NATS
-   Use saga patterns for distributed transactions
-   Add dead letter queues for failed messages
