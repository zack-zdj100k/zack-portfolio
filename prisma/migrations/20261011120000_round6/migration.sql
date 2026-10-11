-- CreateEnum
CREATE TYPE "ArchitectureStatus" AS ENUM ('HIDDEN', 'PROPOSED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "ArchitectureNodeKind" AS ENUM ('CLIENT', 'FRONTEND', 'API', 'BACKEND', 'DATABASE', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "AiServiceStatus" AS ENUM ('AVAILABLE', 'COMING_SOON', 'HIDDEN');

-- CreateEnum
CREATE TYPE "AiServiceCta" AS ENUM ('CONTACT', 'WAITLIST', 'NONE');

-- CreateEnum
CREATE TYPE "InquiryKind" AS ENUM ('INQUIRY', 'WAITLIST');

-- AlterEnum
ALTER TYPE "ImageKind" ADD VALUE 'VISUAL_EXPLORATION';

-- DropForeignKey
ALTER TABLE "CountryOfferTranslation" DROP CONSTRAINT "CountryOfferTranslation_offerId_fkey";

-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_offerId_fkey";

-- AlterTable
ALTER TABLE "ContactInquiry" ADD COLUMN     "aiServiceId" TEXT,
ADD COLUMN     "kind" "InquiryKind" NOT NULL DEFAULT 'INQUIRY';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "architectureStatus" "ArchitectureStatus" NOT NULL DEFAULT 'HIDDEN';

-- AlterTable
ALTER TABLE "ProjectTranslation" ADD COLUMN     "backendText" TEXT,
ADD COLUMN     "databaseText" TEXT,
ADD COLUMN     "flowText" TEXT,
ADD COLUMN     "frontendText" TEXT;

-- CreateTable
CREATE TABLE "SkillGroup" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SkillGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGroupTranslation" (
    "groupId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SkillGroupTranslation_pkey" PRIMARY KEY ("groupId","locale")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillTranslation" (
    "skillId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SkillTranslation_pkey" PRIMARY KEY ("skillId","locale")
);

-- CreateTable
CREATE TABLE "SkillProject" (
    "skillId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "SkillProject_pkey" PRIMARY KEY ("skillId","projectId")
);

-- CreateTable
CREATE TABLE "ProcessStep" (
    "id" TEXT NOT NULL,
    "icon" TEXT,
    "mediaId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProcessStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProcessStepTranslation" (
    "stepId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ProcessStepTranslation_pkey" PRIMARY KEY ("stepId","locale")
);

-- CreateTable
CREATE TABLE "ArchitectureNode" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "kind" "ArchitectureNodeKind" NOT NULL,
    "technology" TEXT,
    "parentId" TEXT,
    "label" JSONB,
    "body" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ArchitectureNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralOffer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ReferralOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralOfferTranslation" (
    "offerId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "eligibility" TEXT NOT NULL,
    "payoutConditions" TEXT NOT NULL,
    "terms" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReferralOfferTranslation_pkey" PRIMARY KEY ("offerId","locale")
);

-- CreateTable
CREATE TABLE "ReferralOfferCountry" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT NOT NULL,
    "rewardMinor" BIGINT NOT NULL,
    "categories" "ProjectCategory"[],
    "minProjectValueMinor" BIGINT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',

    CONSTRAINT "ReferralOfferCountry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralOfferCountryTranslation" (
    "offerCountryId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "eligibility" TEXT,
    "payoutConditions" TEXT,
    "terms" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ReferralOfferCountryTranslation_pkey" PRIMARY KEY ("offerCountryId","locale")
);

-- CreateTable
CREATE TABLE "AiService" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" "AiServiceStatus" NOT NULL DEFAULT 'HIDDEN',
    "publishStatus" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "cta" "AiServiceCta" NOT NULL DEFAULT 'CONTACT',
    "waitlistEnabled" BOOLEAN NOT NULL DEFAULT false,
    "financial" BOOLEAN NOT NULL DEFAULT false,
    "icon" TEXT,
    "mediaId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AiService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiServiceTranslation" (
    "serviceId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ctaLabel" TEXT,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "AiServiceTranslation_pkey" PRIMARY KEY ("serviceId","locale")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillGroup_key_key" ON "SkillGroup"("key");

-- CreateIndex
CREATE INDEX "Skill_groupId_sortOrder_idx" ON "Skill"("groupId", "sortOrder");

-- CreateIndex
CREATE INDEX "ArchitectureNode_projectId_sortOrder_idx" ON "ArchitectureNode"("projectId", "sortOrder");

-- CreateIndex
CREATE INDEX "ReferralOfferCountry_country_status_idx" ON "ReferralOfferCountry"("country", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralOfferCountry_offerId_country_key" ON "ReferralOfferCountry"("offerId", "country");

-- CreateIndex
CREATE UNIQUE INDEX "AiService_key_key" ON "AiService"("key");

-- AddForeignKey
ALTER TABLE "SkillGroupTranslation" ADD CONSTRAINT "SkillGroupTranslation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SkillGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "SkillGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillTranslation" ADD CONSTRAINT "SkillTranslation_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProject" ADD CONSTRAINT "SkillProject_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillProject" ADD CONSTRAINT "SkillProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStep" ADD CONSTRAINT "ProcessStep_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProcessStepTranslation" ADD CONSTRAINT "ProcessStepTranslation_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProcessStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchitectureNode" ADD CONSTRAINT "ArchitectureNode_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArchitectureNode" ADD CONSTRAINT "ArchitectureNode_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ArchitectureNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralOfferTranslation" ADD CONSTRAINT "ReferralOfferTranslation_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "ReferralOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralOfferCountry" ADD CONSTRAINT "ReferralOfferCountry_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "ReferralOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralOfferCountryTranslation" ADD CONSTRAINT "ReferralOfferCountryTranslation_offerCountryId_fkey" FOREIGN KEY ("offerCountryId") REFERENCES "ReferralOfferCountry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiService" ADD CONSTRAINT "AiService_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiServiceTranslation" ADD CONSTRAINT "AiServiceTranslation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "AiService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactInquiry" ADD CONSTRAINT "ContactInquiry_aiServiceId_fkey" FOREIGN KEY ("aiServiceId") REFERENCES "AiService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Data: previous skills list → hidden "previous-*" groups (the owner decides what to keep) ───
INSERT INTO "SkillGroup" ("id", "key", "sortOrder", "visible")
SELECT gen_random_uuid()::text, 'previous-' || g.key, 100 + g.ord, false
FROM "Profile" p, (VALUES ('frontend', 1), ('backend', 2), ('databases', 3), ('tools', 4)) AS g(key, ord)
WHERE p.id = 1 AND jsonb_typeof(p.skills -> g.key) = 'array' AND jsonb_array_length(p.skills -> g.key) > 0;

INSERT INTO "SkillGroupTranslation" ("groupId", "locale", "name", "reviewed")
SELECT sg.id, 'en', 'Previous list: ' || initcap(substring(sg.key FROM 10)), true
FROM "SkillGroup" sg WHERE sg.key LIKE 'previous-%';

INSERT INTO "Skill" ("id", "groupId", "name", "sortOrder", "visible")
SELECT gen_random_uuid()::text, sg.id, e.name, (e.ord - 1)::int, true
FROM "SkillGroup" sg
JOIN "Profile" p ON p.id = 1
CROSS JOIN LATERAL jsonb_array_elements_text(p.skills -> substring(sg.key FROM 10)) WITH ORDINALITY AS e(name, ord)
WHERE sg.key LIKE 'previous-%';

-- ─── Data: CountryOffer → ReferralOffer + ReferralOfferCountry ───
-- Each old offer becomes a programme with the same id. A country offer keeps its id as the country
-- row, so existing referrals stay linked. The old "*" (every other country) offer gets no countries:
-- the owner now picks eligible countries explicitly.
INSERT INTO "ReferralOffer" ("id", "name", "status", "sortOrder")
SELECT co.id,
       CASE WHEN co.market = '*' THEN 'Other countries (choose the eligible countries)' ELSE 'Offer ' || co.market END,
       CASE WHEN co.market = '*' THEN 'DRAFT'::"PublishStatus" ELSE co.status END,
       co."sortOrder"
FROM "CountryOffer" co;

INSERT INTO "ReferralOfferTranslation" ("offerId", "locale", "eligibility", "payoutConditions", "terms", "reviewed")
SELECT t."offerId", t.locale, '', t."whenEarned", t.terms, t.reviewed FROM "CountryOfferTranslation" t;

INSERT INTO "ReferralOfferCountry" ("id", "offerId", "country", "available", "currency", "rewardMinor", "categories", "minProjectValueMinor", "status")
SELECT co.id, co.id, co.market, true, co.currency, co."rewardMinor",
       CASE WHEN co.category IS NULL THEN ARRAY[]::"ProjectCategory"[] ELSE ARRAY[co.category] END,
       co."minProjectValueMinor", co.status
FROM "CountryOffer" co WHERE co.market <> '*';

-- Referrals made under the "*" offer keep their reward snapshot; the link goes.
UPDATE "Referral" SET "offerId" = NULL WHERE "offerId" IN (SELECT id FROM "CountryOffer" WHERE market = '*');

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "skills";

-- DropTable
DROP TABLE "CountryOffer";

-- DropTable
DROP TABLE "CountryOfferTranslation";

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "ReferralOfferCountry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
