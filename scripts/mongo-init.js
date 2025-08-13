// MongoDB initialization script for HIS Backend v2
// This script runs when the MongoDB container starts for the first time

db = db.getSiblingDB('his');

// Create collections with proper indexes
db.createCollection('patient');
db.createCollection('encounter');
db.createCollection('service_request');
db.createCollection('user');
db.createCollection('audit_log');

// Create indexes for patient collection
db.patient.createIndex({ 'identifier.system': 1, 'identifier.value': 1 }, { unique: true });
db.patient.createIndex({ 'name.family': 1, 'name.given': 1 });
db.patient.createIndex({ birthDate: 1 });
db.patient.createIndex({ active: 1, createdAt: -1 });
db.patient.createIndex({
  'name.family': 'text',
  'name.given': 'text',
  'identifier.value': 'text',
});

// Create indexes for encounter collection
db.encounter.createIndex({ patient: 1, status: 1, createdAt: -1 });
db.encounter.createIndex({ encounter: 1, type: 1, status: 1 });
db.encounter.createIndex({ requester: 1, createdAt: -1 });
db.encounter.createIndex({ 'period.start': 1, 'period.end': 1 });

// Create indexes for service_request collection
db.service_request.createIndex({ patient: 1, status: 1, createdAt: -1 });
db.service_request.createIndex({ encounter: 1, category: 1, status: 1 });
db.service_request.createIndex({ requester: 1, createdAt: -1 });
db.service_request.createIndex({ occurrenceDateTime: 1 });
db.service_request.createIndex({ priority: 1, status: 1 });

// Create indexes for user collection
db.user.createIndex({ email: 1 }, { unique: true });
db.user.createIndex({ username: 1 }, { unique: true });
db.user.createIndex({ active: 1, createdAt: -1 });

// Create indexes for audit_log collection
db.audit_log.createIndex({ entityType: 1, entityId: 1 });
db.audit_log.createIndex({ userId: 1, createdAt: -1 });
db.audit_log.createIndex({ action: 1, createdAt: -1 });
db.audit_log.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully');
