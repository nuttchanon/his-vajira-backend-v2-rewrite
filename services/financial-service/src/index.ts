import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { FinancialService } from './financial/financial.service';
import { FinancialController } from './financial/financial.controller';
import { Financial } from './financial/entity/financial.entity';

class FinancialMoleculerService {
  private broker: ServiceBroker;
  private financialService: FinancialService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'financial-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3036,
            path: '/metrics',
          },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Financial Service...');

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

      console.log('Financial Service started successfully');
    } catch (error) {
      console.error('Error starting Financial Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create financial service instance
    const financialService = new FinancialService();
    financialService.broker = this.broker;

    // Create financial action
    this.broker.createService({
      name: 'financial',
      actions: {
        create: {
          handler: async (ctx: any) => {
            const { createFinancialDto, context } = ctx.params;
            return await financialService.createFinancial(createFinancialDto, context);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await financialService.getFinancialById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await financialService.getFinancials(query);
          },
        },
        update: {
          handler: async (ctx: any) => {
            const { id, updateData, context } = ctx.params;
            return await financialService.updateFinancial(id, updateData, context);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await financialService.deleteFinancial(id, context);
          },
        },
      },
      events: {
        'financial.created': {
          handler: async (ctx: any) => {
            console.log('Financial created event received:', ctx.params);
            // Handle financial created event
          },
        },
        'financial.updated': {
          handler: async (ctx: any) => {
            console.log('Financial updated event received:', ctx.params);
            // Handle financial updated event
          },
        },
        'financial.deleted': {
          handler: async (ctx: any) => {
            console.log('Financial deleted event received:', ctx.params);
            // Handle financial deleted event
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
      res.json({ message: 'Financial Service is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.FINANCIAL_SERVICE_PORT || 3008;
    app.listen(port, () => {
      console.log(`Financial Service listening on port ${port}`);
    });
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Financial Service stopped');
    } catch (error) {
      console.error('Error stopping Financial Service:', error);
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
const service = new FinancialMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Financial Service:', error);
  process.exit(1);
});
