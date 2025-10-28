// src/data/livestockData.ts

export const livestockData = [
  {
    // Core Identification
    id: "KE-001-NAK-0001",
    type: "Cattle",
    breed: "Friesian",

    // Health & Status
    health: "Healthy",
    status: "Active",

    // Location & Ownership
    location: "Nakuru",
    owner: "John Njoroge",
    lat: -0.3031,
    lng: 36.08,

    // Dates
    registrationDate: "2025-10-20",
    dateOfBirth: "2022-05-15",
    lastVaccination: "2025-09-15",

    // Physical Attributes
    age: 3,
    weight: 450,
    gender: "Female",

    // Production Data
    production: {
      milkYield: 25,
      growthRate: 1.2,
      lastCalving: "2025-03-10",
    },

    // Medical History
    vaccinations: ["Brucellosis", "Foot and Mouth"],
    treatments: ["Deworming - 2025-08-20"],
  },
  {
    id: "KE-001-NAK-0002",
    type: "Goat",
    breed: "Boer",
    health: "Sick",
    status: "Active",
    location: "Naivasha",
    owner: "Mary Wanjiku",
    lat: -0.7159,
    lng: 36.4351,
    registrationDate: "2025-10-18",
    dateOfBirth: "2023-02-10",
    age: 2,
    weight: 65,
    gender: "Male",
    production: {
      milkYield: 2,
      growthRate: 0.8,
    },
    vaccinations: ["PPR"],
    treatments: ["Antibiotics - 2025-10-15"],
  },
  {
    id: "KE-001-KIS-0003",
    type: "Sheep",
    breed: "Dorper",
    health: "Healthy",
    status: "Active",
    location: "Kisumu",
    owner: "Peter Omondi",
    lat: -0.1022,
    lng: 34.7617,
    registrationDate: "2025-10-19",
    dateOfBirth: "2023-08-20",
    age: 2,
    weight: 55,
    gender: "Female",
    production: {
      growthRate: 0.6,
    },
    vaccinations: ["Sheep Pox"],
    treatments: [],
  },
  {
    id: "KE-001-NYR-0004",
    type: "Cattle",
    breed: "Borana",
    health: "Recovering",
    status: "Active",
    location: "Nyeri",
    owner: "James Kariuki",
    lat: -0.4201,
    lng: 36.9476,
    registrationDate: "2025-10-17",
    dateOfBirth: "2021-11-05",
    age: 4,
    weight: 380,
    gender: "Male",
    production: {
      growthRate: 0.9,
    },
    vaccinations: ["Foot and Mouth", "LSD"],
    treatments: ["Wound Treatment - 2025-10-10"],
  },
];
