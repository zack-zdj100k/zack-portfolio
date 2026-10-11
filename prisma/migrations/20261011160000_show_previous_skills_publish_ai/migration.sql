-- Owner request (2026-10-11): show the earlier stack next to the new skill groups, and offer AI
-- agents and AI automations now (published, not Coming Soon). Data only, no schema change.

-- 1. The earlier list (moved to hidden "previous-*" groups in the round 6 migration) is shown again,
--    under its original names, after the owner's new groups.
UPDATE "SkillGroup" g
SET "visible" = true, "key" = substring(g."key" FROM 10)
WHERE g."key" LIKE 'previous-%'
  AND NOT EXISTS (SELECT 1 FROM "SkillGroup" o WHERE o."key" = substring(g."key" FROM 10));

UPDATE "SkillGroupTranslation" t
SET "name" = CASE g."key" WHEN 'frontend' THEN 'Frontend' WHEN 'backend' THEN 'Backend' WHEN 'databases' THEN 'Databases' WHEN 'tools' THEN 'Tools' ELSE t."name" END
FROM "SkillGroup" g
WHERE t."groupId" = g."id" AND t."locale" = 'en' AND t."name" LIKE 'Previous list: %';

-- 2. AI agents and AI automations: available now and published.
UPDATE "AiService" SET "status" = 'AVAILABLE', "publishStatus" = 'PUBLISHED', "cta" = 'CONTACT'
WHERE "key" IN ('ai-agents', 'ai-automations');

UPDATE "AiServiceTranslation" t
SET "description" = 'I build AI agents that take on a defined task for your business, such as answering common questions or sorting incoming requests, and hand over to a person when needed.'
FROM "AiService" s
WHERE t."serviceId" = s."id" AND s."key" = 'ai-agents' AND t."locale" = 'en'
  AND t."description" = 'Assistants that take on a defined task for your business, such as answering common questions or sorting incoming requests, and hand over to a person when needed.';

UPDATE "AiServiceTranslation" t
SET "title" = 'AI automations and workflows',
    "description" = 'I build automation workflows that connect the tools you already use and take repetitive steps off your team, such as drafting replies, summarising messages or filling in records.'
FROM "AiService" s
WHERE t."serviceId" = s."id" AND s."key" = 'ai-automations' AND t."locale" = 'en'
  AND t."description" = 'Automations that connect the tools you already use and take repetitive steps off your team, such as drafting replies, summarising messages or filling in records.';
