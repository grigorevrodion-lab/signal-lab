import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RunScenarioDto } from './dto/run-scenario.dto';
import { ScenarioService } from './scenario.service';

@ApiTags('scenarios')
@Controller('api/scenarios')
export class ScenarioController {
  constructor(private readonly scenarioService: ScenarioService) {}

  @Post('run')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Run a scenario' })
  @ApiResponse({ status: 200, description: 'Scenario completed' })
  @ApiResponse({ status: 400, description: 'Validation error scenario' })
  @ApiResponse({ status: 418, description: "I'm a teapot" })
  @ApiResponse({ status: 500, description: 'System error scenario' })
  run(@Body() dto: RunScenarioDto) {
    return this.scenarioService.run(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get recent scenario runs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findRecent(@Query('limit') limit?: string) {
    return this.scenarioService.findRecent(limit ? Number(limit) : 20);
  }
}
