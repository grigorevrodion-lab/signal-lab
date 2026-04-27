import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ScenarioType {
  SUCCESS = 'success',
  VALIDATION_ERROR = 'validation_error',
  SYSTEM_ERROR = 'system_error',
  SLOW_REQUEST = 'slow_request',
  TEAPOT = 'teapot',
}

export class RunScenarioDto {
  @ApiProperty({ enum: ScenarioType, example: ScenarioType.SUCCESS })
  @IsEnum(ScenarioType)
  type: ScenarioType;

  @ApiPropertyOptional({ example: 'My test run' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;
}
