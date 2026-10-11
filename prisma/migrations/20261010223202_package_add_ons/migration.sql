-- AlterTable
ALTER TABLE "PricingPackageTranslation" ADD COLUMN     "addOns" TEXT[] DEFAULT ARRAY[]::TEXT[];
