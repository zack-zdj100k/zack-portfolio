-- The seeded "Custom platform or app" package had no type, so it showed under "Custom platforms".
-- The owner wants it under "Mobile apps". Only the untyped seeded package is touched, matched by its
-- English name or its seeded description (the owner may have renamed it).

UPDATE "PricingPackage" AS package
SET "category" = 'APP'
FROM "PricingPackageTranslation" AS translation
WHERE translation."packageId" = package."id"
  AND translation."locale" = 'en'
  AND package."category" IS NULL
  AND (
    translation."name" = 'Custom platform or app'
    OR translation."description" = 'Marketplaces, multi-user platforms, apps and desktop software.'
  );
