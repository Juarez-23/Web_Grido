-- ============================================================
-- MIGRACIÓN MULTI-SUCURSAL (branch_id)
-- Correr UNA sola vez en el SQL Editor de Supabase.
-- Crea las sucursales, asigna lo existente a "Libertador"
-- y duplica el catálogo para "Salto".
-- ============================================================

BEGIN;

-- 1) Tabla de sucursales ------------------------------------------------
CREATE TABLE IF NOT EXISTS "branches" (
  "id"        text PRIMARY KEY,
  "name"      text NOT NULL,
  "slug"      text NOT NULL UNIQUE,
  "active"    boolean NOT NULL DEFAULT true,
  "order"     integer NOT NULL DEFAULT 0,
  "createdAt" timestamp(3) NOT NULL DEFAULT now(),
  "updatedAt" timestamp(3) NOT NULL DEFAULT now()
);

INSERT INTO "branches" ("id","name","slug","order") VALUES
  ('branch_libertador','Grido Libertador','libertador',0),
  ('branch_salto','Grido Salto','salto',1)
ON CONFLICT ("id") DO NOTHING;

-- 2) Agregar branchId (nullable por ahora) ------------------------------
ALTER TABLE "categories"  ADD COLUMN IF NOT EXISTS "branchId" text;
ALTER TABLE "products"    ADD COLUMN IF NOT EXISTS "branchId" text;
ALTER TABLE "flavors"     ADD COLUMN IF NOT EXISTS "branchId" text;
ALTER TABLE "orders"      ADD COLUMN IF NOT EXISTS "branchId" text;
ALTER TABLE "settings"    ADD COLUMN IF NOT EXISTS "branchId" text;
ALTER TABLE "promotions"  ADD COLUMN IF NOT EXISTS "branchId" text;
ALTER TABLE "users"       ADD COLUMN IF NOT EXISTS "branchId" text;

-- 3) Backfill: todo lo existente pasa a Libertador ----------------------
UPDATE "categories"  SET "branchId" = 'branch_libertador' WHERE "branchId" IS NULL;
UPDATE "products"    SET "branchId" = 'branch_libertador' WHERE "branchId" IS NULL;
UPDATE "flavors"     SET "branchId" = 'branch_libertador' WHERE "branchId" IS NULL;
UPDATE "orders"      SET "branchId" = 'branch_libertador' WHERE "branchId" IS NULL;
UPDATE "settings"    SET "branchId" = 'branch_libertador' WHERE "branchId" IS NULL;
UPDATE "promotions"  SET "branchId" = 'branch_libertador' WHERE "branchId" IS NULL;

-- 4) Quitar constraints únicas viejas (globales) ANTES de duplicar -------
--    (si no, los nombres repetidos de Salto chocan con el unique global)
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_key";
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_slug_key";
ALTER TABLE "flavors"    DROP CONSTRAINT IF EXISTS "flavors_name_key";
ALTER TABLE "settings"   DROP CONSTRAINT IF EXISTS "settings_key_key";
ALTER TABLE "orders"     DROP CONSTRAINT IF EXISTS "orders_orderNumber_key";

-- 5) Duplicar catálogo para Salto (ids deterministas 'salto_' || id) -----
--    Solo si Salto todavía no tiene categorías (evita duplicar dos veces).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "categories" WHERE "branchId" = 'branch_salto') THEN

    INSERT INTO "categories" ("id","name","slug","icon","order","active","branchId")
    SELECT 'salto_' || "id", "name", "slug", "icon", "order", "active", 'branch_salto'
    FROM "categories" WHERE "branchId" = 'branch_libertador';

    INSERT INTO "products" ("id","name","description","price","image","maxFlavors","active","featured","categoryId","branchId","createdAt","updatedAt")
    SELECT 'salto_' || "id", "name", "description", "price", "image", "maxFlavors", "active", "featured",
           'salto_' || "categoryId", 'branch_salto', now(), now()
    FROM "products" WHERE "branchId" = 'branch_libertador';

    INSERT INTO "flavors" ("id","name","available","order","branchId")
    SELECT 'salto_' || "id", "name", "available", "order", 'branch_salto'
    FROM "flavors" WHERE "branchId" = 'branch_libertador';

    INSERT INTO "promotions" ("id","title","description","image","badge","active","order","branchId","createdAt","updatedAt")
    SELECT 'salto_' || "id", "title", "description", "image", "badge", "active", "order", 'branch_salto', now(), now()
    FROM "promotions" WHERE "branchId" = 'branch_libertador';

    INSERT INTO "settings" ("id","key","value","branchId")
    SELECT 'salto_' || "id", "key", "value", 'branch_salto'
    FROM "settings" WHERE "branchId" = 'branch_libertador';

  END IF;
END $$;

-- 6) NOT NULL ahora que todo está backfilleado --------------------------
ALTER TABLE "categories"  ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "products"    ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "flavors"     ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "orders"      ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "settings"    ALTER COLUMN "branchId" SET NOT NULL;
ALTER TABLE "promotions"  ALTER COLUMN "branchId" SET NOT NULL;

-- 7) Constraints únicas compuestas nuevas -------------------------------
ALTER TABLE "categories" ADD CONSTRAINT "categories_branchId_slug_key" UNIQUE ("branchId","slug");
ALTER TABLE "categories" ADD CONSTRAINT "categories_branchId_name_key" UNIQUE ("branchId","name");
ALTER TABLE "flavors"    ADD CONSTRAINT "flavors_branchId_name_key"    UNIQUE ("branchId","name");
ALTER TABLE "settings"   ADD CONSTRAINT "settings_branchId_key_key"    UNIQUE ("branchId","key");
ALTER TABLE "orders"     ADD CONSTRAINT "orders_branchId_orderNumber_key" UNIQUE ("branchId","orderNumber");

-- 8) Foreign keys hacia branches ----------------------------------------
ALTER TABLE "categories" ADD CONSTRAINT "categories_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
ALTER TABLE "products"   ADD CONSTRAINT "products_branchId_fkey"   FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
ALTER TABLE "flavors"    ADD CONSTRAINT "flavors_branchId_fkey"    FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
ALTER TABLE "settings"   ADD CONSTRAINT "settings_branchId_fkey"   FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
ALTER TABLE "promotions" ADD CONSTRAINT "promotions_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE;
ALTER TABLE "orders"     ADD CONSTRAINT "orders_branchId_fkey"     FOREIGN KEY ("branchId") REFERENCES "branches"("id");
ALTER TABLE "users"      ADD CONSTRAINT "users_branchId_fkey"      FOREIGN KEY ("branchId") REFERENCES "branches"("id");

-- 9) Índices ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "products_branchId_idx"   ON "products" ("branchId");
CREATE INDEX IF NOT EXISTS "orders_branchId_idx"     ON "orders" ("branchId");
CREATE INDEX IF NOT EXISTS "promotions_branchId_idx" ON "promotions" ("branchId");

COMMIT;
