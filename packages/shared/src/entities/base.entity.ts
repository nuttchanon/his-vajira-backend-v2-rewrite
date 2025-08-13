import { prop, modelOptions, Severity } from '@typegoose/typegoose';
import { v4 as uuidv4 } from 'uuid';

@modelOptions({
  schemaOptions: {
    id: false,
    strict: true,
    toJSON: { virtuals: true },
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export abstract class BaseEntity {
  @prop({
    default: () => uuidv4(),
    description: 'Unique identifier for the entity',
  })
  _id?: string;

  @prop({ select: false, description: 'Document version' })
  __v?: number;

  @prop({
    default: true,
    index: true,
    description: 'Whether the entity is active',
  })
  active?: boolean;

  @prop({
    description: 'User who created the entity',
    index: true,
  })
  createdBy?: string;

  @prop({
    description: 'User who last updated the entity',
    index: true,
  })
  updatedBy?: string;

  @prop({
    index: true,
    description: 'When the entity was created',
  })
  createdAt?: Date;

  @prop({
    index: true,
    description: 'When the entity was last updated',
  })
  updatedAt?: Date;

  @prop({
    description: 'Tenant identifier for multi-tenancy',
  })
  tenantId?: string;

  @prop({
    description: 'Source system identifier',
  })
  sourceSystem?: string;

  @prop({
    description: 'Name of the user who created the entity',
  })
  createdByName?: string;

  @prop({
    description: 'Name of the user who last updated the entity',
  })
  updatedByName?: string;

  @prop({
    description: 'Additional metadata and extensions',
    default: {},
  })
  extensions?: Record<string, any>;
}
