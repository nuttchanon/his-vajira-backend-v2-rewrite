import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { EformService } from './eform/eform.service';
import { EformController } from './eform/eform.controller';
import { Eform } from './eform/entity/eform.entity';

class EformMoleculerService {
  private broker: ServiceBroker;
  private eformService: EformService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'eform-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3037,
            path: '/metrics',
          },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Eform Service...');

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

      console.log('Eform Service started successfully');
    } catch (error) {
      console.error('Error starting Eform Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create eform service instance
    const eformService = new EformService();
    eformService.broker = this.broker;

    // Create eform action
    this.broker.createService({
      name: 'eform',
      actions: {
        create: {
          handler: async (ctx: any) => {
            const { createEformDto, context } = ctx.params;
            return await eformService.createEform(createEformDto, context);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await eformService.getEformById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await eformService.getEforms(query);
          },
        },
        update: {
          handler: async (ctx: any) => {
            const { id, updateData, context } = ctx.params;
            return await eformService.updateEform(id, updateData, context);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await eformService.deleteEform(id, context);
          },
        },
      },
      events: {
        'eform.created': {
          handler: async (ctx: any) => {
            console.log('Eform created event received:', ctx.params);
            // Handle eform created event
          },
        },
        'eform.updated': {
          handler: async (ctx: any) => {
            console.log('Eform updated event received:', ctx.params);
            // Handle eform updated event
          },
        },
        'eform.deleted': {
          handler: async (ctx: any) => {
            console.log('Eform deleted event received:', ctx.params);
            // Handle eform deleted event
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
      res.json({ message: 'Eform Service is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.EFORM_SERVICE_PORT || 3009;
    app.listen(port, () => {
      console.log(`Eform Service listening on port ${port}`);
    });
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Eform Service stopped');
    } catch (error) {
      console.error('Error stopping Eform Service:', error);
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
const service = new EformMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Eform Service:', error);
  process.exit(1);
});
