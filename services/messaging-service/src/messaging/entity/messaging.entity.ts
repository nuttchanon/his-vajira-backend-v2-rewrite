import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

@modelOptions({
  schemaOptions: {
    collection: 'messaging',
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Messaging extends BaseEntity {
  @prop({ required: true, trim: true, unique: true })
  public messageId!: string;

  @prop({ required: true, trim: true })
  public senderId!: string;

  @prop({ required: true, trim: true })
  public senderName!: string;

  @prop({ required: true, trim: true })
  public recipientId!: string;

  @prop({ required: true, trim: true })
  public recipientName!: string;

  @prop({ required: true, trim: true })
  public subject!: string;

  @prop({ required: true, trim: true })
  public content!: string;

  @prop({ required: true, enum: ['email', 'sms', 'notification', 'internal'] })
  public messageType!: string;

  @prop({ required: true, enum: ['draft', 'sent', 'delivered', 'read', 'failed'] })
  public status!: string;

  @prop({ enum: ['low', 'normal', 'high', 'urgent'] })
  public priority?: string;

  @prop({ type: () => [String] })
  public attachments?: string[];

  @prop({ type: () => Object })
  public metadata?: Record<string, any>;
}

export const MessagingModel = getModelForClass(Messaging);
