import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsArray,
  IsNumber,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  EncounterStatus,
  EncounterClass,
  EncounterPriority,
  Participant,
  Diagnosis,
  Hospitalization,
  Location,
} from './encounter.entity';

export class CreateEncounterDto {
  @IsString()
  patientId!: string;

  @IsEnum(EncounterStatus)
  @IsOptional()
  status?: EncounterStatus;

  @IsEnum(EncounterClass)
  encounterClass!: EncounterClass;

  @IsEnum(EncounterPriority)
  @IsOptional()
  priority?: EncounterPriority;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  length?: number;

  @IsString()
  @IsOptional()
  reasonCode?: string;

  @IsString()
  @IsOptional()
  reasonText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  @IsOptional()
  participants?: Participant[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisDto)
  @IsOptional()
  diagnoses?: Diagnosis[];

  @IsObject()
  @ValidateNested()
  @Type(() => HospitalizationDto)
  @IsOptional()
  hospitalization?: Hospitalization;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  @IsOptional()
  locations?: Location[];

  @IsString()
  @IsOptional()
  serviceProvider?: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  episodeOfCareId?: string;

  @IsString()
  @IsOptional()
  basedOn?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  appointmentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  orderIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  procedureIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  observationIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medicationIds?: string[];

  @IsString()
  @IsOptional()
  partOf?: string;
}

export class UpdateEncounterDto {
  @IsEnum(EncounterStatus)
  @IsOptional()
  status?: EncounterStatus;

  @IsEnum(EncounterClass)
  @IsOptional()
  encounterClass?: EncounterClass;

  @IsEnum(EncounterPriority)
  @IsOptional()
  priority?: EncounterPriority;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  length?: number;

  @IsString()
  @IsOptional()
  reasonCode?: string;

  @IsString()
  @IsOptional()
  reasonText?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  @IsOptional()
  participants?: Participant[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisDto)
  @IsOptional()
  diagnoses?: Diagnosis[];

  @IsObject()
  @ValidateNested()
  @Type(() => HospitalizationDto)
  @IsOptional()
  hospitalization?: Hospitalization;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocationDto)
  @IsOptional()
  locations?: Location[];

  @IsString()
  @IsOptional()
  serviceProvider?: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsOptional()
  episodeOfCareId?: string;

  @IsString()
  @IsOptional()
  basedOn?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  appointmentIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  orderIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  procedureIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  observationIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medicationIds?: string[];

  @IsString()
  @IsOptional()
  partOf?: string;
}

export class ParticipantDto {
  @IsArray()
  @IsString({ each: true })
  type!: string[];

  @IsObject()
  @IsOptional()
  period?: {
    start: string;
    end?: string;
  };

  @IsObject()
  @IsOptional()
  individual?: {
    reference: string;
    display: string;
  };
}

export class DiagnosisDto {
  @IsObject()
  condition!: {
    reference: string;
    display: string;
  };

  @IsObject()
  use!: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };

  @IsNumber()
  @IsOptional()
  rank?: number;
}

export class HospitalizationDto {
  @IsObject()
  @IsOptional()
  preAdmissionIdentifier?: {
    system: string;
    value: string;
  };

  @IsObject()
  @IsOptional()
  origin?: {
    reference: string;
    display: string;
  };

  @IsObject()
  @IsOptional()
  admitSource?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };

  @IsObject()
  @IsOptional()
  reAdmission?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };

  @IsArray()
  @IsOptional()
  dietPreference?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  }>;

  @IsArray()
  @IsOptional()
  specialCourtesy?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  }>;

  @IsArray()
  @IsOptional()
  specialArrangement?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  }>;

  @IsObject()
  @IsOptional()
  destination?: {
    reference: string;
    display: string;
  };

  @IsObject()
  @IsOptional()
  dischargeDisposition?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };
}

export class LocationDto {
  @IsObject()
  location!: {
    reference: string;
    display: string;
  };

  @IsString()
  status!: 'planned' | 'active' | 'reserved' | 'completed';

  @IsObject()
  @IsOptional()
  physicalType?: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text: string;
  };

  @IsObject()
  @IsOptional()
  period?: {
    start: string;
    end?: string;
  };
}

export class EncounterQueryDto {
  @IsString()
  @IsOptional()
  patientId?: string;

  @IsEnum(EncounterStatus)
  @IsOptional()
  status?: EncounterStatus;

  @IsEnum(EncounterClass)
  @IsOptional()
  encounterClass?: EncounterClass;

  @IsEnum(EncounterPriority)
  @IsOptional()
  priority?: EncounterPriority;

  @IsDateString()
  @IsOptional()
  startDateFrom?: string;

  @IsDateString()
  @IsOptional()
  startDateTo?: string;

  @IsDateString()
  @IsOptional()
  endDateFrom?: string;

  @IsDateString()
  @IsOptional()
  endDateTo?: string;

  @IsString()
  @IsOptional()
  serviceProvider?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

export class EncounterResponseDto {
  id!: string;
  patientId!: string;
  status!: EncounterStatus;
  encounterClass!: EncounterClass;
  priority!: EncounterPriority;
  startDate!: Date;
  endDate?: Date;
  length?: number;
  reasonCode?: string;
  reasonText?: string;
  participants!: Participant[];
  diagnoses!: Diagnosis[];
  hospitalization?: Hospitalization;
  locations!: Location[];
  serviceProvider?: string;
  accountId?: string;
  episodeOfCareId?: string;
  basedOn?: string;
  appointmentIds!: string[];
  orderIds!: string[];
  procedureIds!: string[];
  observationIds!: string[];
  medicationIds!: string[];
  partOf?: string;
  childEncounters!: string[];
  metadata?: Record<string, any>;
  duration?: number;
  isActive!: boolean;
  isCompleted!: boolean;
  isCancelled!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
