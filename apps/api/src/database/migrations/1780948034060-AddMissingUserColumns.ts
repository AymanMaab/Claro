import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingUserColumns1780948034060 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "first_name" character varying(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "last_name" character varying(255) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "is_active"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "last_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "first_name"`);
    }

}
