# HIS Backend v2 - Configuration Management

This directory contains all configuration files for the HIS Backend v2 microservice architecture, organized into environment-specific configurations and Docker deployment files.

## 📁 Directory Structure

```
config/
├── env/                    # Environment-specific configurations
│   ├── env.development    # Development environment
│   ├── env.staging        # Staging environment
│   ├── env.production     # Production environment
│   └── env.test          # Test environment
├── docker/                # Docker configuration files
│   ├── docker-compose.yml        # Production Docker Compose
│   ├── docker-compose.dev.yml    # Development Docker Compose
│   ├── Dockerfile.template       # Template Dockerfile for services
│   └── .dockerignore            # Docker ignore file
└── README.md              # This file
```

## 🌍 Environment Management

### Available Environments

1. **Development** (`env.development`)
   - Local development settings
   - Debug logging enabled
   - Swagger documentation enabled
   - Local database connections
   - Development tools (MongoDB Express, Redis Commander)

2. **Staging** (`env.staging`)
   - Pre-production testing
   - Production-like settings
   - Separate database instance (`his-staging`)
   - Enhanced monitoring
   - SSL/TLS enabled

3. **Production** (`env.production`)
   - Production deployment settings
   - Security-focused configuration
   - Performance optimizations
   - External service connections
   - SSL/TLS required
   - Backup configuration

4. **Test** (`env.test`)
   - Automated testing environment
   - Minimal logging (error level only)
   - Test-specific database (`his-test`)
   - Fast execution settings
   - Coverage reporting enabled

### Using Environment Manager

The project includes a PowerShell script to easily switch between environments:

```powershell
# Switch to development environment
.\scripts\env-manager.ps1 development

# Switch to staging environment
.\scripts\env-manager.ps1 staging

# Switch to production environment
.\scripts\env-manager.ps1 production

# Switch to test environment
.\scripts\env-manager.ps1 test
```

### Manual Environment Setup

If you prefer to manually manage environment files:

```powershell
# Copy development environment
Copy-Item config\env\env.development .env

# Copy production environment
Copy-Item config\env\env.production .env
```

## 🐳 Docker Configuration

### Production Deployment

```bash
# Start all services in production
docker-compose -f config/docker/docker-compose.yml up -d

# View logs
docker-compose -f config/docker/docker-compose.yml logs -f

# Stop all services
docker-compose -f config/docker/docker-compose.yml down

# Rebuild and restart
docker-compose -f config/docker/docker-compose.yml up -d --build
```

### Development with Docker

```bash
# Start only infrastructure services for development
docker-compose -f config/docker/docker-compose.dev.yml up -d

# Access development tools:
# - MongoDB Express: http://localhost:8081 (admin/admin123)
# - Redis Commander: http://localhost:8082
# - Grafana: http://localhost:3000 (admin/admin123)
# - Prometheus: http://localhost:9090
```

### Service-Specific Docker

Each service can be built individually using the template Dockerfile:

```bash
# Build a specific service
docker build -f config/docker/Dockerfile.template -t his-auth-service services/auth-service/

# Run a single service
docker run -d --name his-auth-service \
  -p 3003:3003 \
  -p 3032:3032 \
  --env-file .env \
  his-auth-service
```

## 🔧 Configuration Variables

### Core Configuration

| Variable      | Description         | Example                     |
| ------------- | ------------------- | --------------------------- |
| `NODE_ENV`    | Environment mode    | `development`, `production` |
| `APP_NAME`    | Application name    | `HIS Backend v2`            |
| `APP_VERSION` | Application version | `2.0.0`                     |

### Database Configuration

| Variable           | Description               | Example                               |
| ------------------ | ------------------------- | ------------------------------------- |
| `MONGODB_URI`      | MongoDB connection string | `mongodb://admin:pass@host:27017/his` |
| `MONGODB_DATABASE` | Database name             | `his`                                 |

### Redis Configuration

| Variable         | Description             | Example                              |
| ---------------- | ----------------------- | ------------------------------------ |
| `REDIS_URI`      | Redis connection string | `redis://:pass@host:6379`            |
| `REDIS_HOST`     | Redis host              | `localhost`                          |
| `REDIS_PORT`     | Redis port              | `6379`                               |
| `REDIS_PASSWORD` | Redis password          | `redis123`                           |
| `REDIS_DB`       | Redis database number   | `0` (dev), `1` (staging), `2` (test) |

### NATS Configuration

| Variable          | Description            | Example                 |
| ----------------- | ---------------------- | ----------------------- |
| `NATS_URI`        | NATS connection string | `nats://localhost:4222` |
| `NATS_CLUSTER_ID` | NATS cluster ID        | `his-cluster`           |

### Service Ports

Each service has two ports:

- **Service Port**: Main API endpoint
- **Metrics Port**: Prometheus metrics endpoint

| Service            | API Port | Metrics Port | Purpose                          |
| ------------------ | -------- | ------------ | -------------------------------- |
| API Gateway        | 3001     | 3031         | Main entry point and routing     |
| Auth Service       | 3003     | 3032         | Authentication and authorization |
| Patient Service    | 3002     | 3030         | Patient management               |
| Order Service      | 3004     | 3041         | Medical orders and prescriptions |
| Inventory Service  | 3005     | 3033         | Medical supplies and inventory   |
| Encounter Service  | 3006     | 3034         | Patient encounters and visits    |
| Diagnostic Service | 3007     | 3035         | Laboratory and diagnostic tests  |
| Financial Service  | 3008     | 3036         | Billing and financial management |
| Eform Service      | 3009     | 3037         | Electronic forms and documents   |
| Filestore Service  | 3010     | 3038         | File storage and management      |
| Messaging Service  | 3011     | 3039         | Notifications and messaging      |
| Printing Service   | 3012     | 3040         | Report generation and printing   |

### Security Configuration

| Variable                 | Description               | Example                                 |
| ------------------------ | ------------------------- | --------------------------------------- |
| `JWT_SECRET`             | JWT signing secret        | `your-super-secret-jwt-key`             |
| `JWT_EXPIRES_IN`         | JWT expiration time       | `24h`                                   |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration  | `7d`                                    |
| `BCRYPT_ROUNDS`          | Password hashing rounds   | `12` (prod), `10` (staging), `4` (test) |
| `SESSION_SECRET`         | Session encryption secret | `${SESSION_SECRET}`                     |

### CORS Configuration

| Variable           | Description       | Example                 |
| ------------------ | ----------------- | ----------------------- |
| `CORS_ORIGIN`      | Allowed origins   | `http://localhost:3000` |
| `CORS_CREDENTIALS` | Allow credentials | `true`                  |

### Logging Configuration

| Variable     | Description   | Example                                          |
| ------------ | ------------- | ------------------------------------------------ |
| `LOG_LEVEL`  | Logging level | `debug` (dev), `info` (prod), `error` (test)     |
| `LOG_FORMAT` | Log format    | `combined` (dev), `json` (prod), `simple` (test) |

### Monitoring Configuration

| Variable                | Description                | Example |
| ----------------------- | -------------------------- | ------- |
| `PROMETHEUS_ENABLED`    | Enable Prometheus metrics  | `true`  |
| `PROMETHEUS_PORT`       | Prometheus metrics port    | `9090`  |
| `HEALTH_CHECK_ENABLED`  | Enable health checks       | `true`  |
| `HEALTH_CHECK_INTERVAL` | Health check interval (ms) | `30000` |

### Rate Limiting

| Variable                  | Description             | Example                    |
| ------------------------- | ----------------------- | -------------------------- |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window (ms)  | `900000` (15 minutes)      |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` (dev), `1000` (prod) |

### File Upload Configuration

| Variable             | Description               | Example                                       |
| -------------------- | ------------------------- | --------------------------------------------- |
| `MAX_FILE_SIZE`      | Maximum file size (bytes) | `10485760` (10MB dev), `52428800` (50MB prod) |
| `ALLOWED_FILE_TYPES` | Allowed file extensions   | `jpg,jpeg,png,pdf,doc,docx`                   |

### Email Configuration

| Variable     | Description        | Example                  |
| ------------ | ------------------ | ------------------------ |
| `SMTP_HOST`  | SMTP server host   | `smtp.gmail.com`         |
| `SMTP_PORT`  | SMTP server port   | `587`                    |
| `SMTP_USER`  | SMTP username      | `${SMTP_USER}`           |
| `SMTP_PASS`  | SMTP password      | `${SMTP_PASS}`           |
| `EMAIL_FROM` | From email address | `noreply@his-vajira.com` |

### SSL/TLS Configuration (Production/Staging)

| Variable        | Description          | Example                           |
| --------------- | -------------------- | --------------------------------- |
| `SSL_ENABLED`   | Enable SSL/TLS       | `true`                            |
| `SSL_CERT_PATH` | SSL certificate path | `/etc/ssl/certs/his-vajira.crt`   |
| `SSL_KEY_PATH`  | SSL private key path | `/etc/ssl/private/his-vajira.key` |

### Backup Configuration (Production/Staging)

| Variable                | Description              | Example                     |
| ----------------------- | ------------------------ | --------------------------- |
| `BACKUP_ENABLED`        | Enable automated backups | `true`                      |
| `BACKUP_SCHEDULE`       | Backup schedule (cron)   | `0 2 * * *` (daily at 2 AM) |
| `BACKUP_RETENTION_DAYS` | Backup retention period  | `30` (prod), `7` (staging)  |

### Test Configuration

| Variable             | Description            | Example |
| -------------------- | ---------------------- | ------- |
| `TEST_TIMEOUT`       | Test timeout (ms)      | `10000` |
| `TEST_RETRIES`       | Test retry attempts    | `3`     |
| `COVERAGE_ENABLED`   | Enable test coverage   | `true`  |
| `COVERAGE_THRESHOLD` | Coverage threshold (%) | `80`    |

## 🔒 Security Considerations

### Production Environment

1. **Never commit sensitive data** to version control
2. **Use environment variables** for all secrets
3. **Rotate secrets regularly**
4. **Use strong passwords** for all services
5. **Enable SSL/TLS** in production
6. **Configure proper CORS** settings
7. **Enable rate limiting**
8. **Use secure session management**

### Environment Variables Best Practices

1. **Use different databases** for each environment
2. **Use different Redis databases** for each environment
3. **Use different NATS clusters** for each environment
4. **Use different JWT secrets** for each environment
5. **Use different service ports** for each environment
6. **Use different logging levels** for each environment

### Secret Management

For production deployments, use a secure secret management system:

```bash
# Example with Docker Secrets
docker secret create jwt_secret ./secrets/jwt_secret.txt
docker secret create mongodb_password ./secrets/mongodb_password.txt
docker secret create redis_password ./secrets/redis_password.txt
```

## 📊 Monitoring Configuration

### Prometheus Metrics

All services expose Prometheus metrics on their respective metrics ports. The metrics include:

- **Request counts and durations**
- **Error rates**
- **Database connection status**
- **Memory and CPU usage**
- **Custom business metrics**
- **Service health status**

### Grafana Dashboards

Grafana is configured with pre-built dashboards for:

- **Service health monitoring**
- **API performance metrics**
- **Database performance**
- **System resource usage**
- **Business metrics**
- **Error tracking**

### Health Checks

Each service includes health check endpoints:

```bash
# Health check endpoints
curl http://localhost:3001/health  # API Gateway
curl http://localhost:3003/health  # Auth Service
curl http://localhost:3002/health  # Patient Service
# ... etc for all services
```

## 🚀 Deployment

### Local Development

1. **Set environment:**

   ```powershell
   .\scripts\env-manager.ps1 development
   ```

2. **Start infrastructure:**

   ```bash
   docker-compose -f config/docker/docker-compose.dev.yml up -d
   ```

3. **Start services:**
   ```bash
   npm run dev
   ```

### Staging Deployment

1. **Set environment:**

   ```powershell
   .\scripts\env-manager.ps1 staging
   ```

2. **Deploy with Docker:**

   ```bash
   docker-compose -f config/docker/docker-compose.yml up -d
   ```

3. **Verify deployment:**
   ```bash
   docker-compose -f config/docker/docker-compose.yml ps
   ```

### Production Deployment

1. **Set environment:**

   ```powershell
   .\scripts\env-manager.ps1 production
   ```

2. **Configure secrets:**

   ```bash
   # Set production secrets
   export JWT_SECRET="your-production-jwt-secret"
   export MONGODB_PASSWORD="your-production-mongodb-password"
   export REDIS_PASSWORD="your-production-redis-password"
   ```

3. **Deploy with Docker:**

   ```bash
   docker-compose -f config/docker/docker-compose.yml up -d
   ```

4. **Verify deployment:**
   ```bash
   docker-compose -f config/docker/docker-compose.yml ps
   docker-compose -f config/docker/docker-compose.yml logs -f
   ```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**: Use the port checking script:

   ```powershell
   .\scripts\check-ports.ps1
   ```

2. **Environment Issues**: Verify environment file:

   ```powershell
   Get-Content .env | Select-String "NODE_ENV"
   ```

3. **Docker Issues**: Check container logs:

   ```bash
   docker-compose -f config/docker/docker-compose.yml logs [service-name]
   ```

4. **Database Connection Issues**: Check MongoDB connection:

   ```bash
   docker exec -it his-mongodb mongo -u admin -p password123 --authenticationDatabase admin
   ```

5. **Redis Connection Issues**: Check Redis connection:
   ```bash
   docker exec -it his-redis redis-cli -a redis123
   ```

### Performance Issues

1. **High Memory Usage**: Check service memory limits
2. **Slow Database Queries**: Monitor MongoDB performance
3. **Network Latency**: Check NATS connection status
4. **File Upload Issues**: Verify file size limits and storage

### Security Issues

1. **Authentication Failures**: Check JWT configuration
2. **CORS Errors**: Verify CORS settings
3. **Rate Limiting**: Check rate limit configuration
4. **SSL/TLS Issues**: Verify certificate configuration

### Support

For configuration issues:

1. **Check the troubleshooting guide**: `TROUBLESHOOTING.md`
2. **Verify environment variables** are set correctly
3. **Check service logs** for specific error messages
4. **Ensure all required services** are running
5. **Review the main README**: `../README.md`

## 📝 Notes

- **Environment files are templates** and may need customization for your specific deployment
- **Production secrets should be managed** through a secure secret management system
- **Regular backups of configuration files** are recommended
- **Monitor configuration changes** through version control
- **Test configuration changes** in staging before production
- **Document any custom configurations** for team reference

## 🔄 Configuration Updates

When updating configurations:

1. **Backup existing configurations**
2. **Test changes in development first**
3. **Update documentation**
4. **Notify team members**
5. **Deploy to staging for testing**
6. **Deploy to production during maintenance window**

## 📚 Additional Resources

- **Main Project README**: `../README.md`
- **Troubleshooting Guide**: `../TROUBLESHOOTING.md`
- **API Documentation**: Available at `/api-docs` when Swagger is enabled
- **Monitoring Dashboards**: Available at Grafana when monitoring is enabled
