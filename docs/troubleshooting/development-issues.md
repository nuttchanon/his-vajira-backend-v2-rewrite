# Development Issues

This guide covers common development issues and their solutions for the HIS Vajira Backend V2 project.

## 🔧 Common Issues

### 1. Yarn Peer Dependency Warnings

#### Issue

```
➤ YN0002: │ @his/api-gateway@workspace:services/api-gateway doesn't provide mongoose (pd59b5), requested by @his/shared.
➤ YN0086: │ Some peer dependencies are incorrectly met by your project; run yarn explain peer-requirements <hash> for details.
```

#### Solution

This occurs when a shared package requires a dependency that isn't available in the consuming service.

**Option 1: Add missing dependency to the service**

```bash
cd services/api-gateway
yarn add mongoose
```

**Option 2: Make the dependency optional in the shared package**

```json
// packages/shared/package.json
{
  "peerDependencies": {
    "mongoose": "^6.13.0 || ^8.0.0"
  }
}
```

#### Current Status ✅

- **Major Issues Resolved**: All critical mongoose dependency issues have been fixed
- **Remaining Warnings**: Only minor optional dependency warnings remain (these are non-critical)
- **Action Required**: None - the remaining warnings are for optional dependencies that don't affect functionality

### 2. TypeScript Compilation Errors

#### Issue

```
error TS2307: Cannot find module '@his/shared' or its corresponding type declarations.
```

#### Solution

1. **Check workspace configuration** in `package.json`:

```json
{
  "workspaces": ["services/*", "packages/*"]
}
```

2. **Rebuild the shared package**:

```bash
cd packages/shared
yarn build
```

3. **Reinstall dependencies**:

```bash
yarn install
```

### 3. Service Startup Issues

#### Issue

```
Error: Cannot find module './dist/index.js'
```

#### Solution

1. **Build the service**:

```bash
cd services/[service-name]
yarn build
```

2. **Check TypeScript configuration**:

```bash
yarn tsc --noEmit
```

3. **Clear and rebuild**:

```bash
rm -rf dist/
yarn build
```

### 4. Database Connection Issues

#### Issue

```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

#### Solution

1. **Check MongoDB status**:

```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl status mongod
```

2. **Verify connection string** in environment variables:

```env
MONGODB_URI=mongodb://localhost:27017/his-vajira
```

3. **Check Docker containers** (if using Docker):

```bash
docker ps
docker-compose up -d
```

### 5. Port Conflicts

#### Issue

```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Solution

1. **Find process using the port**:

```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

2. **Kill the process**:

```bash
# Windows
taskkill /PID [PID] /F

# Linux/Mac
kill -9 [PID]
```

3. **Use a different port**:

```bash
PORT=3001 yarn start
```

## 🚀 Quick Fixes

### Reset Development Environment

```bash
# Clean all dependencies and rebuild
rm -rf node_modules/
rm -rf packages/*/node_modules/
rm -rf services/*/node_modules/
yarn install
yarn build:all
```

### Update All Dependencies

```bash
# Update all packages to latest versions
yarn upgrade-interactive --latest
```

### Fix TypeScript Issues

```bash
# Check for TypeScript errors
yarn tsc --noEmit

# Fix linting issues
yarn lint:fix
```

## 📋 Troubleshooting Checklist

- [ ] All dependencies installed (`yarn install`)
- [ ] Shared packages built (`yarn build:packages`)
- [ ] Services built (`yarn build:services`)
- [ ] Environment variables configured
- [ ] Database running and accessible
- [ ] Required ports available
- [ ] TypeScript compilation successful
- [ ] Linting passes (`yarn lint`)

## 🔍 Debugging Tools

### Logs

- **Application logs**: Check service-specific log files
- **Docker logs**: `docker logs [container-name]`
- **System logs**: Check system event logs

### Network

- **Port scanning**: `netstat -tulpn`
- **Connection testing**: `telnet localhost [port]`
- **DNS resolution**: `nslookup [hostname]`

### Performance

- **Memory usage**: `top` or Task Manager
- **Disk space**: `df -h` or `dir`
- **Process monitoring**: `htop` or Process Explorer

## 📞 Getting Help

If you encounter issues not covered in this guide:

1. **Check existing issues** in the project repository
2. **Search documentation** in the `docs/` folder
3. **Review logs** for specific error messages
4. **Create a detailed issue report** with:
   - Error message and stack trace
   - Steps to reproduce
   - Environment details (OS, Node.js version, etc.)
   - Relevant configuration files
