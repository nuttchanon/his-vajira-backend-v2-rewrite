import { prop, modelOptions } from '@typegoose/typegoose';
import { BaseEntity } from '@his/shared';
import {
  Identifier,
  HumanName,
  ContactPoint,
  Address,
  Reference,
  CodeableConcept,
  Extension,
} from '@his/shared';
import { AdministrativeGender } from '@his/shared';

@modelOptions({
  schemaOptions: {
    collection: 'patient',
    collation: { locale: 'en' },
    indexes: [
      { 'identifier.system': 1, 'identifier.value': 1 },
      { 'name.family': 1, 'name.given': 1 },
      { birthDate: 1 },
      { active: 1, createdAt: -1 },
      { 'identifier.system': 1, 'identifier.value': 1, active: 1 },
      {
        'name.family': 'text',
        'name.given': 'text',
        'identifier.value': 'text',
      },
    ],
  },
})
export class Patient extends BaseEntity {
  @prop({ required: true, type: () => [Identifier] })
  identifier!: Identifier[];

  @prop({ required: true, default: true })
  active!: boolean;

  @prop({ required: true, type: () => [HumanName] })
  name!: HumanName[];

  @prop({ required: true, enum: AdministrativeGender })
  gender!: AdministrativeGender;

  @prop({ required: true, index: true })
  birthDate!: Date;

  @prop({ type: () => [ContactPoint] })
  telecom?: ContactPoint[];

  @prop({ type: () => [Address] })
  address?: Address[];

  @prop({ type: () => [Reference] })
  contact?: Reference[];

  @prop({ type: () => [CodeableConcept] })
  communication?: CodeableConcept[];

  @prop({ type: () => [Reference] })
  generalPractitioner?: Reference[];

  @prop({ type: () => [Reference] })
  managingOrganization?: Reference[];

  @prop({ type: () => [Reference] })
  link?: Reference[];

  // FHIR Extensions for HIS-specific data
  @prop({ type: () => [Extension] })
  extension?: Extension[];
}
