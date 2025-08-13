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
    // Create patient service instance
    const patientService = new PatientService();
    patientService.broker = this.broker;

    // Create patient action
    this.broker.createService({
      name: 'patient',
      actions: {
        create: {
          handler: async (ctx: any) => {
            const { createPatientDto, context } = ctx.params;
            return await patientService.createPatient(createPatientDto, context);
          },
        },
        getById: {
          handler: async (ctx: any) => {
            const { id } = ctx.params;
            return await patientService.getPatientById(id);
          },
        },
        list: {
          handler: async (ctx: any) => {
            const { query } = ctx.params;
            return await patientService.getPatients(query);
          },
        },
        update: {
          handler: async (ctx: any) => {
            const { id, updateData, context } = ctx.params;
            return await patientService.updatePatient(id, updateData, context);
          },
        },
        delete: {
          handler: async (ctx: any) => {
            const { id, context } = ctx.params;
            return await patientService.deletePatient(id, context);
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
      res.json({ message: 'Patient Service is running', timestamp: new Date().toISOString() });
    });

    // Start HTTP server
    const port = process.env.PATIENT_SERVICE_PORT || 3002;
    app.listen(port, () => {
      console.log(`Patient Service listening on port ${port}`);
    });
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
