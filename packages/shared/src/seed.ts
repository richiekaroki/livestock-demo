// src/seed.ts — default demo dataset.
//
// The demo dataset is now generated from reference data (counties, animal
// types/breeds, name pools) via a deterministic PRNG instead of being
// hand-written. Tune the count/seed to reshape the whole demo.

import { generateDemoData } from "./generator";
import type { Farmer, Livestock } from "./types";

export const DEFAULT_DEMO_SEED = 42;
export const DEFAULT_DEMO_ANIMAL_COUNT = 23;

const demo = generateDemoData({
  animalCount: DEFAULT_DEMO_ANIMAL_COUNT,
  seed: DEFAULT_DEMO_SEED,
});

/** Farmers in the default demo dataset. */
export const seedFarmers: Farmer[] = demo.farmers;

/** Animals in the default demo dataset. */
export const seedLivestock: Livestock[] = demo.animals;
