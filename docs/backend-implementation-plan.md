# Claro — Backend Implementation Plan

Stack: NestJS · TypeORM · PostgreSQL · Redis · Bull · Swagger  
Package manager: pnpm  
Runtime: Node.js v20 LTS

---

## Before You Write a Single Line

Set up the monorepo root first. Everything lives under `apps/api` for the backend.

```
root/
├── apps/
│   ├── api/              ← you are here
│   │   └── src/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── accounts/
│   │       ├── csv-import/
│   │       ├── transactions/
│   │       ├── budgets/
│   │       ├── notifications/
│   │       ├── dashboard/
│   │       ├── health/
│   │       ├── queues/
│   │       └── common/
│   │           ├── guards/
│   │           ├── decorators/
│   │           ├── filters/
│   │           ├── interceptors/
│   │           └── logger/
│   └── web/
│       └── src/
│           ├── pages/
│           ├── components/
│           ├── store/
│           ├── services/
│           └── hooks/
├── packages/
│   ├── ui/
│   ├── types/
│   ├── tsconfig/
│   └── eslint-config/
├── docs/
├── docker-compose.yml
├── .env
├── .env.test
├── turbo.json
├── package.json          ← pnpm workspace root
└── pnpm-workspace.yaml
```

**pnpm-workspace.yaml**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**Root package.json** (workspace root — scripts delegate to Turborepo):
```json
{
  "name": "claro",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "dev:api": "turbo dev --filter=api",
    "dev:web": "turbo dev --filter=web",
    "storybook": "turbo storybook --filter=@claro/ui",
    "build": "turbo build",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "lint": "turbo lint",
    "format": "prettier --write \"**/*.{ts,tsx,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,json,md}\"",
    "type-check": "turbo type-check",
    "clean": "turbo clean",
    "docker:up": "docker-compose up --build",
    "migration:generate": "pnpm --filter api migration:generate",
    "migration:run": "pnpm --filter api migration:run",
    "migration:revert": "pnpm --filter api migration:revert"
  },
  "devDependencies": {
    "turbo": "latest",
    "prettier": "^3.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^16.0.0"
  }
}
```

**turbo.json**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "test:e2e": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "type-check": {
      "dependsOn": ["^build"]
    },
    "storybook": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

## Phase 1 — Project Scaffold & Infrastructure

**Goal:** `docker-compose up` works. NestJS starts. Postgres and Redis are reachable. Swagger loads at `/api/docs`.

### Step 1.1 — Bootstrap NestJS

```bash
cd apps
npx @nestjs/cli new api --package-manager pnpm --skip-git
```

Set the `name` in `apps/api/package.json` to `"api"` — that's what `--filter api` matches.

Keep what the CLI generates. Delete the default `AppController` and `AppService` — you won't need them directly.

### Step 1.2 — Install all dependencies upfront

```bash
cd src/apps/api

# Core
pnpm add @nestjs/config @nestjs/typeorm typeorm pg

# Auth
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add -D @types/bcrypt @types/passport-jwt @types/multer

# Validation
pnpm add class-validator class-transformer class-sanitizer

# Security
pnpm add helmet @nestjs/throttler

# File upload
pnpm add @nestjs/platform-express multer

# CSV parsing
pnpm add csv-parse

# Redis + Bull queue
pnpm add @nestjs/cache-manager cache-manager cache-manager-redis-store ioredis
pnpm add @nestjs/bull bull
pnpm add -D @types/bull

# Email
pnpm add @nestjs-modules/mailer nodemailer handlebars
pnpm add -D @types/nodemailer

# Swagger
pnpm add @nestjs/swagger swagger-ui-express

# Bull Board (dev only — job monitoring UI)
pnpm add -D @bull-board/nestjs @bull-board/express

# Crypto (built into Node — no install needed, just use it)
```

### Step 1.3 — docker-compose.yml

Place at the repo root:

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: claro
      POSTGRES_PASSWORD: claro
      POSTGRES_DB: claro_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ./src/apps/api
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    volumes:
      - ./src/apps/api/uploads:/app/uploads

  web:
    build: ./src/apps/web
    ports:
      - "5173:5173"
    depends_on:
      - api

volumes:
  postgres_data:
```

### Step 1.4 — .env file

```env
# App
NODE_ENV=development
PORT=3000

# Postgres
DB_HOST=postgres
DB_PORT=5432
DB_USER=claro
DB_PASSWORD=claro
DB_NAME=claro_db

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=change_this_in_prod
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=change_this_too
REFRESH_TOKEN_EXPIRES_IN=7d

# CSV Upload
CSV_MAX_FILE_SIZE_MB=5
CSV_UPLOAD_DIR=./uploads

# CORS
ALLOWED_ORIGINS=http://localhost:5173

# Email (fill in when you reach Phase 5)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=noreply@claro.app

# Logging
LOG_LEVEL=log
```

### Step 1.5 — main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Claro API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

### Step 1.6 — AppModule

Wire up Config, TypeORM, and ThrottlerModule here. All feature modules get imported later.

```typescript
// app.module.ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: false, // never use synchronize — always migrations
        migrationsRun: true, // run pending migrations on startup
        logging: false,
        extra: { max: 20 }, // connection pool size
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }]),
    // Feature modules added per phase below
  ],
})
export class AppModule {}
```

**Important on migrations:** `synchronize: true` is off from day one. Never turn it on — it has silently dropped columns in production before and it will again. Generate migrations with:

```bash
pnpm typeorm migration:generate src/migrations/InitialSchema -d src/data-source.ts
pnpm typeorm migration:run -d src/data-source.ts
```

Create a `data-source.ts` at the api root:

```typescript
// src/data-source.ts
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
});
```

Add these scripts to the api `package.json`:
```json
"migration:generate": "typeorm migration:generate -d src/data-source.ts",
"migration:run": "typeorm migration:run -d src/data-source.ts",
"migration:revert": "typeorm migration:revert -d src/data-source.ts"
```

**Workflow:** Every time you add or change an entity, run `migration:generate` with a descriptive name (e.g. `AddTransactionHashKey`), review the generated file, then run `migration:run`. Never edit migration files after they've been committed — generate a new one instead.

### Step 1.7 — Common infrastructure

Create these before writing any business logic. Everything depends on them.

**Directory:**
```
src/common/
├── filters/
│   └── http-exception.filter.ts
├── interceptors/
│   └── logging.interceptor.ts
├── guards/
│   └── jwt-auth.guard.ts
├── decorators/
│   └── current-user.decorator.ts
└── logger/
    └── app-logger.service.ts
```

**http-exception.filter.ts** — all errors return `{ statusCode, message, error }`:
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      statusCode: status,
      message:
        typeof exceptionResponse === 'object'
          ? (exceptionResponse as any).message
          : exceptionResponse,
      error: exception.name,
      timestamp: new Date().toISOString(),
    });
  }
}
```

**logging.interceptor.ts** — logs every request with method, path, status, and duration. Logs at `warn` if over 500ms:
```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const status = context.switchToHttp().getResponse().statusCode;
        const message = `${method} ${url} ${status} ${duration}ms`;
        duration > 500
          ? this.logger.warn(message)
          : this.logger.log(message);
      }),
    );
  }
}
```

**Verification:** `docker-compose up`, hit `http://localhost:3000/api/docs` — Swagger loads. Phase 1 is done.

---

## Phase 2 — Auth Module

**Goal:** Register, login, JWT issuance, refresh token rotation, logout. Rate limiting on auth endpoints.

### Entities

**User entity** (`src/users/entities/user.entity.ts`):
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // bcrypt hash — never return this

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**RefreshToken entity** (`src/auth/entities/refresh-token.entity.ts`):
```typescript
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ unique: true })
  token: string;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Module structure

```
src/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
├── strategies/
│   └── jwt.strategy.ts
├── entities/
│   └── refresh-token.entity.ts
└── dto/
    ├── register.dto.ts
    └── login.dto.ts
```

### DTOs

```typescript
// register.dto.ts
export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

### AuthService — key methods

```typescript
// Password hashing
async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12); // cost factor 12 per NFR
}

// Registration
async register(dto: RegisterDto) {
  const existing = await this.usersRepo.findOne({ where: { email: dto.email } });
  if (existing) throw new ConflictException('Email already registered');

  const hashed = await this.hashPassword(dto.password);
  const user = this.usersRepo.create({ email: dto.email, password: hashed });
  await this.usersRepo.save(user);

  return this.generateTokens(user);
}

// Token generation
async generateTokens(user: User) {
  const [accessToken, refreshToken] = await Promise.all([
    this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { secret: process.env.JWT_SECRET, expiresIn: '15m' },
    ),
    this.generateRefreshToken(user),
  ]);
  return { accessToken, refreshToken };
}

// Refresh token rotation — invalidate old, issue new
async refresh(token: string) {
  const record = await this.refreshTokenRepo.findOne({
    where: { token },
    relations: ['user'],
  });
  if (!record || record.expiresAt < new Date()) {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }
  await this.refreshTokenRepo.delete(record.id); // invalidate immediately
  return this.generateTokens(record.user);
}

// Logout — delete refresh token from DB
async logout(token: string) {
  await this.refreshTokenRepo.delete({ token });
}
```

### JWT Strategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { id: payload.sub, email: payload.email };
  }
}
```

### Controller endpoints

```
POST /api/v1/auth/register   → 201
POST /api/v1/auth/login      → 200
POST /api/v1/auth/refresh    → 200
POST /api/v1/auth/logout     → 200
```

Apply `@Throttle({ default: { ttl: 60000, limit: 10 } })` to all auth endpoints.

### Users module (minimal for now)

```
src/users/
├── users.module.ts
├── users.service.ts
├── users.controller.ts   ← GET /users/me, PATCH /users/me, DELETE /users/me
└── entities/
    └── user.entity.ts
```

`GET /users/me` uses the `@CurrentUser()` decorator to pull the user ID from the JWT payload, then fetches from DB. Never return the password field — use a `select: false` column or manually exclude it.

**Verification:** Use Bruno/Postman. Register → login → copy accessToken → hit `GET /users/me` with Bearer token → 200.

---

## Phase 3 — Accounts Module + Health Check

**Goal:** Users can create bank accounts. Health check endpoint is live.

### Account entity

```typescript
@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  bankName: string;

  @Column()
  accountName: string;

  @Column()
  type: 'current' | 'savings' | 'credit';

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  balance: number;

  @Column({ nullable: true })
  lastImportedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Module structure

```
src/accounts/
├── accounts.module.ts
├── accounts.controller.ts
├── accounts.service.ts
├── entities/
│   └── account.entity.ts
└── dto/
    └── create-account.dto.ts
```

### Endpoints

```
GET  /api/v1/accounts       → list user's accounts
GET  /api/v1/accounts/:id   → single account
POST /api/v1/accounts       → create account (not in the original API spec — add it, you need it)
```

**Note:** The original spec only has GET endpoints for accounts. But users need a way to create accounts before uploading CSVs. Add `POST /accounts` with `CreateAccountDto` — it's an obvious gap in the spec.

All account queries must filter by `userId` from the JWT. Never trust the request body for user ID.

### Health module

```
src/health/
├── health.module.ts
└── health.controller.ts
```

```typescript
@Get()
async check() {
  // Check DB by running a simple query
  // Check Redis by running PING
  // Return uptime via process.uptime()
  return {
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    database: 'connected',
    redis: 'connected',
    timestamp: new Date().toISOString(),
  };
}
```

No auth guard on this endpoint — Docker needs to reach it without a token.

**Verification:** `GET /api/v1/health` → 200.

---

## Phase 4 — CSV Import Module

This is the hardest phase. Take your time with it.

**Goal:** Upload a CSV → detect bank format → parse rows → categorise → deduplicate → save transactions → update account balance.

### Entities

**CsvImport entity:**
```typescript
@Entity('csv_imports')
export class CsvImport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  account: Account;

  @Column()
  fileName: string;

  @Column()
  bankName: string;

  @Column()
  totalRows: number;

  @Column()
  imported: number;

  @Column()
  skipped: number;

  @Column()
  status: 'completed' | 'failed';

  @Column({ nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  importedAt: Date;
}
```

**Transaction entity:**
```typescript
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Account, { onDelete: 'CASCADE' })
  account: Account;

  @ManyToOne(() => CsvImport, { onDelete: 'CASCADE' })
  import: CsvImport;

  @Column({ unique: true })
  hashKey: string; // SHA256(date + description + amount) — dedup key

  @Column()
  description: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number; // positive = income, negative = expense

  @Column()
  category: string;

  @Column()
  type: 'income' | 'expense';

  @Column({ type: 'date' })
  date: Date;

  @DeleteDateColumn()
  deletedAt: Date; // soft delete

  @CreateDateColumn()
  createdAt: Date;
}
```

### Module structure

```
src/csv-import/
├── csv-import.module.ts
├── csv-import.controller.ts
├── csv-import.service.ts
├── parsers/
│   ├── parser.interface.ts
│   ├── hbl.parser.ts
│   ├── ubl.parser.ts
│   └── meezan.parser.ts
├── categoriser/
│   └── transaction-categoriser.ts
└── entities/
    ├── csv-import.entity.ts
    └── transaction.entity.ts
```

### Bank format detection

Each bank's CSV has different column headers. Read the first row and detect by checking which headers are present:

```typescript
function detectBankFormat(headers: string[]): string {
  const normalized = headers.map(h => h.toLowerCase().trim());
  if (normalized.includes('transaction date') && normalized.includes('debit amount')) {
    return 'HBL';
  }
  if (normalized.includes('value date') && normalized.includes('withdrawl')) {
    return 'UBL';
  }
  if (normalized.includes('tran date') && normalized.includes('dr amount')) {
    return 'MEEZAN';
  }
  throw new BadRequestException('Unrecognised bank format');
}
```

**Important:** You need to get actual CSV samples from HBL, UBL, and Meezan to build accurate parsers. The column names above are guesses. Download your own statements and check the real headers before writing this code. This is the part that will make or break the app's usefulness.

### Deduplication

Build the hash key per transaction before insert:

```typescript
import { createHash } from 'crypto';

function buildHashKey(date: string, description: string, amount: number): string {
  return createHash('sha256')
    .update(`${date}|${description.toLowerCase().trim()}|${amount}`)
    .digest('hex');
}
```

On insert, use `INSERT ... ON CONFLICT (hash_key) DO NOTHING` — or catch the unique constraint violation and count it as skipped. Don't query first and then insert — that's two round trips and has a race condition.

TypeORM approach:
```typescript
try {
  await this.transactionRepo.save(transaction);
  importedCount++;
} catch (err) {
  if (err.code === '23505') { // postgres unique violation
    skippedCount++;
  } else {
    throw err;
  }
}
```

### Transaction categoriser

This is a keyword mapping. Real bank descriptions are messy — do your best with a lookup table and fall back to "other":

```typescript
const CATEGORY_MAP: Record<string, string[]> = {
  food: ['mcdonald', 'kfc', 'pizza', 'foodpanda', 'restaurant', 'cafe', 'bakery', 'biryani'],
  transport: ['uber', 'careem', 'petrol', 'fuel', 'cng', 'parking', 'toll'],
  utilities: ['electricity', 'gas', 'water', 'k-electric', 'sui gas', 'ptcl'],
  shopping: ['daraz', 'amazon', 'store', 'mart', 'retail'],
  health: ['pharmacy', 'hospital', 'clinic', 'doctor', 'medical'],
  rent: ['rent', 'lease'],
  salary: ['salary', 'payroll', 'wages'],
  transfer: ['ibft', 'trf', 'transfer'],
};

function categorise(description: string): string {
  const lower = description.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return 'other';
}
```

This is intentionally simple for v1. It can be improved later without changing any other part of the system — the category is just a string column.

### Import flow — full sequence

```typescript
async uploadCsv(file: Express.Multer.File, accountId: string, userId: string) {
  // 1. Validate account belongs to user
  const account = await this.accountsService.findOneForUser(accountId, userId);

  // 2. Parse CSV
  const rows = await this.parseCsv(file.buffer);

  // 3. Detect bank format
  const bankName = this.detectBankFormat(Object.keys(rows[0]));

  // 4. Create import record (status: in-progress concept, set to completed at end)
  const importRecord = await this.csvImportRepo.save({
    user: { id: userId },
    account,
    fileName: file.originalname,
    bankName,
    totalRows: rows.length,
    imported: 0,
    skipped: 0,
    status: 'completed', // set to failed in catch
  });

  // 5. Process rows in a DB transaction (all or nothing)
  let imported = 0;
  let skipped = 0;

  await this.dataSource.transaction(async (manager) => {
    for (const row of rows) {
      const parsed = this.parseRow(row, bankName);
      const hashKey = this.buildHashKey(parsed.date, parsed.description, parsed.amount);

      try {
        await manager.save(Transaction, {
          user: { id: userId },
          account,
          import: importRecord,
          hashKey,
          description: parsed.description,
          amount: parsed.amount,
          category: this.categorise(parsed.description),
          type: parsed.amount > 0 ? 'income' : 'expense',
          date: parsed.date,
        });
        imported++;
      } catch (err) {
        if (err.code === '23505') {
          skipped++;
        } else {
          throw err; // re-throw — will rollback the whole transaction
        }
      }
    }

    // 6. Update account balance
    const balanceDelta = rows
      .map(r => this.parseRow(r, bankName).amount)
      .reduce((a, b) => a + b, 0);
    await manager.increment(Account, { id: accountId }, 'balance', balanceDelta);
    await manager.update(Account, { id: accountId }, { lastImportedAt: new Date() });
  });

  // 7. Update import record with final counts
  await this.csvImportRepo.update(importRecord.id, { imported, skipped });

  // 8. Delete uploaded file — don't store CSVs
  fs.unlinkSync(file.path);

  // 9. Trigger budget check (Phase 5 adds this)
  // await this.budgetsService.checkThresholds(userId);

  return { importId: importRecord.id, bankName, totalRows: rows.length, imported, skipped };
}
```

### Multer config

```typescript
// csv-import.controller.ts
@Post('upload')
@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: process.env.CSV_UPLOAD_DIR,
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype !== 'text/csv' && !file.originalname.endsWith('.csv')) {
        return cb(new BadRequestException('Only CSV files are allowed'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: +(process.env.CSV_MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024,
    },
  }),
)
async upload(
  @UploadedFile() file: Express.Multer.File,
  @Body() body: UploadCsvDto,
  @CurrentUser() user: { id: string },
) { ... }
```

**Verification:** Upload a real HBL CSV → check DB for transactions → re-upload same file → `imported: 0, skipped: N`.

---

## Phase 5 — Transactions Module

**Goal:** List, filter, paginate, soft delete, category correction, CSV export.

### Module structure

```
src/transactions/
├── transactions.module.ts
├── transactions.controller.ts
├── transactions.service.ts
└── dto/
    ├── transaction-filter.dto.ts
    └── update-category.dto.ts
```

### Filtering and pagination

```typescript
// transaction-filter.dto.ts
export class TransactionFilterDto {
  @IsOptional() @IsUUID() accountId?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) limit?: number = 20;
}
```

```typescript
async findAll(userId: string, filters: TransactionFilterDto) {
  const qb = this.transactionRepo
    .createQueryBuilder('t')
    .where('t.user_id = :userId', { userId })
    .andWhere('t.deleted_at IS NULL');

  if (filters.accountId) qb.andWhere('t.account_id = :accountId', { accountId: filters.accountId });
  if (filters.category) qb.andWhere('t.category = :category', { category: filters.category });
  if (filters.startDate) qb.andWhere('t.date >= :startDate', { startDate: filters.startDate });
  if (filters.endDate) qb.andWhere('t.date <= :endDate', { endDate: filters.endDate });

  const [data, total] = await qb
    .orderBy('t.date', 'DESC')
    .skip((filters.page - 1) * filters.limit)
    .take(filters.limit)
    .getManyAndCount();

  return { data, total, page: filters.page, limit: filters.limit };
}
```

### Soft delete

TypeORM handles this automatically when you use `@DeleteDateColumn()` on the entity and call `softDelete()`:

```typescript
async remove(id: string, userId: string) {
  const tx = await this.transactionRepo.findOne({
    where: { id, user: { id: userId } },
  });
  if (!tx) throw new NotFoundException();
  await this.transactionRepo.softDelete(id);
}
```

All `find` queries automatically exclude rows where `deleted_at IS NOT NULL` when using TypeORM's soft delete.

### CSV export

```typescript
async exportCsv(userId: string, filters: TransactionFilterDto): Promise<string> {
  const { data } = await this.findAll(userId, { ...filters, limit: 10000, page: 1 });

  const rows = data.map(t => ({
    date: t.date,
    description: t.description,
    amount: t.amount,
    category: t.category,
    account: t.account?.accountName ?? '',
  }));

  // Use csv-stringify or manually build the CSV string
  const header = 'date,description,amount,category,account\n';
  const body = rows.map(r =>
    `${r.date},"${r.description.replace(/"/g, '""')}",${r.amount},${r.category},${r.account}`
  ).join('\n');

  return header + body;
}
```

In the controller, set headers `Content-Type: text/csv` and `Content-Disposition: attachment; filename=transactions.csv`.

---

## Phase 6 — Budgets Module

**Goal:** Monthly category budgets. Spent amount computed from transactions. Status computed server-side.

### Budget entity

```typescript
@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  category: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  limitAmount: number;

  @Column({ length: 7 }) // YYYY-MM
  month: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

Unique index: `(user_id, category, month)` — enforced at DB level, so duplicate budget creation will throw a unique violation. Catch it and return a 409.

### Spent amount computation

Never store `spentAmount` on the budget. Always compute it live from transactions:

```typescript
async getSpentAmount(userId: string, category: string, month: string): Promise<number> {
  const [year, mo] = month.split('-');
  const result = await this.transactionRepo
    .createQueryBuilder('t')
    .select('SUM(ABS(t.amount))', 'spent')
    .where('t.user_id = :userId', { userId })
    .andWhere('t.category = :category', { category })
    .andWhere('t.type = :type', { type: 'expense' })
    .andWhere('EXTRACT(YEAR FROM t.date) = :year', { year })
    .andWhere('EXTRACT(MONTH FROM t.date) = :month', { month: mo })
    .andWhere('t.deleted_at IS NULL')
    .getRawOne();

  return parseFloat(result?.spent ?? '0');
}
```

### Status computation

```typescript
function computeStatus(spent: number, limit: number): 'ok' | 'warning' | 'exceeded' {
  const pct = (spent / limit) * 100;
  if (pct >= 100) return 'exceeded';
  if (pct >= 80) return 'warning';
  return 'ok';
}
```

### Budget threshold check — called after every CSV import

```typescript
async checkThresholds(userId: string) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const budgets = await this.budgetRepo.find({
    where: { user: { id: userId }, month: currentMonth },
  });

  for (const budget of budgets) {
    const spent = await this.getSpentAmount(userId, budget.category, budget.month);
    const pct = (spent / budget.limitAmount) * 100;

    if (pct >= 100) {
      await this.notificationsService.createIfNotExists(userId, 'budget_exceeded', budget);
    } else if (pct >= 80) {
      await this.notificationsService.createIfNotExists(userId, 'budget_warning', budget);
    }
  }
}
```

The `createIfNotExists` check prevents duplicate notifications for the same budget in the same month.

---

## Phase 7 — Notifications Module

**Goal:** In-app notifications for budget alerts. Email delivery via Bull queue.

### Notification entity

```typescript
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  type: string; // budget_warning | budget_exceeded

  @Column()
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Duplicate prevention

Before creating a notification, check if one of the same type already exists for this user+category+month:

```typescript
async createIfNotExists(userId: string, type: string, budget: Budget) {
  const month = budget.month;
  const existing = await this.notificationRepo
    .createQueryBuilder('n')
    .where('n.user_id = :userId', { userId })
    .andWhere('n.type = :type', { type })
    .andWhere("n.message LIKE :pattern", { pattern: `%${budget.category}%${month}%` })
    .getOne();

  if (existing) return; // already notified for this budget this month

  const message =
    type === 'budget_warning'
      ? `You've used 80% of your ${budget.category} budget for ${month}`
      : `You've exceeded your ${budget.category} budget for ${month}`;

  const notification = await this.notificationRepo.save({
    user: { id: userId },
    type,
    message,
  });

  // Queue email — non-blocking
  await this.notificationQueue.add('send-email', {
    userId,
    type,
    message,
  });

  return notification;
}
```

### Bull queue setup

```typescript
// notifications.module.ts
BullModule.registerQueue({ name: 'notifications' })

// notification.processor.ts
@Processor('notifications')
export class NotificationProcessor {
  @Process('send-email')
  async handleEmail(job: Job<{ userId: string; type: string; message: string }>) {
    // fetch user email, send via mailer
    // Bull retries automatically on failure — configure in queue options:
    // { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
  }
}
```

### Endpoints

```
GET    /api/v1/notifications              → list (newest first)
PATCH  /api/v1/notifications/:id/read    → mark single as read
PATCH  /api/v1/notifications/read-all   → mark all as read
DELETE /api/v1/notifications/:id        → delete
```

---

## Phase 8 — Dashboard Module

**Goal:** Aggregated stats. Redis cache per user. Cache invalidated after every CSV import.

### Module structure

```
src/dashboard/
├── dashboard.module.ts
├── dashboard.controller.ts
└── dashboard.service.ts
```

### Redis caching

```typescript
// dashboard.service.ts
async getSummary(userId: string) {
  const cacheKey = `dashboard:summary:${userId}`;
  const cached = await this.cacheManager.get(cacheKey);
  if (cached) return cached;

  const summary = await this.computeSummary(userId);
  await this.cacheManager.set(cacheKey, summary, 300); // 5 min TTL
  return summary;
}
```

**Cache invalidation** — call this from CsvImportService after a successful import:

```typescript
async invalidateDashboardCache(userId: string) {
  await this.cacheManager.del(`dashboard:summary:${userId}`);
}
```

### Aggregation queries

**Summary:**
```typescript
async computeSummary(userId: string) {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [year, month] = currentMonth.split('-');

  const [income, expenses, totalBalance] = await Promise.all([
    this.getMonthlyTotal(userId, 'income', year, month),
    this.getMonthlyTotal(userId, 'expense', year, month),
    this.getTotalBalance(userId),
  ]);

  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  return { totalBalance, monthlyIncome: income, monthlyExpenses: expenses, savingsRate };
}
```

**Spending by category:**
```typescript
async getSpendingByCategory(userId: string, month: string) {
  const [year, mo] = month.split('-');
  return this.transactionRepo
    .createQueryBuilder('t')
    .select('t.category', 'category')
    .addSelect('SUM(ABS(t.amount))', 'amount')
    .where('t.user_id = :userId', { userId })
    .andWhere('t.type = :type', { type: 'expense' })
    .andWhere('EXTRACT(YEAR FROM t.date) = :year', { year })
    .andWhere('EXTRACT(MONTH FROM t.date) = :month', { month: mo })
    .andWhere('t.deleted_at IS NULL')
    .groupBy('t.category')
    .orderBy('amount', 'DESC')
    .getRawMany();
}
```

**Monthly trend:**
```typescript
async getMonthlyTrend(userId: string, months: number = 6) {
  // Generate the last N months, then aggregate income and expenses per month
  // Use a raw query with date_trunc for clean month grouping
  return this.transactionRepo.query(`
    SELECT
      TO_CHAR(date_trunc('month', date), 'YYYY-MM') as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as expenses
    FROM transactions
    WHERE user_id = $1
      AND deleted_at IS NULL
      AND date >= date_trunc('month', NOW()) - INTERVAL '${months - 1} months'
    GROUP BY date_trunc('month', date)
    ORDER BY date_trunc('month', date) ASC
  `, [userId]);
}
```

---

## Phase 9 — Testing

### Unit tests

Each service gets a `.spec.ts` file beside it. Use Jest's `jest.fn()` to mock repositories.

```
src/auth/auth.service.spec.ts
src/csv-import/csv-import.service.spec.ts
src/budgets/budgets.service.spec.ts
src/dashboard/dashboard.service.spec.ts
src/transactions/transactions.service.spec.ts
src/notifications/notifications.service.spec.ts
```

Example — auth service:
```typescript
describe('AuthService', () => {
  it('should hash password with bcrypt cost 12', async () => {
    const hash = await service.hashPassword('password123');
    expect(await bcrypt.compare('password123', hash)).toBe(true);
    const rounds = bcrypt.getRounds(hash);
    expect(rounds).toBe(12);
  });

  it('should throw ConflictException for duplicate email', async () => {
    mockUserRepo.findOne.mockResolvedValue({ email: 'test@test.com' });
    await expect(service.register({ email: 'test@test.com', password: 'pass1234' }))
      .rejects.toThrow(ConflictException);
  });
});
```

### E2E tests

```
test/
├── auth.e2e-spec.ts
├── csv-import.e2e-spec.ts
├── transactions.e2e-spec.ts
├── budgets.e2e-spec.ts
├── notifications.e2e-spec.ts
├── dashboard.e2e-spec.ts
└── health.e2e-spec.ts
```

Use a separate `.env.test` pointing to `claro_test_db`. Reset DB between test suites — run `migration:run` against the test DB before each suite, then truncate tables between tests (don't drop and recreate — migrations handle structure, truncate handles data).

### jest.config.ts

```typescript
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
};
```

Coverage target: 80% on service layer. Run with `pnpm test --coverage`.

---

## Things to Add Later (Not MVP)

- ~~TypeORM migrations~~ — already set up from Phase 1. Migrations are part of the MVP, not an afterthought.
- Bull Board UI — the `@bull-board/nestjs` package is already installed. Wire it up at `/api/queues` in dev so you can monitor job status visually.
- Rate limiting on non-auth endpoints — currently only auth routes are throttled. Add a global throttle config when you have real traffic.
- CSV files from additional banks — start with one bank (whichever you have a statement for), add parsers incrementally.
- Improved categorisation — the keyword map is a starting point. Over time you can weight by frequency, allow user-defined rules, or build a simple classifier.
- Swagger decorators — the API works without them but adding `@ApiOperation`, `@ApiResponse` etc. to every endpoint makes the docs actually useful. Add these after the logic is solid.

---

## Implementation Order Summary

| Week | Module | Key Deliverable |
|------|--------|----------------|
| 1 | Scaffold + Common | Docker up, Swagger loads, filters/interceptors wired |
| 1 | Auth | Register, login, JWT, refresh rotation, logout |
| 2 | Accounts + Health | Create account, list accounts, `/health` endpoint |
| 3 | CSV Import | Upload → parse → deduplicate → save (one bank format first) |
| 4 | Transactions | List with filters, pagination, soft delete, CSV export |
| 5 | Budgets | CRUD, spent computation, threshold check after import |
| 6 | Notifications + Queue | In-app alerts, Bull email queue |
| 7 | Dashboard | Aggregation queries, Redis cache, cache invalidation |
| 8 | Testing | Unit tests for all services, E2E for critical flows |
