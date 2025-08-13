import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { ApiGatewayService } from './services/api-gateway.service';

class ApiGatewayMoleculerService {
  private broker: ServiceBroker;
  private apiGatewayService: ApiGatewayService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'api-gateway',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3031,
            path: '/metrics',
          },
        },
      },
    });

    this.apiGatewayService = new ApiGatewayService();
    this.apiGatewayService.broker = this.broker;
  }

  async start() {
    try {
      console.log('Starting API Gateway Service...');

      // Start Moleculer broker
      await this.broker.start();
      console.log('Moleculer broker started');

      // Register API Gateway service
      this.registerApiGateway();

      // Start NestJS application
      await this.startNestJS();

      console.log('API Gateway Service started successfully');
    } catch (error) {
      console.error('Error starting API Gateway Service:', error);
      process.exit(1);
    }
  }

  private registerApiGateway() {
    this.broker.createService({
      name: 'api-gateway',
      mixins: [this.apiGatewayService],
      settings: {
        port: process.env.API_GATEWAY_PORT || 3001,
        routes: [
          {
            path: '/api/v2',
            whitelist: ['patient.*', 'auth.*', 'encounter.*', 'order.*'],
            use: ['authenticate', 'authorize'],
          },
        ],
      },
    });
  }

  private async startNestJS() {
    const app = await NestFactory.create(ApiGatewayService);

    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api/v2');

    // Start HTTP server
    const port = process.env.API_GATEWAY_PORT || 3001;
    await app.listen(port);
    console.log(`API Gateway listening on port ${port}`);
  }

  async stop() {
    try {
      await this.broker.stop();
      console.log('API Gateway Service stopped');
    } catch (error) {
      console.error('Error stopping API Gateway Service:', error);
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
const service = new ApiGatewayMoleculerService();
service.start().catch(error => {
  console.error('Failed to start API Gateway Service:', error);
  process.exit(1);
});
