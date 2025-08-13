import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { DiagnosticService } from './diagnostic/diagnostic.service';
import { DiagnosticController } from './diagnostic/diagnostic.controller';
import { Diagnostic } from './diagnostic/entity/diagnostic.entity';

class DiagnosticMoleculerService {
  private broker: ServiceBroker;
  private diagnosticService: DiagnosticService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'diagnostic-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3035,
            path: '/metrics',
          },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Diagnostic Service...');

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

      console.log('Diagnostic Service started successfully');
    } catch (error) {
      console.error('Error starting Diagnostic Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create diagnostic service instance
    const diagnosticService = new DiagnosticService();
    diagnosticService.broker = this.broker;

    // Create diagnostic action
    this.broker.createService({
      name: 'diagnostic',
      actions: {
        create: {
          handler: async (ctx: any) => {
            const { createDiagnosticDto, context } = ctx.params;
            return await diagnosticService.createDiagnostic(createDiagnosticDto, context);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await diagnosticService.getDiagnosticById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await diagnosticService.getDiagnostics(query);
          },
        },
        update: {
          handler: async (ctx: any) => {
            const { id, updateData, context } = ctx.params;
            return await diagnosticService.updateDiagnostic(id, updateData, context);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await diagnosticService.deleteDiagnostic(id, context);
          },
        },
      },
      events: {
        'diagnostic.created': {
          handler: async (ctx: any) => {
            console.log('Diagnostic created event received:', ctx.params);
            // Handle diagnostic created event
          },
        },
        'diagnostic.updated': {
          handler: async (ctx: any) => {
            console.log('Diagnostic updated event received:', ctx.params);
            // Handle diagnostic updated event
          },
        },
        'diagnostic.deleted': {
          handler: async (ctx: any) => {
            console.log('Diagnostic deleted event received:', ctx.params);
            // Handle diagnostic deleted event
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
      res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
      next();
    });

    // Global prefix
    app.use('/api/v2', (req, res) => {
      res.json({ message: 'Diagnostic Service is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.DIAGNOSTIC_SERVICE_PORT || 3007;
    app.listen(port, () => {
      console.log(`Diagnostic Service listening on port ${port}`);
    });
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Diagnostic Service stopped');
    } catch (error) {
      console.error('Error stopping Diagnostic Service:', error);
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
const service = new DiagnosticMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Diagnostic Service:', error);
  process.exit(1);
});
