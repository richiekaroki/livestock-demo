// src/generator.ts — deterministic demo data generation.
//
// Replaces the previously hand-written seed data with a seeded PRNG so the
// whole dataset is reproducible, data-driven, and scalable (just change the
// count). Farmers are generated with both a realistic name and an anonymised
// code (FM-0001, FM-0002, ...) so the demo can be referenced without exposing
// personal details.

import { ANIMAL_TYPES } from "./ref/animalTypes";
import { KENYA_COUNTIES } from "./ref/counties";
import { FARMER_FIRST_NAMES, FARMER_LAST_NAMES } from "./ref/farmerNames";
import type { Farmer, HealthStatus, Livestock } from "./types";

export interface DemoDataOptions {
  /** Number of demo animals to generate. Defaults to 23. */
  animalCount?: number;
  /** Number of demo farmers to generate. Defaults to ceil(animalCount / 3). */
  farmerCount?: number;
  /** PRNG seed. Defaults to 42. */
  seed?: number;
}

export interface DemoDataSet {
  farmers: Farmer[];
  animals: Livestock[];
}

/** Small deterministic PRNG (mulberry32). Same seed => same sequence. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Draws every item of `pool` in a fresh shuffled order, wrapping if needed. */
function createDrawer<T>(rng: () => number, pool: readonly T[]): () => T {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let index = 0;
  return () => {
    if (index >= shuffled.length) index = 0;
    return shuffled[index++];
  };
}

const BASE_DATE = Date.UTC(2026, 0, 15, 8, 30, 0);
const JITTER = 0.3;

function randomHealth(rng: () => number): HealthStatus {
  const roll = rng();
  if (roll < 0.5) return "Healthy";
  if (roll < 0.65) return "Sick";
  if (roll < 0.8) return "Under Treatment";
  return "Recovered";
}

function randomPhone(rng: () => number): string {
  const digits = String(Math.floor(rng() * 100_000_000)).padStart(8, "0");
  return `07${digits}`;
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function generateDemoData(options: DemoDataOptions = {}): DemoDataSet {
  const animalCount = options.animalCount ?? 23;
  const farmerCount =
    options.farmerCount ?? Math.max(6, Math.ceil(animalCount / 3));
  const rng = mulberry32(options.seed ?? 42);

  const farmers: Farmer[] = [];
  for (let i = 0; i < farmerCount; i++) {
    const county = pick(rng, KENYA_COUNTIES);
    farmers.push({
      id: i + 1,
      code: `FM-${String(i + 1).padStart(4, "0")}`,
      name: `${pick(rng, FARMER_FIRST_NAMES)} ${pick(rng, FARMER_LAST_NAMES)}`,
      phone: randomPhone(rng),
      county: county.name,
      subCounty: pick(rng, county.subCounties),
    });
  }

  const drawers = new Map(
    ANIMAL_TYPES.map((t) => [t.type, createDrawer(rng, t.commonNames)]),
  );

  const animals: Livestock[] = [];
  for (let i = 0; i < animalCount; i++) {
    const info = ANIMAL_TYPES[i % ANIMAL_TYPES.length];
    const farmer = pick(rng, farmers);
    const center =
      KENYA_COUNTIES.find((c) => c.name === farmer.county) ?? KENYA_COUNTIES[0];
    const jitter = () => (rng() - 0.5) * 2 * JITTER;
    const drawName = drawers.get(info.type);
    animals.push({
      id: i + 1,
      name: drawName ? drawName() : `Animal ${i + 1}`,
      type: info.type,
      breed: pick(rng, info.breeds),
      health: randomHealth(rng),
      county: farmer.county,
      owner: farmer.name,
      farmerId: farmer.id,
      lat: round(center.lat + jitter()),
      lng: round(center.lng + jitter()),
      createdAt: new Date(BASE_DATE - i * 86_400_000).toISOString(),
    });
  }

  return { farmers, animals };
}

/** Default number of farmers when generating a demo dataset. */
export function demoFarmerCountFor(animalCount: number): number {
  return Math.max(6, Math.ceil(animalCount / 3));
}