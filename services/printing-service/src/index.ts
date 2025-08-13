import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { AppModule } from './app.module';
import { PrintingService } from './printing/printing.service';
import { PrintingRepository } from './printing/printing.repository';

class PrintingMoleculerService {
  private broker: ServiceBroker;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'printing-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: { port: 3040, path: '/metrics' },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Printing Service...');

      await connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/his', {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Connected to MongoDB');

      await this.broker.start();
      console.log('Moleculer broker started');

      this.registerActions();

      await this.startNestJS();

      console.log('Printing Service started successfully');
    } catch (error) {
      console.error('Error starting Printing Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    const printingRepository = new PrintingRepository();
    const printingService = new PrintingService(printingRepository);
    (printingService as any).broker = this.broker;

    this.broker.createService({
      name: 'printing',
      actions: {
        generate: {
          handler: async (ctx: any) => {
            const { generateReportDto, context } = ctx.params || {};
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
          },
        },
        'report.updated': {
          handler: async (ctx: any) => {
            console.log('Report updated event received:', ctx.params);
          },
        },
        'report.deleted': {
          handler: async (ctx: any) => {
            console.log('Report deleted event received:', ctx.params);
          },
        },
      },
    });
  }

  private async startNestJS() {
    try {
      const app = await NestFactory.create(AppModule);
      app.enableCors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
      });
      app.setGlobalPrefix('api/v2');
      const port = process.env.PRINTING_SERVICE_PORT || 3012;
      await app.listen(port as number);
      console.log(`Printing Service listening on port ${port}`);
    } catch (error) {
      console.error('Error starting NestJS application:', error);
      throw error;
    }
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

const service = new PrintingMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Printing Service:', error);
  process.exit(1);
});
