import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { EncounterService } from './services/encounter.service';
import { EncounterController } from './controllers/encounter.controller';
import { Encounter } from './entities/encounter.entity';

class EncounterMoleculerService {
  private broker: ServiceBroker;
  private encounterService: EncounterService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'encounter-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3034,
            path: '/metrics',
          },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Encounter Service...');

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

      console.log('Encounter Service started successfully');
    } catch (error) {
      console.error('Error starting Encounter Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create encounter service instance
    const encounterService = new EncounterService();
    encounterService.broker = this.broker;

    // Create encounter action
    this.broker.createService({
      name: 'encounter',
      actions: {
        create: {
          handler: async (ctx: any) => {
            const { createEncounterDto, context } = ctx.params;
            return await encounterService.createEncounter(createEncounterDto, context);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await encounterService.getEncounterById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await encounterService.getEncounters(query);
          },
        },
        update: {
          handler: async (ctx: any) => {
            const { id, updateData, context } = ctx.params;
            return await encounterService.updateEncounter(id, updateData, context);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await encounterService.deleteEncounter(id, context);
          },
        },
      },
      events: {
        'encounter.created': {
          handler: async (ctx: any) => {
            console.log('Encounter created event received:', ctx.params);
            // Handle encounter created event
          },
        },
        'encounter.updated': {
          handler: async (ctx: any) => {
            console.log('Encounter updated event received:', ctx.params);
            // Handle encounter updated event
          },
        },
        'encounter.deleted': {
          handler: async (ctx: any) => {
            console.log('Encounter deleted event received:', ctx.params);
            // Handle encounter deleted event
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
      res.json({ message: 'Encounter Service is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.ENCOUNTER_SERVICE_PORT || 3006;
    app.listen(port, () => {
      console.log(`Encounter Service listening on port ${port}`);
    });
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Encounter Service stopped');
    } catch (error) {
      console.error('Error stopping Encounter Service:', error);
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
const service = new EncounterMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Encounter Service:', error);
  process.exit(1);
});
