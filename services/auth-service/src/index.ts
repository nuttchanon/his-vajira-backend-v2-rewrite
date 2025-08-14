import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect, set } from 'mongoose';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';
import { UserRepository } from './auth/user.repository';

class AuthMoleculerService {
  private broker: ServiceBroker;
  private authService: AuthService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'auth-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: parseInt(process.env.AUTH_METRICS_PORT || '3031'),
            path: '/metrics',
          },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Auth Service...');

      // Configure Mongoose to suppress deprecation warnings
      set('strictQuery', false);

      // Connect to MongoDB
      await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/his', {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Connected to MongoDB');

      // Start Moleculer broker
      await this.broker.start();
      console.log('Moleculer broker started');

      // Register service actions
      this.registerActions();

      // Start NestJS application
      await this.startNestJS();

      console.log('Auth Service started successfully');
    } catch (error) {
      console.error('Error starting Auth Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create auth service instance with repository
    const userRepository = new UserRepository();
    const authService = new AuthService(userRepository, null as any); // JWT service will be injected by NestJS
    authService.broker = this.broker;

    // Create auth action
    this.broker.createService({
      name: 'auth',
      actions: {
        login: {
          handler: async (ctx: any) => {
            const { loginDto } = ctx.params;
            return await authService.login(loginDto);
          },
        },
        register: {
          handler: async (ctx: any) => {
            const { registerDto, context } = ctx.params;
            return await authService.register(registerDto, context);
          },
        },
        validateToken: {
          handler: async (ctx: any) => {
            const { token } = ctx.params;
            return await authService.validateToken(token);
          },
        },
        refreshToken: {
          handler: async (ctx: any) => {
            const { refreshTokenDto } = ctx.params;
            return await authService.refreshToken(refreshTokenDto);
          },
        },
        logout: {
          handler: async (ctx: any) => {
            const { userId, refreshToken } = ctx.params;
            return await authService.logout(userId, refreshToken);
          },
        },
        changePassword: {
          handler: async (ctx: any) => {
            const { userId, changePasswordDto } = ctx.params;
            return await authService.changePassword(userId, changePasswordDto);
          },
        },
        getUsers: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await authService.getUsers(query);
          },
        },
        getUserById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await authService.getUserById(id);
          },
        },
        updateUser: {
          handler: async (ctx: any) => {
            const { id, updateUserDto, context } = ctx.params;
            return await authService.updateUser(id, updateUserDto, context);
          },
        },
        deleteUser: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await authService.deleteUser(id, context);
          },
        },
      },
      events: {
        'user.registered': {
          handler: async (ctx: any) => {
            console.log('User registered event received:', ctx.params);
            // Handle user registered event
          },
        },
        'user.logged_in': {
          handler: async (ctx: any) => {
            console.log('User logged in event received:', ctx.params);
            // Handle user logged in event
          },
        },
        'user.logged_out': {
          handler: async (ctx: any) => {
            console.log('User logged out event received:', ctx.params);
            // Handle user logged out event
          },
        },
      },
    });
  }

  private async startNestJS() {
    try {
      // Create NestJS application
      const app = await NestFactory.create(AppModule);

      // Enable CORS
      app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      });

      // Global prefix
      app.setGlobalPrefix('api/v2');

      // Start HTTP server
      const port = process.env.AUTH_SERVICE_PORT || 3003;
      await app.listen(port);
      console.log(`Auth Service listening on port ${port}`);
    } catch (error) {
      console.error('Error starting NestJS application:', error);
      throw error;
    }
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Auth Service stopped');
    } catch (error) {
      console.error('Error stopping Auth Service:', error);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  await service.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  await service.stop();
  process.exit(0);
});

// Start the service
const service = new AuthMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Auth Service:', error);
  process.exit(1);
});
