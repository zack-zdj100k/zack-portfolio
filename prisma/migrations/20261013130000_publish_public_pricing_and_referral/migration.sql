-- Publish the pricing and Algerian referral offer shown in the owner's local portfolio.
-- Apply only to the initial draft rows created by the project seed.

UPDATE "PricingPackage" AS package
SET "status" = 'PUBLISHED'
FROM "PricingPackageTranslation" AS translation
WHERE translation."packageId" = package."id"
  AND translation."locale" = 'en'
  AND translation."name" IN (
    'Landing page',
    'Business website',
    'Online shop or booking',
    'Custom platform or app'
  )
  AND package."status" = 'DRAFT';

UPDATE "PackagePrice" AS price
SET "minMinor" = values.min_minor,
    "maxMinor" = values.max_minor,
    "stepMinor" = values.step_minor
FROM "PricingPackageTranslation" AS translation,
     (VALUES
       ('Landing page', 3000000::BIGINT, 4000000::BIGINT, 100000::BIGINT),
       ('Business website', 5000000::BIGINT, 7000000::BIGINT, 200000::BIGINT),
       ('Online shop or booking', 7500000::BIGINT, 18000000::BIGINT, 500000::BIGINT),
       ('Custom platform or app', 12000000::BIGINT, 60000000::BIGINT, 1000000::BIGINT)
     ) AS price_values(name, min_minor, max_minor, step_minor)
WHERE translation."packageId" = price."packageId"
  AND translation."locale" = 'en'
  AND translation."name" = price_values.name
  AND price."market" = 'DZ'
  AND price."currency" = 'DZD';

UPDATE "ReferralOfferCountry" AS country
SET "available" = TRUE,
    "currency" = 'DZD',
    "rewardMinor" = 1000000,
    "categories" = ARRAY['WEBSITE']::"ProjectCategory"[],
    "minProjectValueMinor" = 7000000,
    "status" = 'PUBLISHED'
FROM "ReferralOffer" AS offer
WHERE country."offerId" = offer."id"
  AND offer."name" = 'Offer DZ'
  AND country."country" = 'DZ'
  AND country."status" = 'DRAFT';

UPDATE "ReferralOffer" AS offer
SET "status" = 'PUBLISHED'
WHERE offer."name" = 'Offer DZ'
  AND offer."status" = 'DRAFT'
  AND EXISTS (
    SELECT 1
    FROM "ReferralOfferCountry" AS country
    WHERE country."offerId" = offer."id"
      AND country."country" = 'DZ'
      AND country."status" = 'PUBLISHED'
  );
