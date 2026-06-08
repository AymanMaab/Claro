import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRefreshTokenColumns1780948376448 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" RENAME COLUMN "token" TO "token_hash"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "user_agent" VARCHAR`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD COLUMN IF NOT EXISTS "ip_address" VARCHAR`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN IF EXISTS "ip_address"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN IF EXISTS "user_agent"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" RENAME COLUMN "token_hash" TO "token"`);
    }

}
