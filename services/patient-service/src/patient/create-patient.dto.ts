import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AdministrativeGender, Identifier, HumanName, ContactPoint, Address } from '@his/shared';

export class CreatePatientDto {
  @ApiProperty({
    description: 'Patient identifiers (HN, CID, etc.)',
    type: [Identifier],
    example: [{ system: 'HN', value: '12345' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Identifier)
  identifier!: Identifier[];

  @ApiProperty({
    description: 'Whether the patient is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean = true;

  @ApiProperty({
    description: 'Patient names',
    type: [HumanName],
    example: [{ given: ['John'], family: 'Doe' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HumanName)
  name!: HumanName[];

  @ApiProperty({
    description: 'Patient gender',
    enum: AdministrativeGender,
    example: AdministrativeGender.MALE,
  })
  @IsEnum(AdministrativeGender)
  gender!: AdministrativeGender;

  @ApiProperty({
    description: 'Patient birth date',
    example: '1990-01-01',
  })
  @IsDate()
  @Type(() => Date)
  birthDate!: Date;

  @ApiProperty({
    description: 'Contact information',
    type: [ContactPoint],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactPoint)
  telecom?: ContactPoint[];

  @ApiProperty({
    description: 'Address information',
    type: [Address],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Address)
  address?: Address[];
}
