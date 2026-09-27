-- One-time backfill: copy legacy single-provider assignments into care_team_members.
-- Run AFTER `npx prisma db push` has created the care_team_members table.
-- Safe to re-run (ON CONFLICT DO NOTHING).
INSERT INTO care_team_members (id, "patientId", "providerId", "createdAt")
SELECT gen_random_uuid(), pp.id, pp."assignedProviderId", NOW()
FROM patient_profiles pp
JOIN provider_profiles prov ON prov.id = pp."assignedProviderId"
WHERE pp."assignedProviderId" IS NOT NULL
ON CONFLICT ("patientId", "providerId") DO NOTHING;
