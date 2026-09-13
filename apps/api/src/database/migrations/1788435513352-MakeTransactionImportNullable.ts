import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTransactionImportNullable1788435513352
  implements MigrationInterface
{
  name = 'MakeTransactionImportNullable1788435513352';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "import_id" DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "transactions"
      ALTER COLUMN "import_id" SET NOT NULL
    `);
  }
}