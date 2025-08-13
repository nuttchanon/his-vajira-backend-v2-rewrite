import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { Inventory } from './entities/inventory.entity';

class InventoryMoleculerService {
  private broker: ServiceBroker;
  private inventoryService: InventoryService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'inventory-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3033,
            path: '/metrics',
          },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Inventory Service...');

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

      console.log('Inventory Service started successfully');
    } catch (error) {
      console.error('Error starting Inventory Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create inventory service instance
    const inventoryService = new InventoryService();
    inventoryService.broker = this.broker;

    // Create inventory action
    this.broker.createService({
      name: 'inventory',
      actions: {
        create: {
          handler: async (ctx: any) => {
            const { createInventoryDto, context } = ctx.params;
            return await inventoryService.createInventory(createInventoryDto, context);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await inventoryService.getInventoryById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await inventoryService.getInventories(query);
          },
        },
        update: {
          handler: async (ctx: any) => {
            const { id, updateData, context } = ctx.params;
            return await inventoryService.updateInventory(id, updateData, context);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await inventoryService.deleteInventory(id, context);
          },
        },
      },
      events: {
        'inventory.created': {
          handler: async (ctx: any) => {
            console.log('Inventory created event received:', ctx.params);
            // Handle inventory created event
          },
        },
        'inventory.updated': {
          handler: async (ctx: any) => {
            console.log('Inventory updated event received:', ctx.params);
            // Handle inventory updated event
          },
        },
        'inventory.deleted': {
          handler: async (ctx: any) => {
            console.log('Inventory deleted event received:', ctx.params);
            // Handle inventory deleted event
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
      res.json({ message: 'Inventory Service is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.INVENTORY_SERVICE_PORT || 3005;
    app.listen(port, () => {
      console.log(`Inventory Service listening on port ${port}`);
    });
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Inventory Service stopped');
    } catch (error) {
      console.error('Error stopping Inventory Service:', error);
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
const service = new InventoryMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Inventory Service:', error);
  process.exit(1);
});
