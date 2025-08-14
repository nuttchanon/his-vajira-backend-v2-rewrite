# API Documentation

This section contains all documentation related to the APIs provided by the HIS Vajira Backend V2 services.

## 📋 Contents

### API Overview
- [API Design Principles](./api-design-principles.md) - RESTful API design guidelines
- [API Versioning](./api-versioning.md) - Versioning strategy and implementation
- [API Standards](./api-standards.md) - Common API standards and conventions

### Service APIs
- [Authentication Service API](./auth-service-api.md) - Authentication and authorization endpoints
- [Patient Service API](./patient-service-api.md) - Patient management endpoints
- [Encounter Service API](./encounter-service-api.md) - Clinical encounter endpoints
- [Diagnostic Service API](./diagnostic-service-api.md) - Diagnostic and lab endpoints
- [Financial Service API](./financial-service-api.md) - Billing and financial endpoints
- [EForm Service API](./eform-service-api.md) - Electronic forms endpoints
- [Messaging Service API](./messaging-service-api.md) - Communication endpoints

### API Reference
- [OpenAPI Specifications](./openapi-specs.md) - Complete API specifications
- [Request/Response Examples](./api-examples.md) - Common API usage examples
- [Error Codes](./error-codes.md) - Standard error codes and messages
- [Rate Limiting](./rate-limiting.md) - API rate limiting policies

### Integration
- [API Integration Guide](./api-integration.md) - How to integrate with the APIs
- [Webhook Documentation](./webhooks.md) - Webhook endpoints and events
- [SDK Documentation](./sdk-documentation.md) - Client SDKs and libraries

### Security
- [Authentication](./authentication.md) - Authentication methods and flows
- [Authorization](./authorization.md) - Role-based access control
- [API Security](./api-security.md) - Security best practices

## 🚀 Quick Start

1. [Review API design principles](./api-design-principles.md)
2. [Set up authentication](./authentication.md)
3. [Explore service APIs](./auth-service-api.md)
4. [Check integration guide](./api-integration.md)

## 📚 API Endpoints

### Core Services
- **Auth Service**: `/api/auth/*` - Authentication and user management
- **Patient Service**: `/api/patients/*` - Patient data management
- **Encounter Service**: `/api/encounters/*` - Clinical encounters
- **Diagnostic Service**: `/api/diagnostics/*` - Lab and diagnostic services
- **Financial Service**: `/api/financial/*` - Billing and payments
- **EForm Service**: `/api/eforms/*` - Electronic forms
- **Messaging Service**: `/api/messaging/*` - Communication services

## 🔧 Tools & Technologies

- **API Framework**: Express.js / Fastify
- **Documentation**: OpenAPI 3.0 / Swagger
- **Authentication**: JWT / OAuth 2.0
- **Validation**: Joi / Zod
- **Testing**: Jest / Supertest

## 📚 Related Documentation

- [Architecture Documentation](../architecture/) - System design
- [Development Documentation](../development/) - API development guidelines
- [Testing Documentation](../testing/) - API testing strategies
- [Troubleshooting](../troubleshooting/) - API issues and solutions

---

*For API questions, check the integration guide or contact the API team.*
