---
name: add-nestjs-endpoint
description: Scaffold a complete NestJS endpoint — controller, service, DTO, module wiring — following Signal Lab conventions
---

# NestJS Endpoint Skill

## When to Use
- Adding a new domain resource (users, reports, webhooks, etc.)
- Creating a new API endpoint in an existing module
- Running `/add-endpoint` command

## Template

### 1. DTO (`src/<domain>/dto/<action>-<domain>.dto.ts`)
```typescript
import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create<Domain>Dto {
  @ApiProperty({ example: 'example value' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
```

### 2. Service (`src/<domain>/<domain>.service.ts`)
```typescript
@Injectable()
export class <Domain>Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: Create<Domain>Dto): Promise<<Domain>> {
    const start = Date.now();
    const result = await this.prisma.<model>.create({ data: dto });
    
    // observability (see add-observability skill)
    <domain>Total.inc({ status: 'created' });
    logger.info({ msg: '<Domain> created', id: result.id, duration: Date.now() - start });
    
    return result;
  }

  async findAll(): Promise<<Domain>[]> {
    return this.prisma.<model>.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
  }
}
```

### 3. Controller (`src/<domain>/<domain>.controller.ts`)
```typescript
@ApiTags('<domain>')
@Controller('api/<domain>s')
export class <Domain>Controller {
  constructor(private readonly service: <Domain>Service) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new <domain>' })
  create(@Body() dto: Create<Domain>Dto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List recent <domain>s' })
  findAll() {
    return this.service.findAll();
  }
}
```

### 4. Module (`src/<domain>/<domain>.module.ts`)
```typescript
@Module({
  controllers: [<Domain>Controller],
  providers: [<Domain>Service],
})
export class <Domain>Module {}
```

### 5. Wire into AppModule
```typescript
// app.module.ts — add to imports array:
import { <Domain>Module } from './<domain>/<domain>.module';

@Module({
  imports: [PrismaModule, MetricsModule, ScenarioModule, <Domain>Module],
})
```

## Invariants
- Global ValidationPipe is already set up in `main.ts` — DTOs validate automatically
- CORS is open — no need to configure per-route
- Swagger tags show in `http://localhost:3001/api/docs` automatically
- Always add observability (metrics + logs) — see `add-observability` skill
