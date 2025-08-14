# Troubleshooting Guide - HIS Backend v2

This document provides solutions for common issues encountered during development and deployment of the HIS Backend v2 microservice architecture.

## TypeScript Compilation Errors

### Issue: Complex Mongoose Type Intersections

**Error**: TypeScript compilation errors related to complex type intersections in `base.repository.ts`

**Solution**: Updated the base repository to use explicit type casting to avoid complex Mongoose type intersection issues.

**Files Modified**:

- `packages/shared/src/repositories/base.repository.ts`
- `packages/shared/package.json` (added mongoose peer dependency)

**Key Changes**:

1. Added explicit `any` type casting for query variables
2. Removed problematic type assertions from populate calls
3. Fixed computed property name type casting
4. Added mongoose as peer dependency

## Port Conflicts

### Issue: EADDRINUSE - Address Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use 0.0.0.0:3031`

**Solution**: Made service ports configurable through environment variables.

**Files Modified**:

- `services/auth-service/src/index.ts`
- `services/printing-service/src/index.ts`
- `env.example`

**Key Changes**:

1. Added `AUTH_METRICS_PORT` environment variable
2. Added `PRINTING_METRICS_PORT` environment variable
3. Updated services to use configurable ports instead of hardcoded values

### Port Configuration

```bash
# Default ports (can be overridden via environment variables)
API_GATEWAY_PORT=3001
PATIENT_SERVICE_PORT=3002
AUTH_SERVICE_PORT=3003
AUTH_METRICS_PORT=3031
PRINTING_SERVICE_PORT=3012
PRINTING_METRICS_PORT=3040
```

## Mongoose Deprecation Warnings

### Issue: strictQuery Deprecation Warning

**Warning**: `Mongoose: the 'strictQuery' option will be switched back to 'false' by default in Mongoose 7`

**Solution**: Added explicit `strictQuery` configuration to suppress warnings.

**Files Modified**:

- `services/auth-service/src/index.ts`
- `services/printing-service/src/index.ts`

**Key Changes**:

1. Imported `set` from mongoose
2. Added `set('strictQuery', false)` before database connection

## Utility Scripts

### Port Checking Script

Created `scripts/check-ports.ps1` to help identify port conflicts:

```powershell
# Check which ports are in use
.\scripts\check-ports.ps1
```

**Features**:

- Checks all service ports for conflicts
- Shows process information for occupied ports
- Provides commands to kill processes
- Suggests alternative port configurations

## Environment Configuration

### Required Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Copy the example file
cp env.example .env

# Edit the file to match your environment
# Key variables to check:
MONGODB_URI=mongodb://admin:password123@localhost:27017/his?authSource=admin
NATS_URI=nats://localhost:4222
REDIS_URI=redis://:redis123@localhost:6379
```

## Common Commands

### Development

```bash
# Start all services
yarn dev

# Build all packages
yarn build

# Check port conflicts
.\scripts\check-ports.ps1

# Start specific service
cd services/auth-service && yarn dev
```

### Troubleshooting

```bash
# Kill process using specific port
netstat -ano | findstr :PORT
taskkill /PID PROCESS_ID /F

# Check service logs
docker-compose logs -f SERVICE_NAME

# Restart specific service
docker-compose restart SERVICE_NAME
```

## Service Dependencies

### Infrastructure Services

- **MongoDB**: Port 27017
- **Redis**: Port 6379
- **NATS**: Port 4222

### Application Services

- **API Gateway**: Port 3001
- **Auth Service**: Port 3003 (HTTP), 3031 (Metrics)
- **Patient Service**: Port 3002
- **Printing Service**: Port 3012 (HTTP), 3040 (Metrics)

## Best Practices

1. **Always check ports before starting services** using the port checking script
2. **Use environment variables** for all configurable values
3. **Monitor service logs** for deprecation warnings and errors
4. **Keep dependencies updated** to avoid compatibility issues
5. **Use graceful shutdown** handlers in all services

## Support

For additional issues:

1. Check the service logs for detailed error messages
2. Verify environment configuration
3. Ensure all infrastructure services are running
4. Check for port conflicts using the utility script
5. Review the service-specific documentation in each service directory
