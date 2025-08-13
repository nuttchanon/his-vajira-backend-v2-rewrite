# Backend System Rewrite Blueprint - Part 2

## FHIR Schema Design, Redis Integration, and Refactoring Plan

---

## 2. FHIR/HL7 Compliant Schema Design

### 2.1 Core FHIR Resources Mapping

#### 2.1.1 Patient Resource Implementation

```typescript
@modelOptions({
    schemaOptions: {
        collection: "patient",
        collation: { locale: "en" },
        indexes: [
            { "identifier.system": 1, "identifier.value": 1 },
            { "name.family": 1, "name.given": 1 },
            { birthDate: 1 },
            { active: 1, createdAt: -1 },
            { "identifier.system": 1, "identifier.value": 1, active: 1 },
        ],
    },
})
export class Patient extends EntityBase {
    @prop({ required: true, type: () => [PatientIdentifier] })
    identifier!: PatientIdentifier[];

    @prop({ required: true, default: true })
    active!: boolean;

    @prop({ required: true, type: () => [HumanName] })
    name!: HumanName[];

    @prop({ required: true, enum: AdministrativeGender })
    gender!: AdministrativeGender;

    @prop({ required: true, index: true })
    birthDate!: Date;

    @prop({ type: () => [ContactPoint] })
    telecom?: ContactPoint[];

    @prop({ type: () => [Address] })
    address?: Address[];

    @prop({ type: () => [Reference] })
    contact?: Reference[];

    @prop({ type: () => [CodeableConcept] })
    communication?: CodeableConcept[];

    @prop({ type: () => [Reference] })
    generalPractitioner?: Reference[];

    @prop({ type: () => [Reference] })
    managingOrganization?: Reference[];

    @prop({ type: () => [PatientLink] })
    link?: PatientLink[];

    // FHIR Extensions for HIS-specific data
    @prop({ type: () => [Extension] })
    extension?: Extension[];
}
```

#### 2.1.2 Encounter Resource Implementation

```typescript
@modelOptions({
    schemaOptions: {
        collection: "encounter",
        indexes: [
            { patient: 1, status: 1, createdAt: -1 },
            { encounter: 1, type: 1, status: 1 },
            { requester: 1, createdAt: -1 },
            { patient: 1, encounter: 1, status: 1 },
            { "period.start": 1, "period.end": 1 },
        ],
    },
})
export class Encounter extends EntityBase {
    @prop({ type: () => [Identifier] })
    identifier?: Identifier[];

    @prop({ required: true, enum: EncounterStatus })
    status!: EncounterStatus;

    @prop({ type: () => [EncounterStatusHistory] })
    statusHistory?: EncounterStatusHistory[];

    @prop({ required: true, type: () => Coding })
    class!: Coding;

    @prop({ type: () => [CodeableConcept] })
    classHistory?: CodeableConcept[];

    @prop({ type: () => [CodeableConcept] })
    type?: CodeableConcept[];

    @prop({ type: () => [CodeableConcept] })
    serviceType?: CodeableConcept[];

    @prop({ type: () => [Reference] })
    priority?: Reference[];

    @prop({ type: () => Reference, required: true })
    subject!: Reference;

    @prop({ type: () => [Reference] })
    episodeOfCare?: Reference[];

    @prop({ type: () => [Reference] })
    basedOn?: Reference[];

    @prop({ type: () => [EncounterParticipant] })
    participant?: EncounterParticipant[];

    @prop({ type: () => [Reference] })
    appointment?: Reference[];

    @prop({ type: () => Period })
    period?: Period;

    @prop({ type: () => Duration })
    length?: Duration;

    @prop({ type: () => [CodeableConcept] })
    reasonCode?: CodeableConcept[];

    @prop({ type: () => [Reference] })
    reasonReference?: Reference[];

    @prop({ type: () => [EncounterDiagnosis] })
    diagnosis?: EncounterDiagnosis[];

    @prop({ type: () => [Reference] })
    account?: Reference[];

    @prop({ type: () => EncounterHospitalization })
    hospitalization?: EncounterHospitalization;

    @prop({ type: () => [EncounterLocation] })
    location?: EncounterLocation[];

    @prop({ type: () => Reference })
    serviceProvider?: Reference;

    @prop({ type: () => Reference })
    partOf?: Reference;
}
```

#### 2.1.3 ServiceRequest Resource (for Orders)

```typescript
@modelOptions({
    schemaOptions: {
        collection: "service_request",
        indexes: [
            { patient: 1, status: 1, createdAt: -1 },
            { encounter: 1, category: 1, status: 1 },
            { requester: 1, createdAt: -1 },
            { occurrenceDateTime: 1 },
            { priority: 1, status: 1 },
        ],
    },
})
export class ServiceRequest extends EntityBase {
    @prop({ type: () => [Identifier] })
    identifier?: Identifier[];

    @prop({ type: () => [Reference] })
    instantiatesCanonical?: Reference[];

    @prop({ type: () => [string] })
    instantiatesUri?: string[];

    @prop({ type: () => [Reference] })
    basedOn?: Reference[];

    @prop({ type: () => [Reference] })
    replaces?: Reference[];

    @prop({ required: true })
    status!: RequestStatus;

    @prop({ required: true })
    intent!: RequestIntent;

    @prop({ type: () => [CodeableConcept] })
    category?: CodeableConcept[];

    @prop({ required: true })
    priority!: RequestPriority;

    @prop({ required: true })
    code!: CodeableConcept;

    @prop({ type: () => [CodeableConcept] })
    orderDetail?: CodeableConcept[];

    @prop({ type: () => Quantity })
    quantityQuantity?: Quantity;

    @prop({ type: () => Ratio })
    quantityRatio?: Ratio;

    @prop({ type: () => Range })
    quantityRange?: Range;

    @prop({ type: () => Reference, required: true })
    subject!: Reference;

    @prop({ type: () => Reference })
    encounter?: Reference;

    @prop({ type: () => [Element] })
    occurrence?: Element[];

    @prop({ type: () => [Reference] })
    asNeeded?: Reference[];

    @prop({ type: () => [Element] })
    authoredOn?: Element[];

    @prop({ type: () => Reference })
    requester?: Reference;

    @prop({ type: () => [Reference] })
    performerType?: Reference[];

    @prop({ type: () => [Reference] })
    performer?: Reference[];

    @prop({ type: () => [Reference] })
    locationCode?: Reference[];

    @prop({ type: () => [Reference] })
    locationReference?: Reference[];

    @prop({ type: () => [CodeableConcept] })
    reasonCode?: CodeableConcept[];

    @prop({ type: () => [Reference] })
    reasonReference?: Reference[];

    @prop({ type: () => [Reference] })
    insurance?: Reference[];

    @prop({ type: () => [Reference] })
    supportingInfo?: Reference[];

    @prop({ type: () => [Reference] })
    specimen?: Reference[];

    @prop({ type: () => [CodeableConcept] })
    bodySite?: CodeableConcept[];

    @prop({ type: () => [Annotation] })
    note?: Annotation[];

    @prop({ type: () => [string] })
    patientInstruction?: string[];

    @prop({ type: () => [Reference] })
    relevantHistory?: Reference[];
}
```

### 2.2 Document Design Principles

#### 2.2.1 Embedded vs. Referenced Documents Strategy

**Embedded Documents (Use for):**

-   **Small, frequently accessed data** (patient names, basic demographics)
-   **Data that doesn't change independently** (vital signs during encounter)
-   **Denormalized data for performance** (patient summary information)
-   **Audit trail data** (status changes, modifications)

**Referenced Documents (Use for):**

-   **Large, complex entities** (patient full records, encounter details)
-   **Data that changes independently** (medication orders, lab results)
-   **Shared master data** (ICD codes, medication catalogs)
-   **Cross-service data** (user information, department data)

#### 2.2.2 Indexing Strategy

```typescript
// Compound indexes for common query patterns
@modelOptions({
  schemaOptions: {
    indexes: [
      // Patient queries
      { 'identifier.system': 1, 'identifier.value': 1, active: 1 },
      { 'name.family': 1, 'name.given': 1, active: 1 },
      { birthDate: 1, active: 1 },

      // Encounter queries
      { patient: 1, status: 1, 'period.start': -1 },
      { encounter: 1, type: 1, status: 1 },
      { requester: 1, createdAt: -1 },

      // Order queries
      { patient: 1, encounter: 1, status: 1, priority: 1 },
      { requester: 1, status: 1, createdAt: -1 },
      { category: 1, status: 1, 'occurrenceDateTime': 1 },

      // Search indexes
      {
        'name.family': 'text',
        'name.given': 'text',
        'identifier.value': 'text'
      }
    ]
  }
})
```

---

## 3. Redis Integration Plan

### 3.1 Caching Strategy

#### 3.1.1 Multi-Layer Cache Architecture

**L1 Cache (Application Level):**

-   **In-memory caching** for frequently accessed data
-   **Request-scoped caching** for session data
-   **Method-level caching** for expensive computations
-   **Connection pooling** for database connections

**L2 Cache (Redis):**

-   **Entity caching** for master data (patients, encounters, medications)
-   **Query result caching** for complex aggregations
-   **Session caching** for user sessions and permissions
-   **Rate limiting** and API throttling
-   **Distributed locking** for concurrent operations

**L3 Cache (Database Level):**

-   **MongoDB query optimization**
-   **Proper indexing strategies**
-   **Connection pooling**
-   **Query result caching**

#### 3.1.2 Cache Implementation

**Cache Service Implementation:**

```typescript
@Injectable()
export class CacheService {
    private readonly redis: Redis;
    private readonly logger = new Logger(CacheService.name);

    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT) || 6379,
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB) || 0,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            keepAlive: 30000,
            family: 4,
            keyPrefix: "his:",
        });
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const value = await this.redis.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            this.logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        try {
            const serializedValue = JSON.stringify(value);
            if (ttl) {
                await this.redis.setex(key, ttl, serializedValue);
            } else {
                await this.redis.set(key, serializedValue);
            }
        } catch (error) {
            this.logger.error(`Cache set error for key ${key}:`, error);
        }
    }

    async invalidateEntity(entityType: string, id: string): Promise<void> {
        try {
            const pattern = `entity:${entityType}:${id}`;
            await this.redis.del(pattern);

            // Invalidate related queries
            const queryPattern = `query:*:${entityType}:*`;
            const keys = await this.redis.keys(queryPattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            this.logger.error(`Cache invalidation error:`, error);
        }
    }

    async invalidateQueries(pattern: string): Promise<void> {
        try {
            const keys = await this.redis.keys(`query:${pattern}`);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        } catch (error) {
            this.logger.error(`Query invalidation error:`, error);
        }
    }

    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl: number = 3600
    ): Promise<T> {
        const cached = await this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const value = await factory();
        await this.set(key, value, ttl);
        return value;
    }
}
```

#### 3.1.3 Cache Keys Pattern

```
# Entity caching
entity:{entityType}:{id}                    # Individual entities
entity:{entityType}:{id}:{version}          # Versioned entities

# Query result caching
query:{service}:{method}:{hash}             # Query results
query:{service}:{method}:{filters}:{hash}   # Filtered queries

# Session and user data
session:{userId}:{sessionId}                # User sessions
permission:{userId}:{resource}:{action}     # User permissions
user:{userId}:profile                       # User profiles

# Rate limiting
rate:{userId}:{endpoint}:{window}           # Rate limiting
rate:{ip}:{endpoint}:{window}               # IP-based rate limiting

# Business logic caching
patient:{patientId}:summary                 # Patient summaries
encounter:{encounterId}:orders              # Encounter orders
department:{deptId}:staff                   # Department staff
```

#### 3.1.4 Cache Invalidation Strategy

```typescript
@Injectable()
export class CacheInvalidationService {
    constructor(private cacheService: CacheService) {}

    async invalidatePatientData(patientId: string): Promise<void> {
        await Promise.all([
            this.cacheService.invalidateEntity("patient", patientId),
            this.cacheService.invalidateQueries(`patient:${patientId}:*`),
            this.cacheService.invalidateQueries(
                `encounter:*:patient:${patientId}`
            ),
            this.cacheService.invalidateQueries(`order:*:patient:${patientId}`),
        ]);
    }

    async invalidateEncounterData(encounterId: string): Promise<void> {
        await Promise.all([
            this.cacheService.invalidateEntity("encounter", encounterId),
            this.cacheService.invalidateQueries(`encounter:${encounterId}:*`),
            this.cacheService.invalidateQueries(
                `order:*:encounter:${encounterId}`
            ),
        ]);
    }

    async invalidateOrderData(orderId: string): Promise<void> {
        await Promise.all([
            this.cacheService.invalidateEntity("order", orderId),
            this.cacheService.invalidateQueries(`order:${orderId}:*`),
            this.cacheService.invalidateQueries(`order:*:status:*`),
        ]);
    }

    async invalidateUserPermissions(userId: string): Promise<void> {
        await this.cacheService.invalidateQueries(`permission:${userId}:*`);
    }
}
```

### 3.2 Caching Candidates

#### 3.2.1 High-Priority Cache Candidates

**Patient Master Data:**

-   **Cache Duration**: 1 hour
-   **Invalidation**: On patient updates
-   **Pattern**: `entity:patient:{patientId}`
-   **Benefits**: Frequently accessed, rarely changed

**User Permissions:**

-   **Cache Duration**: 30 minutes
-   **Invalidation**: On role/permission changes
-   **Pattern**: `permission:{userId}:{resource}:{action}`
-   **Benefits**: Complex calculations, frequently checked

**ICD Codes and Master Data:**

-   **Cache Duration**: 24 hours
-   **Invalidation**: On master data updates
-   **Pattern**: `entity:icd10:{code}`, `entity:icd9:{code}`
-   **Benefits**: Static reference data, large datasets

**Department and Location Data:**

-   **Cache Duration**: 6 hours
-   **Invalidation**: On organizational changes
-   **Pattern**: `entity:department:{deptId}`, `entity:location:{locationId}`
-   **Benefits**: Organizational structure, rarely changed

**Medication Catalogs:**

-   **Cache Duration**: 12 hours
-   **Invalidation**: On medication updates
-   **Pattern**: `entity:medication:{medicationId}`
-   **Benefits**: Large datasets, rarely changed

#### 3.2.2 Medium-Priority Cache Candidates

**Encounter Summaries:**

-   **Cache Duration**: 15 minutes
-   **Invalidation**: On encounter updates
-   **Pattern**: `encounter:{encounterId}:summary`
-   **Benefits**: Complex aggregations

**Order Request Lists:**

-   **Cache Duration**: 5 minutes
-   **Invalidation**: On order status changes
-   **Pattern**: `query:order:list:{filters}:{hash}`
-   **Benefits**: Frequently queried with filters

**Appointment Schedules:**

-   **Cache Duration**: 10 minutes
-   **Invalidation**: On appointment changes
-   **Pattern**: `appointment:schedule:{date}:{department}`
-   **Benefits**: Time-based queries

**Lab Result Summaries:**

-   **Cache Duration**: 30 minutes
-   **Invalidation**: On new results
-   **Pattern**: `lab:summary:{patientId}:{dateRange}`
-   **Benefits**: Calculated aggregations

#### 3.2.3 Low-Priority Cache Candidates

**Audit Logs:**

-   **Cache Duration**: Not recommended
-   **Reason**: Write-heavy, rarely queried
-   **Alternative**: Database indexing optimization

**Real-time Data:**

-   **Cache Duration**: Not recommended
-   **Reason**: Changes frequently
-   **Alternative**: WebSocket/Socket.io for real-time updates

**User Sessions:**

-   **Cache Duration**: Already handled by JWT
-   **Reason**: JWT tokens are stateless
-   **Alternative**: JWT token refresh mechanism

---

## 4. Prioritized Refactoring Plan

### 4.1 Phase 1: Foundation and Infrastructure (Weeks 1-4)

**Priority: CRITICAL**

**Objectives:**

-   Establish new architectural patterns
-   Implement caching infrastructure
-   Create standardized base classes

**Deliverables:**

**Week 1-2: Infrastructure Setup**

-   [ ] **Redis integration** with connection pooling and error handling
-   [ ] **Standardized base classes** (BaseEntity, BaseService, BaseRepository)
-   [ ] **Cache service implementation** with invalidation strategies
-   [ ] **Error handling standardization** across all services
-   [ ] **Logging and monitoring** infrastructure with correlation IDs

**Week 3-4: Core Patterns**

-   [ ] **FHIR-compliant base entities** with proper indexing
-   [ ] **Standardized DTO patterns** with validation using class-validator
-   [ ] **Repository pattern improvements** with specialized query methods
-   [ ] **Service layer abstractions** with business logic separation
-   [ ] **Controller mixin standardization** with proper error handling

### 4.2 Phase 2: High-Impact Service Rewrites (Weeks 5-12)

**Priority: HIGH**

**Objectives:**

-   Rewrite the most problematic services
-   Implement new architectural patterns
-   Improve performance significantly

**Deliverables:**

**Week 5-6: Patient Service Extraction**

-   [ ] **Extract patient management** from administration service (1,416 lines)
-   [ ] **Implement FHIR Patient resource** with proper relationships
-   [ ] **Add comprehensive caching** for patient data with 1-hour TTL
-   [ ] **Optimize patient queries** with proper indexing and compound indexes
-   [ ] **Implement patient search** with full-text capabilities and fuzzy matching

**Week 7-8: Order Service Rewrite**

-   [ ] **Completely rewrite orderRequest service** (currently 5,690 lines)
-   [ ] **Implement FHIR ServiceRequest resource** for orders
-   [ ] **Add order workflow management** with state machines
-   [ ] **Implement order caching** and invalidation with 5-minute TTL
-   [ ] **Add order validation** and business rules with comprehensive error handling

**Week 9-10: Encounter Service Extraction**

-   [ ] **Extract encounter management** from administration service
-   [ ] **Implement FHIR Encounter resource** with proper relationships
-   [ ] **Add encounter workflow** management with status transitions
-   [ ] **Implement encounter caching** strategies with 15-minute TTL
-   [ ] **Add encounter analytics** and reporting capabilities

**Week 11-12: Authentication Service Enhancement**

-   [ ] **Enhance AAA service** with improved caching for permissions
-   [ ] **Implement permission caching** for performance with 30-minute TTL
-   [ ] **Add session management** improvements with Redis
-   [ ] **Implement audit logging** enhancements with structured logging
-   [ ] **Add security monitoring** and alerting for suspicious activities

### 4.3 Phase 3: Service Decomposition (Weeks 13-20)

**Priority: MEDIUM**

**Objectives:**

-   Break down remaining monolithic services
-   Implement event-driven patterns
-   Add comprehensive monitoring

**Deliverables:**

**Week 13-14: Administration Service Decomposition**

-   [ ] **Split location management** into separate service
-   [ ] **Extract appointment management** into separate service
-   [ ] **Create department management** service
-   [ ] **Implement inter-service communication** patterns with NATS
-   [ ] **Add service health monitoring** with health checks

**Week 15-16: Medication Service Decomposition**

-   [ ] **Split lab management** into separate service
-   [ ] **Extract imaging management** into separate service
-   [ ] **Create pharmacy management** service
-   [ ] **Implement medication workflow** management
-   [ ] **Add medication safety** checks and alerts

**Week 17-18: Financial Service Enhancement**

-   [ ] **Enhance billing workflows** with caching
-   [ ] **Implement payment processing** improvements
-   [ ] **Add financial reporting** optimizations
-   [ ] **Implement audit trail** enhancements
-   [ ] **Add compliance monitoring** for financial transactions

**Week 19-20: Integration and Testing**

-   [ ] **End-to-end testing** of all services
-   [ ] **Performance testing** and optimization
-   [ ] **Security testing** and vulnerability assessment
-   [ ] **Load testing** and capacity planning
-   [ ] **Documentation completion** with OpenAPI specs

### 4.4 Phase 4: Advanced Features and Optimization (Weeks 21-24)

**Priority: LOW**

**Objectives:**

-   Implement advanced features
-   Performance optimization
-   Production readiness

**Deliverables:**

**Week 21-22: Advanced Features**

-   [ ] **Implement real-time notifications** with Socket.io
-   [ ] **Add advanced search** capabilities with Elasticsearch
-   [ ] **Implement data analytics** and reporting
-   [ ] **Add machine learning** integration points
-   [ ] **Implement API versioning** strategy

**Week 23-24: Production Readiness**

-   [ ] **Deployment automation** and CI/CD pipelines
-   [ ] **Monitoring and alerting** setup with Prometheus/Grafana
-   [ ] **Backup and recovery** procedures
-   [ ] **Disaster recovery** planning
-   [ ] **Performance tuning** and optimization

---

## 5. Success Metrics and KPIs

### 5.1 Performance Metrics

**Response Time Targets:**

-   **API endpoints**: < 200ms for 95% of requests
-   **Database queries**: < 100ms for 95% of queries
-   **Cache hit ratio**: > 80% for cached data
-   **Service availability**: > 99.9% uptime

**Throughput Targets:**

-   **Concurrent users**: Support 1000+ concurrent users
-   **Requests per second**: > 1000 RPS per service
-   **Database connections**: Efficient connection pooling

### 5.2 Quality Metrics

**Code Quality:**

-   **Test coverage**: > 90% unit test coverage
-   **Code complexity**: Cyclomatic complexity < 10
-   **Technical debt**: < 5% of codebase
-   **Documentation**: 100% API documentation coverage

**Reliability:**

-   **Error rate**: < 0.1% error rate
-   **Mean time to recovery**: < 5 minutes
-   **Data consistency**: 100% ACID compliance
-   **Security**: Zero critical vulnerabilities

### 5.3 Business Metrics

**Development Efficiency:**

-   **Time to market**: 50% reduction in feature delivery time
-   **Bug resolution**: 70% reduction in production bugs
-   **Deployment frequency**: Daily deployments
-   **Lead time**: < 1 day from commit to production

**Operational Efficiency:**

-   **Infrastructure costs**: 30% reduction in hosting costs
-   **Maintenance effort**: 50% reduction in maintenance time
-   **Scalability**: Linear scaling with load
-   **Monitoring**: Real-time visibility into system health

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Author**: Principal Software Architect  
**Reviewers**: System Analysts, Development Team Leads  
**Approval**: Technical Architecture Board
