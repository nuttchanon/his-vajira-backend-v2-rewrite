import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

@modelOptions({
  schemaOptions: {
    collection: 'diagnostics',
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Diagnostic extends BaseEntity {
  @prop({ required: true, index: true })
  public code!: string;

  @prop({ required: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ enum: ['ICD-10', 'ICD-11', 'SNOMED-CT', 'LOINC', 'CUSTOM'], default: 'ICD-10' })
  public codingSystem!: string;

  @prop()
  public category?: string;

  @prop()
  public severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @prop({ type: () => [String] })
  public synonyms?: string[];

  @prop({ type: () => [String] })
  public relatedCodes?: string[];

  @prop()
  public isActive?: boolean;

  @prop()
  public effectiveDate?: Date;

  @prop()
  public expiryDate?: Date;

  @prop({ type: () => Object })
  public metadata?: Record<string, any>;
}

export const DiagnosticModel = getModelForClass(Diagnostic);
