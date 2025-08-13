import { prop, getModelForClass, modelOptions, Severity } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

@modelOptions({
	schemaOptions: { collection: 'files', timestamps: true },
	options: { allowMixed: Severity.ALLOW },
})
export class StoredFile extends BaseEntity {
	@prop({ required: true, trim: true })
	public fileName!: string;

	@prop({ required: true, trim: true })
	public originalName!: string;

	@prop({ required: true })
	public fileSize!: number;

	@prop({ required: true, trim: true })
	public mimeType!: string;

	@prop({ required: true, trim: true })
	public filePath!: string;

	@prop({ enum: ['document', 'image', 'video', 'audio', 'other'], default: 'document' })
	public fileType!: string;

	@prop({ enum: ['uploading', 'uploaded', 'processing', 'ready', 'deleted'], default: 'uploaded' })
	public status!: string;

	@prop({ type: () => Object })
	public metadata?: Record<string, any>;
}

export const StoredFileModel = getModelForClass(StoredFile);
