-- Add nullable Product parcel fields without changing existing data or tables.
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight" DOUBLE PRECISION;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "length" DOUBLE PRECISION;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "width" DOUBLE PRECISION;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "height" DOUBLE PRECISION;

-- Preserve real legacy measurements when they were previously stored in JSON.
-- Values that are absent or non-numeric stay NULL and must be configured by an admin.
UPDATE "products"
SET
  "length" = COALESCE("length", CASE WHEN COALESCE("specifications" ->> 'length', "specifications" -> 'dimensions' ->> 'length') ~ '^\s*[0-9]+(\.[0-9]+)?\s*$' THEN COALESCE("specifications" ->> 'length', "specifications" -> 'dimensions' ->> 'length')::DOUBLE PRECISION END),
  "width" = COALESCE("width", CASE WHEN COALESCE("specifications" ->> 'width', "specifications" -> 'dimensions' ->> 'width') ~ '^\s*[0-9]+(\.[0-9]+)?\s*$' THEN COALESCE("specifications" ->> 'width', "specifications" -> 'dimensions' ->> 'width')::DOUBLE PRECISION END),
  "height" = COALESCE("height", CASE WHEN COALESCE("specifications" ->> 'height', "specifications" -> 'dimensions' ->> 'height') ~ '^\s*[0-9]+(\.[0-9]+)?\s*$' THEN COALESCE("specifications" ->> 'height', "specifications" -> 'dimensions' ->> 'height')::DOUBLE PRECISION END)
WHERE "specifications" IS NOT NULL;
