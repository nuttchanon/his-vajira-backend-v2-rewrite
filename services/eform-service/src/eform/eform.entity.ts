import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

@modelOptions({
  schemaOptions: {
    collection: 'eforms',
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Eform extends BaseEntity {
  @prop({ required: true, index: true })
  public code!: string;

  @prop({ required: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ required: true })
  public version!: string;

  @prop({ enum: ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'DRAFT' })
  public status!: string;

  @prop({ type: () => Object, required: true })
  public schema!: Record<string, any>;

  @prop({ type: () => Object })
  public uiSchema?: Record<string, any>;

  @prop({ type: () => [String] })
  public tags?: string[];

  @prop()
  public category?: string;

  @prop()
  public department?: string;

  @prop({ type: () => [String] })
  public requiredRoles?: string[];

  @prop({ type: () => [String] })
  public allowedRoles?: string[];

  @prop()
  public isTemplate?: boolean;

  @prop()
  public templateId?: string;

  @prop({ type: () => Object })
  public validationRules?: Record<string, any>;

  @prop({ type: () => Object })
  public metadata?: Record<string, any>;

  @prop()
  public effectiveDate?: Date;

  @prop()
  public expiryDate?: Date;
}

export const EformModel = getModelForClass(Eform);
