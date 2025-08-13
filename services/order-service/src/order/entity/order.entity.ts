import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

@modelOptions({
  schemaOptions: {
    collection: 'orders',
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Order extends BaseEntity {
  @prop({ required: true, trim: true, unique: true })
  public orderNumber!: string;

  @prop({ required: true, trim: true })
  public patientId!: string;

  @prop({ required: true, trim: true })
  public patientName!: string;

  @prop({ required: true, trim: true })
  public orderType!: string;

  @prop({ required: true, enum: ['pending', 'approved', 'in_progress', 'completed', 'cancelled'] })
  public status!: string;

  @prop({ required: true })
  public orderDate!: Date;

  @prop()
  public scheduledDate?: Date;

  @prop({ required: true, trim: true })
  public orderedBy!: string;

  @prop({ trim: true })
  public orderedByName?: string;

  @prop({ trim: true })
  public department?: string;

  @prop({ trim: true })
  public priority?: string;

  @prop({ type: () => [Object] })
  public orderItems!: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string;
    instructions?: string;
  }>;

  @prop({ trim: true })
  public clinicalNotes?: string;

  @prop({ trim: true })
  public specialInstructions?: string;

  @prop({ type: () => [String] })
  public attachments?: string[];

  @prop({ type: () => Object })
  public metadata?: Record<string, any>;
}

export const OrderModel = getModelForClass(Order);
