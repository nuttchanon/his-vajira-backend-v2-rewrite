import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

@modelOptions({
  schemaOptions: {
    collection: 'inventories',
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class Inventory extends BaseEntity {
  @prop({ required: true, trim: true, unique: true })
  public itemCode!: string;

  @prop({ required: true, trim: true })
  public itemName!: string;

  @prop({ required: true, trim: true })
  public category!: string;

  @prop({ required: true, min: 0 })
  public stockQuantity!: number;

  @prop({ required: true, min: 0 })
  public unitPrice!: number;

  @prop({ required: true, trim: true })
  public unit!: string;

  @prop({ trim: true })
  public description?: string;

  @prop({ trim: true })
  public supplierId?: string;

  @prop({ trim: true })
  public supplierName?: string;

  @prop({ min: 0 })
  public reorderLevel?: number;

  @prop({ min: 0 })
  public maxStockLevel?: number;

  @prop({ required: true, enum: ['active', 'inactive', 'discontinued'] })
  public status!: string;

  @prop({ trim: true })
  public location?: string;

  @prop({ trim: true })
  public barcode?: string;

  @prop({ type: () => [String] })
  public tags?: string[];

  @prop({ type: () => Object })
  public specifications?: Record<string, any>;

  @prop({ type: () => Object })
  public metadata?: Record<string, any>;
}

export const InventoryModel = getModelForClass(Inventory);
