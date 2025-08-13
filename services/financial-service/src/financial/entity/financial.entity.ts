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
  @prop({ required: true, trim: true })
  public type!: string;

  @prop({ required: true, min: 0 })
  public amount!: number;

  @prop({ required: true, trim: true })
  public currency!: string;

  @prop({ required: true, trim: true })
  public description!: string;

  @prop({ required: true, trim: true })
  public category!: string;

  @prop({ trim: true })
  public referenceNumber?: string;

  @prop({ trim: true })
  public patientId?: string;

  @prop({ trim: true })
  public encounterId?: string;

  @prop({ required: true, enum: ['income', 'expense', 'transfer'] })
  public transactionType!: string;

  @prop({ required: true, enum: ['pending', 'completed', 'cancelled', 'refunded'] })
  public status!: string;

  @prop()
  public transactionDate?: Date;

  @prop({ trim: true })
  public paymentMethod?: string;

  @prop({ trim: true })
  public notes?: string;

  @prop({ type: () => [String] })
  public tags?: string[];

  @prop({ type: () => Object })
  public metadata?: Record<string, any>;
}

export const FinancialModel = getModelForClass(Financial);
