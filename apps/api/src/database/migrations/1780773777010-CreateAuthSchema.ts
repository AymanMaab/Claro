import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthSchema1780773777010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "first_name" VARCHAR(255) NOT NULL,
        "last_name"  VARCHAR(255) NOT NULL,
        "email"      VARCHAR(255) UNIQUE NOT NULL,
        "password"   VARCHAR(255) NOT NULL,
        "is_active"  BOOLEAN NOT NULL DEFAULT FALSE,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ DEFAULT NOW(),
        "deleted_at" TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"     UUID NOT NULL,
        "token_hash"  TEXT UNIQUE NOT NULL,
        "user_agent"  VARCHAR,
        "ip_address"  VARCHAR,
        "expires_at"  TIMESTAMPTZ NOT NULL,
        "created_at"  TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT "FK_refresh_tokens_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_refresh_tokens_user_id" ON "refresh_tokens"("user_id")`);

    await queryRunner.query(`
      CREATE TABLE "accounts" (
        "id"               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"          UUID NOT NULL,
        "bank_name"        VARCHAR(255) NOT NULL,
        "account_name"     VARCHAR(255) NOT NULL,
        "type"             VARCHAR(50)  NOT NULL,
        "balance"          NUMERIC(12,2) DEFAULT 0,
        "last_imported_at" TIMESTAMPTZ,
        "created_at"       TIMESTAMPTZ DEFAULT NOW(),
        "updated_at"       TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT "FK_accounts_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_accounts_user_id" ON "accounts"("user_id")`);

    await queryRunner.query(`
      CREATE TABLE "csv_imports" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"       UUID NOT NULL,
        "account_id"    UUID NOT NULL,
        "file_name"     VARCHAR(255) NOT NULL,
        "bank_name"     VARCHAR(255) NOT NULL,
        "total_rows"    INTEGER NOT NULL,
        "imported"      INTEGER NOT NULL,
        "skipped"       INTEGER NOT NULL,
        "status"        VARCHAR(50) NOT NULL,
        "error_message" TEXT,
        "imported_at"   TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT "FK_csv_imports_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_csv_imports_account"
          FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_csv_imports_user_id"    ON "csv_imports"("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_csv_imports_account_id" ON "csv_imports"("account_id")`);

    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"     UUID NOT NULL,
        "account_id"  UUID NOT NULL,
        "import_id"   UUID NOT NULL,
        "hash_key"    VARCHAR(255) UNIQUE NOT NULL,
        "description" VARCHAR(500) NOT NULL,
        "amount"      NUMERIC(12,2) NOT NULL,
        "category"    VARCHAR(100) NOT NULL,
        "type"        VARCHAR(20)  NOT NULL,
        "date"        DATE NOT NULL,
        "deleted_at"  TIMESTAMPTZ,
        "created_at"  TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT "FK_transactions_user"
          FOREIGN KEY ("user_id")    REFERENCES "users"("id")       ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_account"
          FOREIGN KEY ("account_id") REFERENCES "accounts"("id")    ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_import"
          FOREIGN KEY ("import_id")  REFERENCES "csv_imports"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_transactions_user_id"    ON "transactions"("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_account_id" ON "transactions"("account_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_date"       ON "transactions"("date")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_category"   ON "transactions"("category")`);
    await queryRunner.query(`CREATE INDEX "IDX_transactions_type"       ON "transactions"("type")`);

    await queryRunner.query(`
      CREATE TABLE "budgets" (
        "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"      UUID NOT NULL,
        "category"     VARCHAR(100)  NOT NULL,
        "limit_amount" NUMERIC(12,2) NOT NULL,
        "month"        VARCHAR(7)    NOT NULL,
        "deleted_at"   TIMESTAMPTZ,
        "created_at"   TIMESTAMPTZ DEFAULT NOW(),
        "updated_at"   TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT "FK_budgets_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_budgets_user_category_month"
        ON "budgets"("user_id", "category", "month")
        WHERE "deleted_at" IS NULL
    `);
    await queryRunner.query(`CREATE INDEX "IDX_budgets_user_id" ON "budgets"("user_id")`);

    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id"    UUID NOT NULL,
        "type"       VARCHAR(100) NOT NULL,
        "message"    TEXT NOT NULL,
        "is_read"    BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT "FK_notifications_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id" ON "notifications"("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_is_read"  ON "notifications"("is_read")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "budgets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "csv_imports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "accounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
