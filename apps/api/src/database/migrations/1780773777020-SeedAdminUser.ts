import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export class SeedAdminUser1780773777020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists = await queryRunner.query(
      `SELECT id FROM "users" WHERE email = 'superuser@claro.com' LIMIT 1`,
    );
    if (exists.length > 0) return;

    const hash = await bcrypt.hash('!Claro123', 12);

    await queryRunner.query(
      `INSERT INTO "users" ("first_name", "last_name", "email", "password") VALUES ($1, $2, $3, $4)`,
      ['Super', 'User', 'superuser@claro.com', hash],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "users" WHERE email = 'superuser@claro.com'`);
  }
}
