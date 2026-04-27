import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { PrismaService } from '../prisma/prisma.service';
import { RunScenarioDto, ScenarioType } from './dto/run-scenario.dto';
import {
  scenarioRunsTotal,
  scenarioRunDurationSeconds,
} from '../metrics/metrics.registry';
import { logger } from '../logger';

export interface ScenarioRunResult {
  id: string;
  status: string;
  duration: number;
  type: string;
  name?: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
  signal?: number;
  message?: string;
}

@Injectable()
export class ScenarioService {
  constructor(private readonly prisma: PrismaService) {}

  async run(dto: RunScenarioDto): Promise<ScenarioRunResult> {
    const startTime = Date.now();

    switch (dto.type) {
      case ScenarioType.SUCCESS:
        return this.handleSuccess(dto, startTime);
      case ScenarioType.VALIDATION_ERROR:
        return this.handleValidationError(dto, startTime);
      case ScenarioType.SYSTEM_ERROR:
        return this.handleSystemError(dto, startTime);
      case ScenarioType.SLOW_REQUEST:
        return this.handleSlowRequest(dto, startTime);
      case ScenarioType.TEAPOT:
        return this.handleTeapot(dto, startTime);
    }
  }

  async findRecent(limit = 20): Promise<ScenarioRunResult[]> {
    return this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    }) as Promise<ScenarioRunResult[]>;
  }

  private async handleSuccess(
    dto: RunScenarioDto,
    startTime: number,
  ): Promise<ScenarioRunResult> {
    const duration = Date.now() - startTime;

    const run = await this.prisma.scenarioRun.create({
      data: { type: dto.type, name: dto.name, status: 'completed', duration },
    });

    this.recordMetrics(dto.type, 'completed', duration);
    logger.info({ scenarioType: dto.type, scenarioId: run.id, duration, msg: 'Scenario run completed' });

    return { ...run, metadata: run.metadata as Record<string, unknown> | undefined };
  }

  private async handleValidationError(
    dto: RunScenarioDto,
    startTime: number,
  ): Promise<never> {
    const duration = Date.now() - startTime;

    await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        name: dto.name,
        status: 'validation_error',
        duration,
        errorMessage: 'Input validation failed',
      },
    });

    this.recordMetrics(dto.type, 'validation_error', duration);
    logger.warn({ scenarioType: dto.type, duration, msg: 'Scenario validation error' });

    Sentry.addBreadcrumb({
      category: 'scenario',
      message: 'Validation error scenario triggered',
      level: 'warning',
      data: { type: dto.type },
    });

    throw new BadRequestException('Input validation failed: name is required for this scenario');
  }

  private async handleSystemError(
    dto: RunScenarioDto,
    startTime: number,
  ): Promise<never> {
    const duration = Date.now() - startTime;
    const error = new Error('Unhandled system exception in scenario execution');

    await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        name: dto.name,
        status: 'failed',
        duration,
        errorMessage: error.message,
      },
    });

    this.recordMetrics(dto.type, 'failed', duration);
    logger.error({ scenarioType: dto.type, duration, err: error, msg: 'System error scenario triggered' });

    Sentry.captureException(error, {
      tags: { scenarioType: dto.type },
      extra: { duration, name: dto.name },
    });

    throw new InternalServerErrorException(error.message);
  }

  private async handleSlowRequest(
    dto: RunScenarioDto,
    startTime: number,
  ): Promise<ScenarioRunResult> {
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2–5s
    await new Promise((resolve) => setTimeout(resolve, delay));

    const duration = Date.now() - startTime;

    const run = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        name: dto.name,
        status: 'completed',
        duration,
        metadata: { delayMs: delay },
      },
    });

    this.recordMetrics(dto.type, 'completed', duration);
    logger.warn({ scenarioType: dto.type, scenarioId: run.id, duration, delayMs: delay, msg: 'Slow request scenario completed' });

    return { ...run, metadata: run.metadata as Record<string, unknown> };
  }

  private async handleTeapot(
    dto: RunScenarioDto,
    startTime: number,
  ): Promise<never> {
    const duration = Date.now() - startTime;

    await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        name: dto.name,
        status: 'teapot',
        duration,
        metadata: { easter: true },
      },
    });

    this.recordMetrics(dto.type, 'teapot', duration);
    logger.info({ scenarioType: dto.type, duration, easter: true, msg: 'Teapot scenario triggered' });

    throw new HttpException(
      { signal: 42, message: "I'm a teapot" },
      HttpStatus.I_AM_A_TEAPOT,
    );
  }

  private recordMetrics(type: string, status: string, durationMs: number): void {
    scenarioRunsTotal.inc({ type, status });
    scenarioRunDurationSeconds.observe({ type }, durationMs / 1000);
  }
}
