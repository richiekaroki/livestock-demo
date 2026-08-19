// src/ref/animalTypes.ts — reference data for the supported livestock types.
// Breeds are the common breeds raised in Kenya; commonNames feed the demo
// data generator so generated animals get locally-flavoured names.

import type { AnimalType, HealthStatus } from "../types";

export interface AnimalTypeInfo {
  type: AnimalType;
  breeds: string[];
  /** Candidate names for demo animals of this type. */
  commonNames: string[];
}

export const ANIMAL_TYPES: AnimalTypeInfo[] = [
  {
    type: "Cattle",
    breeds: [
      "Friesian",
      "Ayrshire",
      "Guernsey",
      "Jersey",
      "Boran",
      "Sahiwal",
      "Zebu",
      "Aberdeen Angus",
    ],
    commonNames: [
      "Shujaa",
      "Milo",
      "Zuri",
      "Binti",
      "Dume",
      "Simba",
      "Nyota",
      "Malaika",
      "Farasi",
      "Kifaru",
      "Mwamba",
      "Jike",
    ],
  },
  {
    type: "Goat",
    breeds: [
      "Galla",
      "Small East African",
      "Boer",
      "Alpine",
      "Toggenburg",
    ],
    commonNames: [
      "Jembe",
      "Mbuzi",
      "Kombo",
      "Doto",
      "Halisi",
      "Upendo",
      "Paka",
      "Njoo",
    ],
  },
  {
    type: "Sheep",
    breeds: ["Dorper", "Red Maasai", "Merino", "Hampshire Down"],
    commonNames: [
      "Kondoo",
      "Nyasi",
      "Tumbo",
      "Mrembo",
      "Penda",
      "Macho",
      "Taji",
    ],
  },
  {
    type: "Camel",
    breeds: ["Dromedary", "Somali", "Turkana"],
    commonNames: [
      "Daktari",
      "Mfalme",
      "Wingu",
      "Sukari",
      "Jamhuri",
      "Nyota",
      "Safari",
    ],
  },
  {
    type: "Pig",
    breeds: ["Large White", "Landrace", "Duroc", "Hampshire"],
    commonNames: ["Porky", "Nguruwe", "Tambua", "Bakuli", "Chips"],
  },
  {
    type: "Chicken",
    breeds: ["Indigenous Kienyeji", "Broiler", "Layer", "Rhode Island Red"],
    commonNames: ["Kuku", "Clucky", "Mchezo", "Jogoo", "Zawadi", "Tamba"],
  },
];

/** All livestock types, derived from the reference table. */
export const LIVESTOCK_TYPES: AnimalType[] = ANIMAL_TYPES.map((t) => t.type);

/** The four health statuses accepted across the system. */
export const HEALTH_STATUSES: HealthStatus[] = [
  "Healthy",
  "Sick",
  "Under Treatment",
  "Recovered",
];

export function getAnimalTypeInfo(type: AnimalType): AnimalTypeInfo {
  return ANIMAL_TYPES.find((t) => t.type === type) ?? ANIMAL_TYPES[0];
}

export function getBreedsForType(type: AnimalType): string[] {
  return getAnimalTypeInfo(type).breeds;
}