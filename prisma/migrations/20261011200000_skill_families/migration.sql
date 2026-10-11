-- Owner's update (2026-10-11): skills can sit in more than one family, and each family gets the
-- skills the owner listed. Adds only what a family is missing (same name, any case); skills the
-- owner added, edited or hid stay as they are. New skills go after the family's existing ones.
INSERT INTO "Skill" ("id", "groupId", "name", "sortOrder", "visible")
SELECT gen_random_uuid()::text, g."id", v.name,
       COALESCE((SELECT MAX(s."sortOrder") FROM "Skill" s WHERE s."groupId" = g."id"), -1) + v.ord,
       true
FROM (VALUES
  ('web', 'React', 1), ('web', 'Tailwind CSS', 2), ('web', 'TypeScript', 3), ('web', 'Next.js', 4),
  ('backend', 'TypeScript', 1), ('backend', 'Next.js', 2), ('backend', 'REST APIs', 3),
  ('database', 'MySQL', 1), ('database', 'Prisma ORM', 2), ('database', 'Prisma Migrate', 3),
  ('data', 'Python', 1), ('data', 'SQL', 2), ('data', 'R', 3)
) AS v(gkey, name, ord)
JOIN "SkillGroup" g ON g."key" = v.gkey
WHERE NOT EXISTS (
  SELECT 1 FROM "Skill" s WHERE s."groupId" = g."id" AND lower(s."name") = lower(v.name)
);
