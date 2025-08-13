import { prop, modelOptions } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  RECEPTIONIST = 'receptionist',
  LAB_TECHNICIAN = 'lab_technician',
  RADIOLOGIST = 'radiologist',
  PHARMACIST = 'pharmacist',
  PATIENT = 'patient',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

@modelOptions({
  schemaOptions: {
    collection: 'users',
    collation: { locale: 'en' },
    allowMixed: true,
    indexes: [
      { username: 1 },
      { email: 1 },
      { employeeId: 1 },
      { active: 1, createdAt: -1 },
      { username: 1, active: 1 },
      { email: 1, active: 1 },
      { employeeId: 1, active: 1 },
    ],
  },
})
export class User extends BaseEntity {
  @prop({ required: true, unique: true, index: true })
  username!: string;

  @prop({ required: true, unique: true, index: true })
  email!: string;

  @prop({ required: true, select: false })
  password!: string;

  @prop({ required: true })
  firstName!: string;

  @prop({ required: true })
  lastName!: string;

  @prop({ required: true, enum: Object.values(UserRole), type: String })
  role!: UserRole;

  @prop({ required: true, enum: Object.values(UserStatus), type: String, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @prop({ unique: true, sparse: true, index: true })
  employeeId?: string;

  @prop()
  department?: string;

  @prop()
  position?: string;

  @prop()
  phoneNumber?: string;

  @prop()
  avatar?: string;

  @prop({ type: [String], default: [] })
  permissions!: string[];

  @prop({ type: Date })
  lastLoginAt?: Date;

  @prop({ type: Date })
  passwordChangedAt?: Date;

  @prop({ type: Date })
  passwordExpiresAt?: Date;

  @prop({ default: 0 })
  loginAttempts!: number;

  @prop({ type: Date })
  lockedUntil?: Date;

  @prop({ type: [String], default: [] })
  refreshTokens!: string[];

  @prop({ type: Object, default: {} })
  preferences?: Record<string, any>;

  @prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  // Virtual for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Virtual for is locked
  get isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  // Virtual for is password expired
  get isPasswordExpired(): boolean {
    return this.passwordExpiresAt ? this.passwordExpiresAt < new Date() : false;
  }
}
