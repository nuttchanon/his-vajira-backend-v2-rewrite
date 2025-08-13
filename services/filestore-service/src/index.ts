import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { AppModule } from './app.module';
import { FilestoreService } from './filestore/filestore.service';
import { FilestoreRepository } from './filestore/filestore.repository';

class FilestoreMoleculerService {
  private broker: ServiceBroker;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'filestore-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: { port: 3038, path: '/metrics' },
        },
      },
    });
  }

  async start() {
    try {
      console.log('Starting Filestore Service...');

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

      console.log('Filestore Service started successfully');
    } catch (error) {
      console.error('Error starting Filestore Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    const filestoreRepository = new FilestoreRepository();
    const filestoreService = new FilestoreService(filestoreRepository);
    (filestoreService as any).broker = this.broker;

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
            // download flow is usually handled by gateway; placeholder
            return await filestoreService.getFileById(id);
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
          },
        },
        'file.deleted': {
          handler: async (ctx: any) => {
            console.log('File deleted event received:', ctx.params);
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
      const port = process.env.FILESTORE_SERVICE_PORT || 3010;
      await app.listen(port as number);
      console.log(`Filestore Service listening on port ${port}`);
    } catch (error) {
      console.error('Error starting NestJS application:', error);
      throw error;
    }
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

const service = new FilestoreMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Filestore Service:', error);
  process.exit(1);
});
