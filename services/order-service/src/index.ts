import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { OrderService } from './order/order.service';
import { OrderController } from './order/order.controller';
import { Order } from './order/entity/order.entity';

class OrderMoleculerService {
  private broker: ServiceBroker;
  private orderService: OrderService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'order-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3032,
            path: '/metrics',
          },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Order Service...');

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

      console.log('Order Service started successfully');
    } catch (error) {
      console.error('Error starting Order Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create order service instance
    const orderService = new OrderService();
    orderService.broker = this.broker;

    // Create order action
    this.broker.createService({
      name: 'order',
      actions: {
        create: {
          handler: async (ctx: any) => {
            const { createOrderDto, context } = ctx.params;
            return await orderService.createOrder(createOrderDto, context);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await orderService.getOrderById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await orderService.getOrders(query);
          },
        },
        update: {
          handler: async (ctx: any) => {
            const { id, updateData, context } = ctx.params;
            return await orderService.updateOrder(id, updateData, context);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await orderService.deleteOrder(id, context);
          },
        },
      },
      events: {
        'order.created': {
          handler: async (ctx: any) => {
            console.log('Order created event received:', ctx.params);
            // Handle order created event
          },
        },
        'order.updated': {
          handler: async (ctx: any) => {
            console.log('Order updated event received:', ctx.params);
            // Handle order updated event
          },
        },
        'order.deleted': {
          handler: async (ctx: any) => {
            console.log('Order deleted event received:', ctx.params);
            // Handle order deleted event
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
      res.json({ message: 'Order Service is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.ORDER_SERVICE_PORT || 3004;
    app.listen(port, () => {
      console.log(`Order Service listening on port ${port}`);
    });
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Order Service stopped');
    } catch (error) {
      console.error('Error stopping Order Service:', error);
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
const service = new OrderMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Order Service:', error);
  process.exit(1);
});
