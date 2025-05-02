import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDb1745752517491 implements MigrationInterface {
    name = 'InitDb1745752517491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "violation_locations" ALTER COLUMN "angle" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "violation_locations" ALTER COLUMN "altitude" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "violation_locations" ALTER COLUMN "speed" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "violation_locations" ALTER COLUMN "speed" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "violation_locations" ALTER COLUMN "altitude" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "violation_locations" ALTER COLUMN "angle" SET NOT NULL`);
    }

}
