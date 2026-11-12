import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTags1794500000001 implements MigrationInterface {
  name = "CreateTags1794500000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE tags (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL,
        createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE INDEX IDX_tags_name (name),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE tasks_tags_tags (
        tasksId INT NOT NULL,
        tagsId INT NOT NULL,
        INDEX IDX_tasks_tags_tasksId (tasksId),
        INDEX IDX_tasks_tags_tagsId (tagsId),
        PRIMARY KEY (tasksId, tagsId),
        CONSTRAINT FK_tasks_tags_tasks
          FOREIGN KEY (tasksId) REFERENCES tasks(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT FK_tasks_tags_tags
          FOREIGN KEY (tagsId) REFERENCES tags(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE tasks_tags_tags`);
    await queryRunner.query(`DROP TABLE tags`);
  }
}