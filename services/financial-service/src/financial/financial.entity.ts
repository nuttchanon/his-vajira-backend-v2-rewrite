import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

@modelOptions({
  schemaOptions: {
    collection: 'financials',
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Financial extends BaseEntity {
  @prop({ required: true, index: true })
  public code!: string;

  @prop({ required: true })
  public name!: string;

  @prop()
  public description?: string;

  @prop({ required: true, enum: ['INCOME', 'EXPENSE', 'ASSET', 'LIABILITY', 'EQUITY'] })
  public type!: string;

  @prop({ required: true, enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'], default: 'ACTIVE' })
  public status!: string;

  @prop({ required: true })
  public amount!: number;

  @prop({ required: true })
  public currency!: string;

  @prop()
  public category?: string;

  @prop()
  public subcategory?: string;

  @prop()
  public department?: string;

  @prop()
  public fiscalYear?: string;

  @prop()
  public fiscalPeriod?: string;

  @prop()
  public transactionDate?: Date;

  @prop()
  public dueDate?: Date;

  @prop()
  public paymentDate?: Date;

  @prop({ type: () => [String] })
  public tags?: string[];

  @prop({ type: () => Object })
  public metadata?: Record<string, any>;

  @prop()
  public referenceNumber?: string;

  @prop()
  public externalReference?: string;

  @prop()
  public notes?: string;
}

export const FinancialModel = getModelForClass(Financial);
