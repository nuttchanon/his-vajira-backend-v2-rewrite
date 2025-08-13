import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

@modelOptions({
	schemaOptions: { collection: 'reports', timestamps: true },
	options: { allowMixed: Severity.ALLOW },
})
export class Report extends BaseEntity {
	@prop({ required: true, trim: true })
	public name!: string;

	@prop({ required: true, trim: true })
	public template!: string;

	@prop({ type: () => Object })
	public parameters?: Record<string, any>;

	@prop({ enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
	public status!: string;

	@prop()
	public generatedAt?: Date;

	@prop({ trim: true })
	public fileId?: string;

	@prop({ type: () => Object })
	public metadata?: Record<string, any>;
}

export const ReportModel = getModelForClass(Report);
