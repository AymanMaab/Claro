import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRefreshTokenColumns1780948376448 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'refresh_tokens' AND column_name = 'token'
                ) THEN
                    ALTER TABLE "refresh_tokens" RENAME COLUMN "token" TO "token_hash";
                END IF;
            END $$;
        `);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "user_agent" VARCHAR`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "ip_address" VARCHAR`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN IF EXISTS "ip_address"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN IF EXISTS "user_agent"`);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'refresh_tokens' AND column_name = 'token_hash'
                ) THEN
                    ALTER TABLE "refresh_tokens" RENAME COLUMN "token_hash" TO "token";
                END IF;
            END $$;
        `);
    }
}