import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ServiceBroker } from 'moleculer';
import { connect, disconnect } from 'mongoose';
import { PatientService } from './services/patient.service';
import { PatientController } from './controllers/patient.controller';
import { Patient } from './entities/patient.entity';

class PatientMoleculerService {
  private broker: ServiceBroker;
  private patientService: PatientService;

  constructor() {
    this.broker = new ServiceBroker({
      nodeID: 'patient-service',
      transporter: process.env.NATS_URI || 'nats://localhost:4222',
      logLevel: 'info',
      metrics: {
        enabled: true,
        reporter: {
          type: 'Prometheus',
          options: {
            port: 3030,
            path: '/metrics',
          },
        },
      },
    });

    this.patientService = new PatientService();
    this.patientService.broker = this.broker;
  }

  async start() {
    try {
      console.log('Starting Patient Service...');

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

      console.log('Patient Service started successfully');
    } catch (error) {
      console.error('Error starting Patient Service:', error);
      process.exit(1);
    }
  }

  private registerActions() {
    // Create patient action
    this.broker.createService({
      name: 'patient',
      actions: {
        create: {
          handler: async (ctx: any) => {
            const { createPatientDto, context } = ctx.params;
            return await this.patientService.createPatient(createPatientDto, context);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await this.patientService.getPatientById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await this.patientService.getPatients(query);
          },
        },
        update: {
          handler: async (ctx: any) => {
            const { id, updateData, context } = ctx.params;
            return await this.patientService.updatePatient(id, updateData, context);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await this.patientService.deletePatient(id, context);
          },
        },
      },
      events: {
        'patient.created': {
          handler: async (ctx: any) => {
            console.log('Patient created event received:', ctx.params);
            // Handle patient created event
          },
        },
        'patient.updated': {
          handler: async (ctx: any) => {
            console.log('Patient updated event received:', ctx.params);
            // Handle patient updated event
          },
        },
        'patient.deleted': {
          handler: async (ctx: any) => {
            console.log('Patient deleted event received:', ctx.params);
            // Handle patient deleted event
          },
        },
      },
    });
  }

  private async startNestJS() {
    const app = await NestFactory.create(PatientController);

    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });

    // Global prefix
    app.setGlobalPrefix('api/v2');

    // Start HTTP server
    const port = process.env.PATIENT_SERVICE_PORT || 3002;
    await app.listen(port);
    console.log(`NestJS application listening on port ${port}`);
  }

  async stop() {
    try {
      await this.broker.stop();
      await disconnect();
      console.log('Patient Service stopped');
    } catch (error) {
      console.error('Error stopping Patient Service:', error);
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
const service = new PatientMoleculerService();
service.start().catch(error => {
  console.error('Failed to start Patient Service:', error);
  process.exit(1);
});
