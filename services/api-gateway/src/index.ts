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
            port: parseInt(process.env.API_GATEWAY_METRICS_PORT || '3031'),
            path: '/metrics',
          },
        },
      },
    });
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
      actions: {
        authenticate: {
          handler: async (ctx: any, route: any, req: any, res: any) => {
            // Authentication logic will be implemented here
            return true;
          },
        },
        authorize: {
          handler: async (ctx: any, route: any, req: any, res: any) => {
            // Authorization logic will be implemented here
            return true;
          },
        },
      },
    });
  }

  private async startNestJS() {
    // Create a simple Express app instead of NestJS for now
    const express = require('express');
    const app = express();

    // Enable CORS
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || 'http://localhost:3000');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Origin,X-Requested-With,Content-Type,Accept,Authorization'
      );
      next();
    });

    // Global prefix
    app.use('/api/v2', (req, res) => {
      res.json({ message: 'API Gateway is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.API_GATEWAY_PORT || 3001;
    app.listen(port, () => {
      console.log(`API Gateway listening on port ${port}`);
    });
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
