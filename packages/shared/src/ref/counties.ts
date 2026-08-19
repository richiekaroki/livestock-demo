// src/ref/counties.ts — Kenya administrative reference data (47 counties).
// Source: IEBC county codes with sub-counties; centroid coordinates from
// Mondieki/kenya-counties-subcounties (MIT). Light cleanup applied.

export interface County {
  /** IEBC county code (1-47). */
  code: number;
  name: string;
  capital: string;
  subCounties: string[];
  /** Centroid latitude (WGS84). */
  lat: number;
  /** Centroid longitude (WGS84). */
  lng: number;
}

/** All 47 counties, ordered by IEBC code. */
export const KENYA_COUNTIES: County[] = [
  {
    code: 1,
    name: "Mombasa",
    capital: "Mombasa City",
    subCounties: [
      "Changamwe",
    "Jomvu",
    "Kisauni",
    "Likoni",
    "Mvita",
    "Nyali"
    ],
    lat: -4.039,
    lng: 39.6484,
  },

  {
    code: 2,
    name: "Kwale",
    capital: "Kwale",
    subCounties: [
      "Kinango",
    "Lungalunga",
    "Msambweni",
    "Mutuga"
    ],
    lat: -4.1836,
    lng: 39.1051,
  },

  {
    code: 3,
    name: "Kilifi",
    capital: "Kilifi",
    subCounties: [
      "Ganze",
    "Kaloleni",
    "Kilifi north",
    "Kilifi south",
    "Magarini",
    "Malindi",
    "Rabai"
    ],
    lat: -3.1507,
    lng: 39.6751,
  },

  {
    code: 4,
    name: "Tana River",
    capital: "Hola",
    subCounties: [
      "Bura",
    "Galole",
    "Garsen"
    ],
    lat: -1.5365,
    lng: 39.5508,
  },

  {
    code: 5,
    name: "Lamu",
    capital: "Lamu",
    subCounties: [
      "Lamu East",
    "Lamu West"
    ],
    lat: -2.0645,
    lng: 40.7281,
  },

  {
    code: 6,
    name: "Taita-Taveta",
    capital: "Voi",
    subCounties: [
      "Mwatate",
    "Taveta",
    "Voi",
    "Wundanyi"
    ],
    lat: -3.4178,
    lng: 38.3671,
  },

  {
    code: 7,
    name: "Garissa",
    capital: "Garissa",
    subCounties: [
      "Daadab",
    "Fafi",
    "Garissa",
    "Hulugho",
    "Ijara",
    "Lagdera balambala"
    ],
    lat: -0.5236,
    lng: 40.3564,
  },

  {
    code: 8,
    name: "Wajir",
    capital: "Wajir",
    subCounties: [
      "Eldas",
    "Tarbaj",
    "Wajir East",
    "Wajir North",
    "Wajir South",
    "Wajir West"
    ],
    lat: 1.9394,
    lng: 40.0245,
  },

  {
    code: 9,
    name: "Mandera",
    capital: "Mandera",
    subCounties: [
      "Banissa",
    "Lafey",
    "Mandera East",
    "Mandera North",
    "Mandera South",
    "Mandera West"
    ],
    lat: 3.2285,
    lng: 40.7056,
  },

  {
    code: 10,
    name: "Marsabit",
    capital: "Marsabit",
    subCounties: [
      "Laisamis",
    "Moyale",
    "North hor",
    "Saku"
    ],
    lat: 2.858,
    lng: 37.7155,
  },

  {
    code: 11,
    name: "Isiolo",
    capital: "Isiolo",
    subCounties: [
      "Central",
    "Garba tula",
    "Kina",
    "Merit",
    "Oldonyiro",
    "Sericho"
    ],
    lat: 1.0061,
    lng: 38.7479,
  },

  {
    code: 12,
    name: "Meru",
    capital: "Meru",
    subCounties: [
      "Buuri",
    "Igembe central",
    "Igembe north",
    "Igembe south",
    "Imenti central",
    "Imenti north",
    "Imenti south",
    "Tigania east",
    "Tigania west"
    ],
    lat: 0.2255,
    lng: 37.7773,
  },

  {
    code: 13,
    name: "Tharaka-Nithi",
    capital: "Chuka",
    subCounties: [
      "Chuka",
    "Igambang'ombe",
    "Maara",
    "Muthambi",
    "Tharak north",
    "Tharaka south"
    ],
    lat: -0.1937,
    lng: 37.9614,
  },

  {
    code: 14,
    name: "Embu",
    capital: "Embu",
    subCounties: [
      "Manyatta",
    "Mbeere north",
    "Mbeere south",
    "Runyenjes"
    ],
    lat: -0.5359,
    lng: 37.6653,
  },

  {
    code: 15,
    name: "Kitui",
    capital: "Kitui",
    subCounties: [
      "Ikutha",
    "Katulani",
    "Kisasi",
    "Kitui central",
    "Kitui west",
    "Lower yatta",
    "Matiyani",
    "Migwani",
    "Mutitu",
    "Mutomo",
    "Muumonikyusu",
    "Mwingi central",
    "Mwingi east",
    "Nzambani",
    "Tseikuru"
    ],
    lat: -1.5642,
    lng: 38.3728,
  },

  {
    code: 16,
    name: "Machakos",
    capital: "Machakos",
    subCounties: [
      "Kathiani",
    "Machakos town",
    "Masinga",
    "Matungulu",
    "Mavoko",
    "Mwala",
    "Yatta"
    ],
    lat: -1.279,
    lng: 37.3953,
  },

  {
    code: 17,
    name: "Makueni",
    capital: "Wote",
    subCounties: [
      "Kaiti",
    "Kibwezi West",
    "Kibwezi east",
    "Kilome",
    "Makueni",
    "Mbooni"
    ],
    lat: -2.2571,
    lng: 37.8772,
  },

  {
    code: 18,
    name: "Nyandarua",
    capital: "Ol Kalou",
    subCounties: [
      "Kinangop",
    "Kipipiri",
    "Ndaragwa",
    "Ol Kalou",
    "Ol joro orok"
    ],
    lat: -0.3916,
    lng: 36.4978,
  },

  {
    code: 19,
    name: "Nyeri",
    capital: "Nyeri",
    subCounties: [
      "Kieni east",
    "Kieni west",
    "Mathira east",
    "Mathira west",
    "Mukurwe-ini",
    "Nyeri town",
    "Othaya",
    "Tetu"
    ],
    lat: -0.3212,
    lng: 36.9296,
  },

  {
    code: 20,
    name: "Kirinyaga",
    capital: "Kerugoya/Kutus",
    subCounties: [
      "Kirinyaga central",
    "Kirinyaga east",
    "Kirinyaga west",
    "Mwea east",
    "Mwea west"
    ],
    lat: -0.4689,
    lng: 37.3028,
  },

  {
    code: 21,
    name: "Murang'a",
    capital: "Murang'a",
    subCounties: [
      "Gatanga",
    "Kahuro",
    "Kandara",
    "Kangema",
    "Kigumo",
    "Kiharu",
    "Mathioya",
    "Muranga south"
    ],
    lat: -0.8309,
    lng: 37.0049,
  },

  {
    code: 22,
    name: "Kiambu",
    capital: "Kiambu",
    subCounties: [
      "Gatundu north",
    "Gatundu south",
    "Githunguri",
    "Juja",
    "Kabete",
    "Kiambaa",
    "Kiambu",
    "Kikuyu",
    "Limuru",
    "Ruiru",
    "Thika town",
    "lari"
    ],
    lat: -1.0321,
    lng: 36.8157,
  },

  {
    code: 23,
    name: "Turkana",
    capital: "Lodwar",
    subCounties: [
      "Loima",
    "Turkana central",
    "Turkana east",
    "Turkana north",
    "Turkana south"
    ],
    lat: 2.7656,
    lng: 35.5977,
  },

  {
    code: 24,
    name: "West Pokot",
    capital: "Kapenguria",
    subCounties: [
      "Central Pokot",
    "North Pokot",
    "Pokot South",
    "West Pokot"
    ],
    lat: 1.8799,
    lng: 35.2106,
  },

  {
    code: 25,
    name: "Samburu",
    capital: "Maralal",
    subCounties: [
      "Samburu east",
    "Samburu north",
    "Samburu west"
    ],
    lat: 1.5394,
    lng: 36.9422,
  },

  {
    code: 26,
    name: "Trans-Nzoia",
    capital: "Kitale",
    subCounties: [
      "Cherangany",
    "Endebess",
    "Kiminini",
    "Kwanza",
    "Saboti"
    ],
    lat: 1.0455,
    lng: 34.979,
  },

  {
    code: 27,
    name: "Uasin Gishu",
    capital: "Eldoret",
    subCounties: [
      "Ainabkoi",
    "Kapseret",
    "Kesses",
    "Moiben",
    "Soy",
    "Turbo"
    ],
    lat: 0.4772,
    lng: 35.3051,
  },

  {
    code: 28,
    name: "Elgeyo-Marakwet",
    capital: "Iten",
    subCounties: [
      "Keiyo north",
    "Keiyo south",
    "Marakwet east",
    "Marakwet west"
    ],
    lat: 0.7422,
    lng: 35.5618,
  },

  {
    code: 29,
    name: "Nandi",
    capital: "Kapsabet",
    subCounties: [
      "Aldai",
    "Chesumei",
    "Emgwen",
    "Mosop",
    "Nandi Hills",
    "Tindiret"
    ],
    lat: 0.2254,
    lng: 35.1245,
  },

  {
    code: 30,
    name: "Baringo",
    capital: "Kabarnet",
    subCounties: [
      "Baringo central",
    "Baringo north",
    "Baringo south",
    "Eldama ravine",
    "Mogotio",
    "Tiaty"
    ],
    lat: 0.7244,
    lng: 36.0201,
  },

  {
    code: 31,
    name: "Laikipia",
    capital: "Rumuruti",
    subCounties: [
      "Laikipia central",
    "Laikipia east",
    "Laikipia north",
    "Laikipia west",
    "Nyahururu"
    ],
    lat: 0.2858,
    lng: 36.8258,
  },

  {
    code: 32,
    name: "Nakuru",
    capital: "Nakuru",
    subCounties: [
      "Bahati",
    "Gilgil",
    "Kuresoi north",
    "Kuresoi south",
    "Molo",
    "Naivasha",
    "Nakuru town east",
    "Nakuru town west",
    "Njoro",
    "Rongai",
    "Subukia"
    ],
    lat: -0.4598,
    lng: 36.1008,
  },

  {
    code: 33,
    name: "Narok",
    capital: "Narok",
    subCounties: [
      "Narok east",
    "Narok north",
    "Narok south",
    "Narok west",
    "Transmara east",
    "Transmara west"
    ],
    lat: -1.2779,
    lng: 35.4774,
  },

  {
    code: 34,
    name: "Kajiado",
    capital: "Kajiado",
    subCounties: [
      "Isinya",
    "Kajiado Central",
    "Kajiado North",
    "Loitokitok",
    "Mashuuru"
    ],
    lat: -2.1217,
    lng: 36.7863,
  },

  {
    code: 35,
    name: "Kericho",
    capital: "Kericho",
    subCounties: [
      "Ainamoi",
    "Belgut",
    "Bureti",
    "Kipkelion east",
    "Kipkelion west",
    "Soin sigowet"
    ],
    lat: -0.321,
    lng: 35.2261,
  },

  {
    code: 36,
    name: "Bomet",
    capital: "Bomet",
    subCounties: [
      "Bomet central",
    "Bomet east",
    "Chepalungu",
    "Konoin",
    "Sotik"
    ],
    lat: -0.7196,
    lng: 35.2396,
  },

  {
    code: 37,
    name: "Kakamega",
    capital: "Kakamega",
    subCounties: [
      "Butere",
    "Kakamega central",
    "Kakamega east",
    "Kakamega north",
    "Kakamega south",
    "Khwisero",
    "Lugari",
    "Lukuyani",
    "Lurambi",
    "Matete",
    "Mumias",
    "Mutungu",
    "Navakholo"
    ],
    lat: 0.4957,
    lng: 34.8015,
  },

  {
    code: 38,
    name: "Vihiga",
    capital: "Vihiga",
    subCounties: [
      "Emuhaya",
    "Hamisi",
    "Luanda",
    "Sabatia",
    "vihiga"
    ],
    lat: 0.0831,
    lng: 34.708,
  },

  {
    code: 39,
    name: "Bungoma",
    capital: "Bungoma",
    subCounties: [
      "Bumula",
    "Kabuchai",
    "Kanduyi",
    "Kimilili",
    "Mt Elgon",
    "Sirisia",
    "Tongaren",
    "Webuye east",
    "Webuye west"
    ],
    lat: 0.7829,
    lng: 34.7192,
  },

  {
    code: 40,
    name: "Busia",
    capital: "Busia",
    subCounties: [
      "Budalangi",
    "Butula",
    "Funyula",
    "Nambale",
    "Teso North",
    "Teso South"
    ],
    lat: 0.3712,
    lng: 34.2648,
  },

  {
    code: 41,
    name: "Siaya",
    capital: "Siaya",
    subCounties: [
      "Alego usonga",
    "Bondo",
    "Gem",
    "Rarieda",
    "Ugenya",
    "Ugunja"
    ],
    lat: -0.0604,
    lng: 34.2001,
  },

  {
    code: 42,
    name: "Kisumu",
    capital: "Kisumu",
    subCounties: [
      "Kisumu central",
    "Kisumu east",
    "Kisumu west",
    "Muhoroni",
    "Nyakach",
    "Nyando",
    "Seme"
    ],
    lat: -0.1971,
    lng: 34.7779,
  },

  {
    code: 43,
    name: "Homa Bay",
    capital: "Homa Bay",
    subCounties: [
      "Homabay town",
    "Kabondo",
    "Karachwonyo",
    "Kasipul",
    "Mbita",
    "Ndhiwa",
    "Rangwe",
    "Suba"
    ],
    lat: -0.564,
    lng: 34.3188,
  },

  {
    code: 44,
    name: "Migori",
    capital: "Migori",
    subCounties: [
      "Awendo",
    "Kuria east",
    "Kuria west",
    "Mabera",
    "Ntimaru",
    "Rongo",
    "Suna east",
    "Suna west",
    "Uriri"
    ],
    lat: -1.0212,
    lng: 34.3096,
  },

  {
    code: 45,
    name: "Kisii",
    capital: "Kisii",
    subCounties: [
      "Kitutu Central",
    "Kitutu Chache North",
    "Kitutu Chache South",
    "Nyaribari Chache",
    "Nyaribari Masaba",
    "Bobasi",
    "Bomachoge Borabu",
    "Bomachoge Chache",
    "South Mugirango"
    ],
    lat: -0.7389,
    lng: 34.754,
  },

  {
    code: 46,
    name: "Nyamira",
    capital: "Nyamira",
    subCounties: [
      "Borabu",
    "Manga",
    "Masaba north",
    "Nyamira north",
    "Nyamira south"
    ],
    lat: -0.6523,
    lng: 34.9341,
  },

  {
    code: 47,
    name: "Nairobi",
    capital: "Nairobi City",
    subCounties: [
      "Dagoretti North Sub County",
    "Dagoretti South Sub County",
    "Embakasi Central Sub Count",
    "Embakasi East Sub County",
    "Embakasi North Sub County",
    "Embakasi South Sub County",
    "Embakasi West Sub County",
    "Kamukunji Sub County",
    "Kasarani Sub County",
    "Kibra Sub County",
    "Langata Sub County",
    "Makadara Sub County",
    "Mathare Sub County",
    "Roysambu Sub County",
    "Ruaraka Sub County",
    "Starehe Sub County",
    "Westlands Sub County"
    ],
    lat: -1.3032,
    lng: 36.8261,
  }
];

export function getCountyByCode(code: number): County | undefined {
  return KENYA_COUNTIES.find((c) => c.code === code);
}

export function getCountyByName(name: string): County | undefined {
  return KENYA_COUNTIES.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase(),
  );
}
