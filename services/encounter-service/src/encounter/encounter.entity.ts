import { prop, modelOptions, Ref } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

export enum EncounterStatus {
  PLANNED = 'planned',
  ARRIVED = 'arrived',
  IN_PROGRESS = 'in-progress',
  ONLEAVE = 'onleave',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  ENTERED_IN_ERROR = 'entered-in-error',
  UNKNOWN = 'unknown',
}

export enum EncounterClass {
  INPATIENT = 'inpatient',
  OUTPATIENT = 'outpatient',
  AMBULATORY = 'ambulatory',
  EMERGENCY = 'emergency',
  HOME = 'home',
  FIELD = 'field',
  DAYTIME = 'daytime',
  VIRTUAL = 'virtual',
}

export enum EncounterPriority {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  ASAP = 'asap',
  STAT = 'stat',
}

export interface Participant {
  type: string[];
  period?: {
    start: Date;
    end?: Date;
  };
  individual?: {
    reference: string;
    display: string;
  };
}

export interface StatusHistory {
  status: EncounterStatus;
  period: {
    start: Date;
    end?: Date;
  };
  updatedBy: string;
  updatedByName: string;
  updatedAt: Date;
  reason?: string;
}

export interface Diagnosis {
  condition: {
    reference: string;
    display: string;
  };
  use: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  rank?: number;
}

export interface Hospitalization {
  preAdmissionIdentifier?: {
    system: string;
    value: string;
  };
  origin?: {
    reference: string;
    display: string;
  };
  admitSource?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  reAdmission?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  dietPreference?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  }>;
  specialCourtesy?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  }>;
  specialArrangement?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  }>;
  destination?: {
    reference: string;
    display: string;
  };
  dischargeDisposition?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
}

export interface Location {
  location: {
    reference: string;
    display: string;
  };
  status: 'planned' | 'active' | 'reserved' | 'completed';
  physicalType?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
  period?: {
    start: Date;
    end?: Date;
  };
}

@modelOptions({
  schemaOptions: {
    collection: 'encounters',
    collation: { locale: 'en' },
    allowMixed: true,
    indexes: [
      { patientId: 1 },
      { status: 1 },
      { encounterClass: 1 },
      { startDate: 1 },
      { endDate: 1 },
      { active: 1, createdAt: -1 },
      { patientId: 1, active: 1 },
      { status: 1, active: 1 },
      { encounterClass: 1, active: 1 },
      { startDate: 1, active: 1 },
    ],
  },
})
export class Encounter extends BaseEntity {
  @prop({ required: true, index: true })
  patientId!: string;

  @prop({ required: true, enum: Object.values(EncounterStatus), type: String, default: EncounterStatus.PLANNED })
  status!: EncounterStatus;

  @prop({ required: true, enum: Object.values(EncounterClass), type: String })
  encounterClass!: EncounterClass;

  @prop({ required: true, enum: Object.values(EncounterPriority), type: String, default: EncounterPriority.ROUTINE })
  priority!: EncounterPriority;

  @prop({ required: true, type: Date })
  startDate!: Date;

  @prop({ type: Date })
  endDate?: Date;

  @prop({ type: Number })
  length?: number; // Duration in minutes

  @prop({ type: String })
  reasonCode?: string;

  @prop({ type: String })
  reasonText?: string;

  @prop({ type: [Object], default: [] })
  participants!: Participant[];

  @prop({ type: [Object], default: [] })
  statusHistory!: StatusHistory[];

  @prop({ type: [Object], default: [] })
  diagnoses!: Diagnosis[];

  @prop({ type: Object })
  hospitalization?: Hospitalization;

  @prop({ type: [Object], default: [] })
  locations!: Location[];

  @prop({ type: String })
  serviceProvider?: string;

  @prop({ type: String })
  accountId?: string;

  @prop({ type: String })
  episodeOfCareId?: string;

  @prop({ type: String })
  basedOn?: string;

  @prop({ type: [String], default: [] })
  appointmentIds!: string[];

  @prop({ type: [String], default: [] })
  orderIds!: string[];

  @prop({ type: [String], default: [] })
  procedureIds!: string[];

  @prop({ type: [String], default: [] })
  observationIds!: string[];

  @prop({ type: [String], default: [] })
  medicationIds!: string[];

  @prop({ type: String })
  partOf?: string; // Reference to parent encounter

  @prop({ type: [String], default: [] })
  childEncounters!: string[]; // References to child encounters

  @prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  // Virtual for encounter duration
  get duration(): number | null {
    if (!this.startDate) return null;
    const end = this.endDate || new Date();
    return Math.floor((end.getTime() - this.startDate.getTime()) / (1000 * 60)); // Duration in minutes
  }

  // Virtual for is active
  get isActive(): boolean {
    return this.status === EncounterStatus.IN_PROGRESS || this.status === EncounterStatus.ARRIVED;
  }

  // Virtual for is completed
  get isCompleted(): boolean {
    return this.status === EncounterStatus.FINISHED;
  }

  // Virtual for is cancelled
  get isCancelled(): boolean {
    return this.status === EncounterStatus.CANCELLED;
  }
}
