import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRbac1781895733034 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Schema
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name"           VARCHAR(100) UNIQUE NOT NULL,
        "group"          VARCHAR(50) NOT NULL,
        "is_system"      BOOLEAN NOT NULL DEFAULT FALSE,
        "parent_role_id" UUID,
        "created_at"     TIMESTAMPTZ DEFAULT NOW(),
        "updated_at"     TIMESTAMPTZ DEFAULT NOW(),
        "deleted_at"     TIMESTAMPTZ,
        CONSTRAINT "FK_roles_parent_role"
          FOREIGN KEY ("parent_role_id") REFERENCES "roles"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id"       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "resource" VARCHAR(100) NOT NULL,
        "action"   VARCHAR(50)  NOT NULL,
        CONSTRAINT "UQ_permissions_resource_action" UNIQUE ("resource", "action")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "role_id"       UUID NOT NULL,
        "permission_id" UUID NOT NULL,
        CONSTRAINT "UQ_role_permissions" UNIQUE ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permissions_role"
          FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission"
          FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_role_permissions_role_id"      ON "role_permissions"("role_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_role_permissions_permission_id" ON "role_permissions"("permission_id")`);

    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN "role_id" UUID,
        ADD CONSTRAINT "FK_users_role"
          FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL
    `);

    // Seed: all permissions
    const resources = [
      'accounts', 'transactions', 'budgets', 'csv_imports',
      'notifications', 'analytics', 'users', 'roles', 'permissions',
    ];
    const actions = ['read', 'create', 'update', 'delete', 'purge', 'export', 'assign'];

    for (const resource of resources) {
      for (const action of actions) {
        await queryRunner.query(
          `INSERT INTO "permissions" ("resource", "action") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [resource, action],
        );
      }
    }

    // Seed: system roles
    await queryRunner.query(`
      INSERT INTO "roles" ("name", "group", "is_system") VALUES
        ('Super User', 'SUPER_USER', TRUE),
        ('Admin',      'ADMIN',      TRUE),
        ('Member',     'MEMBER',     TRUE)
    `);

    // Seed: Admin gets all permissions except purge
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      CROSS JOIN "permissions" p
      WHERE r.name = 'Admin'
        AND p.action != 'purge'
      ON CONFLICT DO NOTHING
    `);

    // Seed: Member gets read/create/update/delete on their own resources
    await queryRunner.query(`
      INSERT INTO "role_permissions" ("role_id", "permission_id")
      SELECT r.id, p.id
      FROM "roles" r
      CROSS JOIN "permissions" p
      WHERE r.name = 'Member'
        AND p.resource IN ('accounts', 'transactions', 'budgets', 'csv_imports', 'notifications', 'analytics')
        AND p.action IN ('read', 'create', 'update', 'delete', 'export')
      ON CONFLICT DO NOTHING
    `);

    // Assign existing admin user to Super User role
    await queryRunner.query(`
      UPDATE "users" u
      SET "role_id" = r.id
      FROM "roles" r
      WHERE r.name = 'Super User'
        AND u.email = 'superuser@claro.com'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "FK_users_role"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles"`);
  }

}
