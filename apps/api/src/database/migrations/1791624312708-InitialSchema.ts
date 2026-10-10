import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1791624312708 implements MigrationInterface {
  name = 'InitialSchema1791624312708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE "institutions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "image_src" character varying, "user_id" character varying, "nordigen_id" character varying, "countries" text, CONSTRAINT "UQ_d2c9753bf4a8d160e1f6e3ee1b5" UNIQUE ("nordigen_id"), CONSTRAINT "PK_0be7539dcdba335470dc05e9690" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "budgets" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "name" text NOT NULL, "amount" numeric NOT NULL, "currency" character varying NOT NULL, "colour" text, "icon" text, CONSTRAINT "PK_9c8a51748f82387644b773da482" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categories" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "name" character varying NOT NULL, "icon" character varying, "colour" character varying, "parentId" uuid, CONSTRAINT "PK_categories" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying, "notes" text, "amount" numeric NOT NULL, "currency" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "externalId" character varying, "metadata" jsonb, "accountId" uuid, "categoryId" uuid, CONSTRAINT "UQ_c7677fa092ee0c2659fbf452920" UNIQUE ("externalId"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c7677fa092ee0c2659fbf45292" ON "transactions"  ("externalId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_type_enum" AS ENUM('current-account', 'credit-card', 'savings-account', 'investment', 'mortgage', 'loan', 'pension', 'unknown')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_source_enum" AS ENUM('manual', 'imported', 'synced', 'unknown')`,
    );
    await queryRunner.query(
      `CREATE TABLE "accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "name" character varying NOT NULL, "balance" numeric NOT NULL, "currency" character varying NOT NULL, "type" "public"."accounts_type_enum" NOT NULL DEFAULT 'unknown', "source" "public"."accounts_source_enum" NOT NULL DEFAULT 'unknown', "source_name" text, "properties" jsonb, "institutionId" uuid, CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."ai_provider_connections_provider_enum" AS ENUM('openai', 'openrouter', 'vercel_ai_gateway')`,
    );
    await queryRunner.query(
      `CREATE TABLE "ai_provider_connections" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "provider" "public"."ai_provider_connections_provider_enum" NOT NULL, "display_name" text NOT NULL, "encrypted_token" text NOT NULL, "token_hint" text, CONSTRAINT "PK_a2244eb5531003ad30c796b7ceb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ai_agents" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "connection_id" uuid NOT NULL, "name" text NOT NULL, "model_id" text NOT NULL, "model_name" text, "custom_prompt" text, CONSTRAINT "PK_38dae00b19ff837456f29681e8c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ai_chat_sessions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "agent_id" uuid NOT NULL, "title" text NOT NULL, CONSTRAINT "PK_b4f4844c31ab277de498502d1cd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ai_chat_messages" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "session_id" uuid NOT NULL, "role" text NOT NULL, "content" text NOT NULL, CONSTRAINT "PK_68e330d1b2a3c5368bf6d2f67cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nordigen_token" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" SERIAL NOT NULL, "access" character varying NOT NULL, "refresh" character varying NOT NULL, "access_expires_on" TIMESTAMP NOT NULL, "refresh_expires_on" TIMESTAMP NOT NULL, CONSTRAINT "PK_bc2732184c5778e6380add85a17" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('info', 'warning', 'important', 'action_required')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "message" character varying NOT NULL, "icon" character varying, "type" "public"."notifications_type_enum" NOT NULL DEFAULT 'info', "action" character varying, "is_read" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_notifications" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "nordigen_requisitions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" character varying NOT NULL, "created" TIMESTAMP NOT NULL, "redirect" character varying NOT NULL, "status" character varying NOT NULL, "institution_id" character varying NOT NULL, "agreement" character varying NOT NULL, "reference" character varying NOT NULL, "user_id" character varying NOT NULL, "accounts" text NOT NULL, "user_language" character varying, "link" character varying NOT NULL, "ssn" character varying, "account_selection" boolean, "redirect_immediate" boolean, CONSTRAINT "PK_877df2653dcdba274df1e50e62f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."nordigen_accounts_cashaccounttype_enum" AS ENUM('CACC', 'CARD', 'CASH', 'CHAR', 'CISH', 'COMM', 'CPAC', 'LLSV', 'LOAN', 'MGLD', 'MOMA', 'NREX', 'ODFT', 'ONDP', 'OTHR', 'SACC', 'SLRY', 'SVGS', 'TAXE', 'TRAN', 'TRAS', 'VACC', 'NFCA', 'UNKNOWN')`,
    );
    await queryRunner.query(
      `CREATE TABLE "nordigen_accounts" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" character varying NOT NULL, "resource_id" character varying, "created" TIMESTAMP, "last_accessed" TIMESTAMP, "last_refreshed" TIMESTAMP, "iban" character varying, "institution_id" character varying NOT NULL, "status" character varying, "bic" character varying, "owner_name" character varying, "metadata_status" character varying, "metadata_raw" jsonb, "details_raw" jsonb, "currency" character varying, "name" character varying, "product" character varying, "cashAccountType" "public"."nordigen_accounts_cashaccounttype_enum" DEFAULT 'UNKNOWN', "maskedPan" character varying, "details" character varying, "linked_account_id" character varying, CONSTRAINT "PK_0694e94eb8c80d33698f181dcf0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."regular_payments_type_enum" AS ENUM('subscription', 'regular_payment', 'regular_income')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."regular_payments_cadence_enum" AS ENUM('weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')`,
    );
    await queryRunner.query(
      `CREATE TABLE "regular_payments" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "type" "public"."regular_payments_type_enum" NOT NULL, "name" character varying NOT NULL, "amount" numeric NOT NULL, "currency" character varying NOT NULL, "cadence" "public"."regular_payments_cadence_enum" NOT NULL, "startDate" date, "imageUrl" character varying, "categoryId" uuid, CONSTRAINT "PK_6e8248be1b02ab2ca0876e35b1b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "categorization_rules" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "name" character varying NOT NULL, "description" character varying NOT NULL DEFAULT '', "result_category_id" character varying NOT NULL, "order" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "condition_logic" character varying NOT NULL DEFAULT 'and', CONSTRAINT "PK_b1094e264581ba5142fa3f0ad47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "rule_conditions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "field" character varying NOT NULL, "operator" character varying NOT NULL, "value" character varying NOT NULL, "order" integer NOT NULL, "ruleId" uuid NOT NULL, CONSTRAINT "PK_8ff5364b054affe0bad08f1ae9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "saving_goals" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "target_amount" integer NOT NULL, "target_date" TIMESTAMP, "priority" integer, "accounts" text NOT NULL, "userId" character varying NOT NULL, CONSTRAINT "PK_5193f14c1c3a38e6657a159795e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" text NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "email_verified" boolean NOT NULL DEFAULT false, "profile_image_url" text, "roles" text DEFAULT '', "default_currency" character varying, "preferred_currencies" text DEFAULT '', "date_format" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_accounts" ("id" text NOT NULL, "accountId" text NOT NULL, "providerId" text NOT NULL, "userId" text NOT NULL, "accessToken" text, "refreshToken" text, "idToken" text, "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE, "scope" text, "password" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_8c9dc84256aeaa852e4d87d782b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "auth_accounts_userId_idx" ON "auth_accounts"  ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" text NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "token" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "ipAddress" text, "userAgent" text, "userId" text NOT NULL, CONSTRAINT "UQ_232f8e85d7633bd6ddfad421696" UNIQUE ("token"), CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "session_userId_idx" ON "session"  ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "verification" ("id" text NOT NULL, "identifier" text NOT NULL, "value" text NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f7e3a90ca384e71d6e2e93bb340" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "verification_identifier_idx" ON "verification"  ("identifier") `,
    );
    await queryRunner.query(
      `CREATE TABLE "budget_categories" ("budget_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_4ccb30803a7cdd0641ef12b7c54" PRIMARY KEY ("budget_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_919faa73fd59efb0f80ccc3607" ON "budget_categories"  ("budget_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7bf4a38f525c0de01a6c4226a0" ON "budget_categories"  ("category_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" ADD CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_86e965e74f9cc66149cf6c90f64" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" ADD CONSTRAINT "FK_2ec27b33e1386cca572d6e62358" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_agents" ADD CONSTRAINT "FK_3984f0347cdde77719a3006950a" FOREIGN KEY ("connection_id") REFERENCES "ai_provider_connections"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_chat_sessions" ADD CONSTRAINT "FK_1ea4e32cf2c61efec788257294c" FOREIGN KEY ("agent_id") REFERENCES "ai_agents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "FK_b7ae07cefc0a6e7f8e29302141a" FOREIGN KEY ("session_id") REFERENCES "ai_chat_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "regular_payments" ADD CONSTRAINT "FK_94c693211773f5231cb916e95dc" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "rule_conditions" ADD CONSTRAINT "FK_77f0ebb17bd9c95e18e4b39c6d7" FOREIGN KEY ("ruleId") REFERENCES "categorization_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_accounts" ADD CONSTRAINT "FK_e9b58c75aefe162ac7c026b761a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "budget_categories" ADD CONSTRAINT "FK_919faa73fd59efb0f80ccc36079" FOREIGN KEY ("budget_id") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "budget_categories" ADD CONSTRAINT "FK_7bf4a38f525c0de01a6c4226a04" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "budget_categories" DROP CONSTRAINT "FK_7bf4a38f525c0de01a6c4226a04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "budget_categories" DROP CONSTRAINT "FK_919faa73fd59efb0f80ccc36079"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "auth_accounts" DROP CONSTRAINT "FK_e9b58c75aefe162ac7c026b761a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "rule_conditions" DROP CONSTRAINT "FK_77f0ebb17bd9c95e18e4b39c6d7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "regular_payments" DROP CONSTRAINT "FK_94c693211773f5231cb916e95dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_chat_messages" DROP CONSTRAINT "FK_b7ae07cefc0a6e7f8e29302141a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_chat_sessions" DROP CONSTRAINT "FK_1ea4e32cf2c61efec788257294c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_agents" DROP CONSTRAINT "FK_3984f0347cdde77719a3006950a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts" DROP CONSTRAINT "FK_2ec27b33e1386cca572d6e62358"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_86e965e74f9cc66149cf6c90f64"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_26d8aec71ae9efbe468043cd2b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "categories" DROP CONSTRAINT "FK_9a6f051e66982b5f0318981bcaa"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7bf4a38f525c0de01a6c4226a0"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_919faa73fd59efb0f80ccc3607"`,
    );
    await queryRunner.query(`DROP TABLE "budget_categories"`);
    await queryRunner.query(
      `DROP INDEX "public"."verification_identifier_idx"`,
    );
    await queryRunner.query(`DROP TABLE "verification"`);
    await queryRunner.query(`DROP INDEX "public"."session_userId_idx"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP INDEX "public"."auth_accounts_userId_idx"`);
    await queryRunner.query(`DROP TABLE "auth_accounts"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "saving_goals"`);
    await queryRunner.query(`DROP TABLE "rule_conditions"`);
    await queryRunner.query(`DROP TABLE "categorization_rules"`);
    await queryRunner.query(`DROP TABLE "regular_payments"`);
    await queryRunner.query(
      `DROP TYPE "public"."regular_payments_cadence_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."regular_payments_type_enum"`);
    await queryRunner.query(`DROP TABLE "nordigen_accounts"`);
    await queryRunner.query(
      `DROP TYPE "public"."nordigen_accounts_cashaccounttype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "nordigen_requisitions"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP TABLE "nordigen_token"`);
    await queryRunner.query(`DROP TABLE "ai_chat_messages"`);
    await queryRunner.query(`DROP TABLE "ai_chat_sessions"`);
    await queryRunner.query(`DROP TABLE "ai_agents"`);
    await queryRunner.query(`DROP TABLE "ai_provider_connections"`);
    await queryRunner.query(
      `DROP TYPE "public"."ai_provider_connections_provider_enum"`,
    );
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_source_enum"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c7677fa092ee0c2659fbf45292"`,
    );
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "budgets"`);
    await queryRunner.query(`DROP TABLE "institutions"`);
  }
}
