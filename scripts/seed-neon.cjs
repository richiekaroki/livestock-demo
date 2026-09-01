const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function seed() {
  console.log('Cleaning up...\n');
  
  await p.$executeRawUnsafe(`DELETE FROM "weight_records"`);
  await p.$executeRawUnsafe(`DELETE FROM "mortalities"`);
  await p.$executeRawUnsafe(`DELETE FROM "diseases"`);
  await p.$executeRawUnsafe(`DELETE FROM "vaccinations"`);
  await p.$executeRawUnsafe(`DELETE FROM "animals"`);
  await p.$executeRawUnsafe(`DELETE FROM "farmers"`);
  await p.$executeRawUnsafe(`DELETE FROM "outbreaks"`);
  await p.$executeRawUnsafe(`DELETE FROM "disease_risks"`);
  console.log('Tables cleared');

  // Reset sequences
  await p.$executeRawUnsafe(`ALTER SEQUENCE "farmers_id_seq" RESTART WITH 1`);
  await p.$executeRawUnsafe(`ALTER SEQUENCE "animals_id_seq" RESTART WITH 1`);
  await p.$executeRawUnsafe(`ALTER SEQUENCE "vaccinations_id_seq" RESTART WITH 1`);
  await p.$executeRawUnsafe(`ALTER SEQUENCE "diseases_id_seq" RESTART WITH 1`);
  await p.$executeRawUnsafe(`ALTER SEQUENCE "mortalities_id_seq" RESTART WITH 1`);
  await p.$executeRawUnsafe(`ALTER SEQUENCE "weight_records_id_seq" RESTART WITH 1`);
  await p.$executeRawUnsafe(`ALTER SEQUENCE "outbreaks_id_seq" RESTART WITH 1`);
  await p.$executeRawUnsafe(`ALTER SEQUENCE "disease_risks_id_seq" RESTART WITH 1`);
  console.log('Sequences reset');

  // 1. Farmers
  const farmers = [
    { code: 'FRM-001', name: 'James Mwangi', phone: '+254722100200', county: 'Nakuru', subCounty: 'Nakuru East' },
    { code: 'FRM-002', name: 'Grace Wanjiku', phone: '+254733200300', county: 'Kiambu', subCounty: 'Limuru' },
    { code: 'FRM-003', name: 'Peter Ochieng', phone: '+254711300400', county: 'Kisumu', subCounty: 'Kisumu East' },
    { code: 'FRM-004', name: 'Mary Akinyi', phone: '+254700400500', county: 'Homa Bay', subCounty: 'Rangwe' },
    { code: 'FRM-005', name: 'David Kipchoge', phone: '+254722500600', county: 'Uasin Gishu', subCounty: 'Ainabkoi' },
  ];
  for (const f of farmers) {
    await p.$executeRawUnsafe(
      `INSERT INTO "farmers" (code, name, phone, county, "subCounty") VALUES ($1, $2, $3, $4, $5)`,
      f.code, f.name, f.phone, f.county, f.subCounty
    );
  }
  console.log('Farmers: 5');

  // 2. Animals
  const animals = [
    { name: 'Nuru', type: 'Cattle', breed: 'Friesian', health: 'Healthy', county: 'Nakuru', owner: 'James Mwangi', lat: -0.3031, lng: 36.08, farmerId: 1, userId: 1 },
    { name: 'Penda', type: 'Cattle', breed: 'Ayrshire', health: 'Healthy', county: 'Nakuru', owner: 'James Mwangi', lat: -0.305, lng: 36.082, farmerId: 1, userId: 1 },
    { name: 'Baraka', type: 'Goat', breed: 'Galla', health: 'Sick', county: 'Kiambu', owner: 'Grace Wanjiku', lat: -1.0833, lng: 36.65, farmerId: 2, userId: 1 },
    { name: 'Shujaa', type: 'Goat', breed: 'Boer', health: 'Healthy', county: 'Kiambu', owner: 'Grace Wanjiku', lat: -1.085, lng: 36.652, farmerId: 2, userId: 1 },
    { name: 'Malaika', type: 'Sheep', breed: 'Dorper', health: 'Under Treatment', county: 'Kisumu', owner: 'Peter Ochieng', lat: -0.1, lng: 34.75, farmerId: 3, userId: 1 },
    { name: 'Tumaini', type: 'Sheep', breed: 'Red Maasai', health: 'Healthy', county: 'Kisumu', owner: 'Peter Ochieng', lat: -0.102, lng: 34.752, farmerId: 3, userId: 1 },
    { name: 'Jabali', type: 'Cattle', breed: 'Hereford', health: 'Healthy', county: 'Uasin Gishu', owner: 'David Kipchoge', lat: 0.33, lng: 35.57, farmerId: 5, userId: 1 },
    { name: 'Amani', type: 'Pig', breed: 'Large White', health: 'Healthy', county: 'Homa Bay', owner: 'Mary Akinyi', lat: -0.52, lng: 34.47, farmerId: 4, userId: 1 },
    { name: 'Zawadi', type: 'Chicken', breed: 'Kienyeji', health: 'Healthy', county: 'Nakuru', owner: 'James Mwangi', lat: -0.307, lng: 36.084, farmerId: 1, userId: 1 },
    { name: 'Hekima', type: 'Camel', breed: 'Rendille', health: 'Recovered', county: 'Marsabit', owner: 'David Kipchoge', lat: 2.33, lng: 37.97, farmerId: 5, userId: 1 },
  ];
  for (const a of animals) {
    await p.$executeRawUnsafe(
      `INSERT INTO "animals" (name, type, breed, health, county, owner, lat, lng, "farmerId", "userId") VALUES ($1, $2::"AnimalType", $3, $4::"HealthStatus", $5, $6, $7, $8, $9, $10)`,
      a.name, a.type, a.breed, a.health, a.county, a.owner, a.lat, a.lng, a.farmerId, a.userId
    );
  }
  console.log('Animals: 10');

  // 3. Vaccinations
  await p.$executeRawUnsafe(`INSERT INTO "vaccinations" (type, date, "batchNumber", veterinarian, "nextDueDate", "animalId") VALUES ('FMD', NOW() - INTERVAL '30 days', 'VAC-2026-001', 'Dr. Kariuki', NOW() + INTERVAL '90 days', 1)`);
  await p.$executeRawUnsafe(`INSERT INTO "vaccinations" (type, date, "batchNumber", veterinarian, "nextDueDate", "animalId") VALUES ('Anthrax', NOW() - INTERVAL '60 days', 'VAC-2026-002', 'Dr. Otieno', NOW() + INTERVAL '30 days', 3)`);
  await p.$executeRawUnsafe(`INSERT INTO "vaccinations" (type, date, "batchNumber", veterinarian, "animalId") VALUES ('PPR', NOW() - INTERVAL '15 days', 'VAC-2026-003', 'Dr. Kariuki', 5)`);
  await p.$executeRawUnsafe(`INSERT INTO "vaccinations" (type, date, "batchNumber", veterinarian, "nextDueDate", "animalId") VALUES ('Newcastle', NOW() - INTERVAL '10 days', 'VAC-2026-004', 'Dr. Wanjiku', NOW() + INTERVAL '50 days', 9)`);
  await p.$executeRawUnsafe(`INSERT INTO "vaccinations" (type, date, "batchNumber", veterinarian, "nextDueDate", "animalId") VALUES ('Brucellosis', NOW() - INTERVAL '45 days', 'VAC-2026-005', 'Dr. Otieno', NOW() + INTERVAL '45 days', 7)`);
  console.log('Vaccinations: 5');

  // 4. Diseases
  await p.$executeRawUnsafe(`INSERT INTO "diseases" (name, "reportedDate", status, treatment, "treatedBy", "animalId") VALUES ('East Coast Fever', NOW() - INTERVAL '5 days', 'under_treatment', 'Antibiotics + support therapy', 'Dr. Kariuki', 3)`);
  await p.$executeRawUnsafe(`INSERT INTO "diseases" (name, "reportedDate", status, treatment, "treatedBy", "animalId") VALUES ('Foot Rot', NOW() - INTERVAL '20 days', 'resolved', 'Zinc sulphate footbath', 'Dr. Otieno', 5)`);
  console.log('Diseases: 2');

  // 5. Mortalities
  await p.$executeRawUnsafe(`INSERT INTO "mortalities" ("animalId", cause, "diseaseName", "reportedBy", notes) VALUES (8, 'Disease complications', 'African Swine Fever', 'Mary Akinyi', 'Isolated immediately, others vaccinated')`);
  console.log('Mortalities: 1');

  // 6. Weight records
  await p.$executeRawUnsafe(`INSERT INTO "weight_records" ("animalId", weight, unit, "recordedAt", "recordedBy", notes) VALUES (1, 450, 'kg', NOW() - INTERVAL '7 days', 'James Mwangi', 'Healthy weight gain')`);
  await p.$executeRawUnsafe(`INSERT INTO "weight_records" ("animalId", weight, unit, "recordedAt", "recordedBy", notes) VALUES (1, 465, 'kg', NOW(), 'James Mwangi', 'Steady growth')`);
  await p.$executeRawUnsafe(`INSERT INTO "weight_records" ("animalId", weight, unit, "recordedAt", "recordedBy", notes) VALUES (7, 520, 'kg', NOW() - INTERVAL '3 days', 'David Kipchoge', 'Above average')`);
  console.log('Weight Records: 3');

  // 7. Outbreaks
  await p.$executeRawUnsafe(`INSERT INTO "outbreaks" ("diseaseType", "affectedAnimals", "suspectedAnimals", county, lat, lng, "reportedBy", status, symptoms, actions) VALUES ('FMD', 12, 30, 'Nakuru', -0.3031, 36.08, 'James Mwangi', 'active', '["lameness","drooling","fever"]'::json, '["quarantine","vaccination","movement restrictions"]'::json)`);
  await p.$executeRawUnsafe(`INSERT INTO "outbreaks" ("diseaseType", "affectedAnimals", "suspectedAnimals", county, lat, lng, "reportedBy", status, symptoms, actions) VALUES ('Anthrax', 3, 8, 'Kisumu', -0.1, 34.75, 'Peter Ochieng', 'contained', '["sudden death","bloody discharge"]'::json, '["burial","vaccination","surveillance"]'::json)`);
  console.log('Outbreaks: 2');

  // 8. Disease risks
  await p.$executeRawUnsafe(`INSERT INTO "disease_risks" (county, "diseaseType", "riskLevel", confidence, factors) VALUES ('Nakuru', 'FMD', 'high', 0.85, '["outbreak proximity","high animal density","wet season"]'::json) ON CONFLICT ("county", "diseaseType") DO UPDATE SET "riskLevel" = 'high', confidence = 0.85`);
  await p.$executeRawUnsafe(`INSERT INTO "disease_risks" (county, "diseaseType", "riskLevel", confidence, factors) VALUES ('Kisumu', 'Anthrax', 'medium', 0.65, '["past outbreaks","soil conditions"]'::json) ON CONFLICT ("county", "diseaseType") DO UPDATE SET "riskLevel" = 'medium', confidence = 0.65`);
  await p.$executeRawUnsafe(`INSERT INTO "disease_risks" (county, "diseaseType", "riskLevel", confidence, factors) VALUES ('Kiambu', 'FMD', 'low', 0.3, '["good vaccination coverage"]'::json) ON CONFLICT ("county", "diseaseType") DO UPDATE SET "riskLevel" = 'low', confidence = 0.3`);
  console.log('Disease Risks: 3');

  // Verify
  const counts = await p.$queryRawUnsafe(`
    SELECT
      (SELECT count(*) FROM "farmers") as farmers,
      (SELECT count(*) FROM "animals") as animals,
      (SELECT count(*) FROM "vaccinations") as vaccinations,
      (SELECT count(*) FROM "diseases") as diseases,
      (SELECT count(*) FROM "mortalities") as mortalities,
      (SELECT count(*) FROM "weight_records") as weights,
      (SELECT count(*) FROM "outbreaks") as outbreaks,
      (SELECT count(*) FROM "disease_risks") as risks
  `);
  console.log('\n--- Counts ---');
  console.log(JSON.stringify(counts[0]));

  await p.$disconnect();
  console.log('\nDone!');
}

seed().catch(e => { console.error(e); process.exit(1); });
