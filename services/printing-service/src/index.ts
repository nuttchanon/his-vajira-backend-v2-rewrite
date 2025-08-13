import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { PrintingService } from './services/printing.service';
import { PrintingController } from './controllers/printing.controller';
import { Report } from './entities/report.entity';

class PrintingMoleculerService {
  private broker: ServiceBroker;
  private printingService: PrintingService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'printing-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3040,
            path: '/metrics',
          },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Printing Service...');

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

      console.log('Printing Service started successfully');
    } catch (error) {
      console.error('Error starting Printing Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create printing service instance
    const printingService = new PrintingService();
    printingService.broker = this.broker;

    // Create printing action
    this.broker.createService({
      name: 'printing',
      actions: {
        generate: {
          handler: async (ctx: any) => {
            const { generateReportDto, context } = ctx.params;
            return await printingService.generateReport(generateReportDto, context);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await printingService.getReportById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await printingService.getReports(query);
          },
        },
        update: {
          handler: async (ctx: any) => {
            const { id, updateData, context } = ctx.params;
            return await printingService.updateReport(id, updateData, context);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await printingService.deleteReport(id, context);
          },
        },
      },
      events: {
        'report.generated': {
          handler: async (ctx: any) => {
            console.log('Report generated event received:', ctx.params);
            // Handle report generated event
          },
        },
        'report.updated': {
          handler: async (ctx: any) => {
            console.log('Report updated event received:', ctx.params);
            // Handle report updated event
          },
        },
        'report.deleted': {
          handler: async (ctx: any) => {
            console.log('Report deleted event received:', ctx.params);
            // Handle report deleted event
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
      res.json({ message: 'Printing Service is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.PRINTING_SERVICE_PORT || 3012;
    app.listen(port, () => {
      console.log(`Printing Service listening on port ${port}`);
    });
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Printing Service stopped');
    } catch (error) {
      console.error('Error stopping Printing Service:', error);
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
const service = new PrintingMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Printing Service:', error);
  process.exit(1);
});
