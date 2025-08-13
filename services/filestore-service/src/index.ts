import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { FilestoreService } from './services/filestore.service';
import { FilestoreController } from './controllers/filestore.controller';
import { Filestore } from './entities/filestore.entity';

class FilestoreMoleculerService {
  private broker: ServiceBroker;
  private filestoreService: FilestoreService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'filestore-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3038,
            path: '/metrics',
          },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Filestore Service...');

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

      console.log('Filestore Service started successfully');
    } catch (error) {
      console.error('Error starting Filestore Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create filestore service instance
    const filestoreService = new FilestoreService();
    filestoreService.broker = this.broker;

    // Create filestore action
    this.broker.createService({
      name: 'filestore',
      actions: {
        upload: {
          handler: async (ctx: any) => {
            const { file, context } = ctx.params;
            return await filestoreService.uploadFile(file, context);
          },
        },
        download: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await filestoreService.downloadFile(id);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await filestoreService.getFileById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await filestoreService.getFiles(query);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await filestoreService.deleteFile(id, context);
          },
        },
      },
      events: {
        'file.uploaded': {
          handler: async (ctx: any) => {
            console.log('File uploaded event received:', ctx.params);
            // Handle file uploaded event
          },
        },
        'file.deleted': {
          handler: async (ctx: any) => {
            console.log('File deleted event received:', ctx.params);
            // Handle file deleted event
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
      res.json({ message: 'Filestore Service is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.FILESTORE_SERVICE_PORT || 3010;
    app.listen(port, () => {
      console.log(`Filestore Service listening on port ${port}`);
    });
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Filestore Service stopped');
    } catch (error) {
      console.error('Error stopping Filestore Service:', error);
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
const service = new FilestoreMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Filestore Service:', error);
  process.exit(1);
});
