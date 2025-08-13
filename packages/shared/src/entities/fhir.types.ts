import { prop } from '@typegoose/typegoose';

// FHIR Identifier
export class Identifier {
  @prop({ required: true })
  system!: string;

  @prop({ required: true })
  value!: string;

  @prop()
  use?: string;

  @prop()
  type?: CodeableConcept;

  @prop()
  period?: Period;

  @prop()
  assigner?: Reference;
}

// FHIR HumanName
export class HumanName {
  @prop()
  use?: string;

  @prop()
  text?: string;

  @prop()
  family?: string;

  @prop({ type: () => [String] })
  given?: string[];

  @prop({ type: () => [String] })
  prefix?: string[];

  @prop({ type: () => [String] })
  suffix?: string[];

  @prop()
  period?: Period;
}

// FHIR ContactPoint
export class ContactPoint {
  @prop()
  system?: string;

  @prop()
  value?: string;

  @prop()
  use?: string;

  @prop()
  rank?: number;

  @prop()
  period?: Period;
}

// FHIR Address
export class Address {
  @prop()
  use?: string;

  @prop()
  type?: string;

  @prop()
  text?: string;

  @prop({ type: () => [String] })
  line?: string[];

  @prop()
  city?: string;

  @prop()
  district?: string;

  @prop()
  state?: string;

  @prop()
  postalCode?: string;

  @prop()
  country?: string;

  @prop()
  period?: Period;
}

// FHIR CodeableConcept
export class CodeableConcept {
  @prop({ type: () => [Coding] })
  coding?: Coding[];

  @prop()
  text?: string;
}

// FHIR Coding
export class Coding {
  @prop()
  system?: string;

  @prop()
  version?: string;

  @prop()
  code?: string;

  @prop()
  display?: string;

  @prop()
  userSelected?: boolean;
}

// FHIR Reference
export class Reference {
  @prop()
  reference?: string;

  @prop()
  type?: string;

  @prop()
  identifier?: Identifier;

  @prop()
  display?: string;
}

// FHIR Period
export class Period {
  @prop()
  start?: Date;

  @prop()
  end?: Date;
}

// FHIR Quantity
export class Quantity {
  @prop()
  value?: number;

  @prop()
  comparator?: string;

  @prop()
  unit?: string;

  @prop()
  system?: string;

  @prop()
  code?: string;
}

// FHIR Ratio
export class Ratio {
  @prop()
  numerator?: Quantity;

  @prop()
  denominator?: Quantity;
}

// FHIR Range
export class Range {
  @prop()
  low?: Quantity;

  @prop()
  high?: Quantity;
}

// FHIR Annotation
export class Annotation {
  @prop()
  authorReference?: Reference;

  @prop()
  authorString?: string;

  @prop()
  time?: Date;

  @prop({ required: true })
  text!: string;
}

// FHIR Extension
export class Extension {
  @prop({ required: true })
  url!: string;

  @prop()
  valueBoolean?: boolean;

  @prop()
  valueInteger?: number;

  @prop()
  valueDecimal?: number;

  @prop()
  valueBase64Binary?: string;

  @prop()
  valueInstant?: Date;

  @prop()
  valueString?: string;

  @prop()
  valueUri?: string;

  @prop()
  valueDate?: Date;

  @prop()
  valueDateTime?: Date;

  @prop()
  valueTime?: string;

  @prop()
  valueCode?: string;

  @prop()
  valueOid?: string;

  @prop()
  valueId?: string;

  @prop()
  valueMarkdown?: string;

  @prop()
  valueUnsignedInt?: number;

  @prop()
  valuePositiveInt?: number;

  @prop()
  valueUrl?: string;

  @prop()
  valueCanonical?: string;

  @prop()
  valueReference?: Reference;

  @prop()
  valueCodeableConcept?: CodeableConcept;

  @prop()
  valueAddress?: Address;

  @prop()
  valueContactPoint?: ContactPoint;

  @prop()
  valueHumanName?: HumanName;

  @prop()
  valuePeriod?: Period;

  @prop()
  valueQuantity?: Quantity;

  @prop()
  valueRange?: Range;

  @prop()
  valueRatio?: Ratio;

  @prop()
  valueAnnotation?: Annotation;
}
