import { MigrationInterface, QueryRunner } from "typeorm";

export class SetTaskUserNullable1794500000000 implements MigrationInterface {
  name = "SetTaskUserNullable1794500000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the old CASCADE foreign key
    await queryRunner.query(`
      ALTER TABLE \`tasks\`
      DROP FOREIGN KEY \`FK_166bd96559cb38595d392f75a35\`
    `);

    // Allow userId to be NULL
    await queryRunner.query(`
      ALTER TABLE \`tasks\`
      MODIFY \`userId\` int NULL
    `);

    // Add the new SET NULL foreign key
    await queryRunner.query(`
      ALTER TABLE \`tasks\`
      ADD CONSTRAINT \`FK_166bd96559cb38595d392f75a35\`
      FOREIGN KEY (\`userId\`)
      REFERENCES \`users\`(\`id\`)
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the SET NULL foreign key
    await queryRunner.query(`
      ALTER TABLE \`tasks\`
      DROP FOREIGN KEY \`FK_166bd96559cb38595d392f75a35\`
    `);

    // Restore userId to NOT NULL
    await queryRunner.query(`
      ALTER TABLE \`tasks\`
      MODIFY \`userId\` int NOT NULL
    `);

    // Restore the original CASCADE foreign key
    await queryRunner.query(`
      ALTER TABLE \`tasks\`
      ADD CONSTRAINT \`FK_166bd96559cb38595d392f75a35\`
      FOREIGN KEY (\`userId\`)
      REFERENCES \`users\`(\`id\`)
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
  }
}