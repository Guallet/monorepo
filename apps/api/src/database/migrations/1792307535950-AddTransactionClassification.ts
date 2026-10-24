import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransactionClassification1792307535950 implements MigrationInterface {
  name = 'AddTransactionClassification1792307535950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "classification_state" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" text NOT NULL, "revision" integer NOT NULL DEFAULT '1', "inbox_cursor" uuid, CONSTRAINT "PK_d92c9a1e41543acc775c37602db" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "classification_work" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "run_id" uuid NOT NULL, "transaction_id" uuid NOT NULL, "transaction_revision" integer NOT NULL, "status" text NOT NULL DEFAULT 'queued', "attempts" integer NOT NULL DEFAULT '0', "available_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "error_code" text, "latency_ms" integer, CONSTRAINT "PK_508abf28d0371a6164d239e0f5b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_de03ba13966fe476c46c9d4d91" ON "classification_work"  ("run_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa57e2b181f33b861c27b91f1c" ON "classification_work"  ("user_id", "status", "available_at") `,
    );
    await queryRunner.query(
      `CREATE TABLE "decision_connections" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "display_name" text NOT NULL, "base_url" text NOT NULL, "model" text NOT NULL DEFAULT 'jev-latest', "auth_type" text NOT NULL DEFAULT 'none', "auth_header_name" text, "encrypted_credentials" text, "credential_hint" text, "revision" integer NOT NULL DEFAULT '1', "min_confidence" double precision NOT NULL DEFAULT '0.7', "min_margin" double precision NOT NULL DEFAULT '0.1', "send_notes" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT false, "last_test_status" text, "last_test_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_7d63154caa9736074d1432aecd3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_18b9f937bbea55f64750bf8e67" ON "decision_connections"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction_suggestions" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "transaction_id" uuid NOT NULL, "source" text NOT NULL, "rule_id" uuid, "connection_id" uuid, "suggested_category_id" uuid, "confidence" double precision, "status" text NOT NULL DEFAULT 'pending', "fingerprint" text NOT NULL, "resolved_category_id" uuid, "resolved_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_871e3b4fb7e2ca075f95f0f03af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_53777434e2849500ca5936dc46" ON "transaction_suggestions"  ("user_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_97b9aa32461e941cf4f2ba776d" ON "transaction_suggestions"  ("transaction_id") WHERE status = 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD "revision" integer NOT NULL DEFAULT '1'`,
    );
    // Hand-authored triggers supplement the generated entity schema.
    await queryRunner.query(`-- Cross-table ownership and cleanup are enforced even for direct importer writes.
ALTER TABLE decision_connections ADD CONSTRAINT decision_connection_owner FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE classification_state ADD CONSTRAINT classification_state_owner FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE classification_work ADD CONSTRAINT classification_work_owner FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE classification_work ADD CONSTRAINT classification_work_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE;
ALTER TABLE transaction_suggestions ADD CONSTRAINT suggestion_owner FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE transaction_suggestions ADD CONSTRAINT suggestion_transaction FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE;
ALTER TABLE transaction_suggestions ADD CONSTRAINT suggestion_category FOREIGN KEY (suggested_category_id) REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE decision_connections ADD CONSTRAINT decision_thresholds CHECK (min_confidence BETWEEN 0 AND 1 AND min_margin BETWEEN 0 AND 1);
INSERT INTO classification_state(user_id) SELECT id FROM users ON CONFLICT DO NOTHING;

CREATE FUNCTION classification_invalidate(owner_id text, only_source text DEFAULT NULL) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Never resurrect state during user deletion cascades.
  INSERT INTO classification_state(user_id, revision) SELECT owner_id, 1 FROM users WHERE id=owner_id AND deleted_at IS NULL
    ON CONFLICT (user_id) DO UPDATE SET revision=classification_state.revision+1, updated_at=now();
  UPDATE transaction_suggestions SET status='superseded', updated_at=now() WHERE user_id=owner_id AND status='pending' AND (only_source IS NULL OR source=only_source);
END $$;

CREATE FUNCTION classification_configuration_changed() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE owner_id text;
BEGIN
  IF TG_TABLE_NAME = 'rule_conditions' THEN
    SELECT user_id INTO owner_id FROM categorization_rules WHERE id=COALESCE(NEW."ruleId",OLD."ruleId");
  ELSE owner_id := COALESCE(NEW.user_id, OLD.user_id); END IF;
  IF owner_id IS NOT NULL THEN PERFORM classification_invalidate(owner_id); END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
CREATE TRIGGER classification_categories AFTER INSERT OR UPDATE OR DELETE ON categories FOR EACH ROW EXECUTE FUNCTION classification_configuration_changed();
CREATE TRIGGER classification_rules AFTER INSERT OR UPDATE OR DELETE ON categorization_rules FOR EACH ROW EXECUTE FUNCTION classification_configuration_changed();
CREATE TRIGGER classification_conditions AFTER INSERT OR UPDATE OR DELETE ON rule_conditions FOR EACH ROW EXECUTE FUNCTION classification_configuration_changed();

CREATE FUNCTION classification_connection_changed() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='DELETE' THEN
    PERFORM classification_invalidate(OLD.user_id, 'decision_api');
    RETURN OLD;
  END IF;
  IF TG_OP='INSERT' OR (to_jsonb(NEW) - ARRAY['updated_at','last_test_at','last_test_status','revision']) IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['updated_at','last_test_at','last_test_status','revision']) THEN
    NEW.revision := CASE WHEN TG_OP='INSERT' THEN 1 ELSE OLD.revision+1 END;
    PERFORM classification_invalidate(NEW.user_id, 'decision_api');
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER classification_connection BEFORE INSERT OR UPDATE OR DELETE ON decision_connections FOR EACH ROW EXECUTE FUNCTION classification_connection_changed();

CREATE FUNCTION classification_transaction_changed() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  owner_id text;
  classification_changed boolean;
BEGIN
  SELECT user_id INTO owner_id FROM accounts WHERE id=NEW."accountId";
  IF NEW."categoryId" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM categories WHERE id=NEW."categoryId" AND user_id=owner_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Category must belong to transaction owner' USING ERRCODE='23514';
  END IF;
  IF TG_OP='UPDATE' THEN
    classification_changed :=
      NEW."categoryId" IS DISTINCT FROM OLD."categoryId"
      OR (NEW.description, NEW.notes, NEW.amount, NEW.currency, NEW.date, NEW."accountId", NEW.deleted_at)
        IS DISTINCT FROM (OLD.description, OLD.notes, OLD.amount, OLD.currency, OLD.date, OLD."accountId", OLD.deleted_at);
    IF classification_changed THEN
      NEW.revision := OLD.revision+1;
      IF NEW."categoryId" IS DISTINCT FROM OLD."categoryId" THEN
        UPDATE transaction_suggestions SET status=CASE WHEN NEW."categoryId"=suggested_category_id THEN 'accepted' ELSE 'rejected' END,
          resolved_category_id=NEW."categoryId", resolved_at=now(), updated_at=now()
          WHERE transaction_id=NEW.id AND user_id=owner_id AND status='pending';
      ELSE
        UPDATE transaction_suggestions SET status='superseded',updated_at=now() WHERE transaction_id=NEW.id AND user_id=owner_id AND status='pending';
      END IF;
      IF NEW."categoryId" IS NULL AND NEW.deleted_at IS NULL THEN
        INSERT INTO classification_work(user_id, run_id, transaction_id, transaction_revision)
          VALUES(owner_id, uuid_generate_v4(), NEW.id, NEW.revision);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER classification_transaction_revision BEFORE INSERT OR UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION classification_transaction_changed();

CREATE FUNCTION classification_transaction_created() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE owner_id text;
BEGIN
  SELECT a.user_id INTO owner_id FROM accounts a JOIN users u ON u.id=a.user_id WHERE a.id=NEW."accountId" AND u.deleted_at IS NULL;
  IF owner_id IS NOT NULL THEN
    INSERT INTO classification_state(user_id) VALUES(owner_id) ON CONFLICT DO NOTHING;
    IF NEW."categoryId" IS NULL AND NEW.deleted_at IS NULL THEN
      INSERT INTO classification_work(user_id, run_id, transaction_id, transaction_revision) VALUES(owner_id, uuid_generate_v4(), NEW.id, NEW.revision);
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER classification_transaction_outbox AFTER INSERT ON transactions FOR EACH ROW EXECUTE FUNCTION classification_transaction_created();

CREATE FUNCTION classification_rule_owner() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE id::text=NEW.result_category_id AND user_id=NEW.user_id AND deleted_at IS NULL) THEN
    RAISE EXCEPTION 'Rule category must belong to owner' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER classification_rule_ownership BEFORE INSERT OR UPDATE OF result_category_id,user_id ON categorization_rules FOR EACH ROW EXECUTE FUNCTION classification_rule_owner();

CREATE FUNCTION classification_user_deleted() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL THEN
    DELETE FROM decision_connections WHERE user_id=NEW.id;
    DELETE FROM transaction_suggestions WHERE user_id=NEW.id;
    DELETE FROM classification_work WHERE user_id=NEW.id;
    DELETE FROM classification_state WHERE user_id=NEW.id;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER classification_user_cleanup AFTER UPDATE OF deleted_at ON users FOR EACH ROW EXECUTE FUNCTION classification_user_deleted();
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER classification_user_cleanup ON users;
DROP TRIGGER classification_rule_ownership ON categorization_rules;
DROP TRIGGER classification_transaction_outbox ON transactions;
DROP TRIGGER classification_transaction_revision ON transactions;
DROP TRIGGER classification_connection ON decision_connections;
DROP TRIGGER classification_conditions ON rule_conditions;
DROP TRIGGER classification_rules ON categorization_rules;
DROP TRIGGER classification_categories ON categories;
DROP FUNCTION classification_user_deleted();
DROP FUNCTION classification_rule_owner();
DROP FUNCTION classification_transaction_created();
DROP FUNCTION classification_transaction_changed();
DROP FUNCTION classification_connection_changed();
DROP FUNCTION classification_configuration_changed();
DROP FUNCTION classification_invalidate(text,text);`);
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP COLUMN "revision"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97b9aa32461e941cf4f2ba776d"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_53777434e2849500ca5936dc46"`,
    );
    await queryRunner.query(`DROP TABLE "transaction_suggestions"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_18b9f937bbea55f64750bf8e67"`,
    );
    await queryRunner.query(`DROP TABLE "decision_connections"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fa57e2b181f33b861c27b91f1c"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_de03ba13966fe476c46c9d4d91"`,
    );
    await queryRunner.query(`DROP TABLE "classification_work"`);
    await queryRunner.query(`DROP TABLE "classification_state"`);
  }
}
