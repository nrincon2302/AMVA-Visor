const DEFAULT_TRIPS = 1_000_000;

const WEIGHTED_ESTRATO = [
  { value: 1, weight: 18 },
  { value: 2, weight: 24 },
  { value: 3, weight: 26 },
  { value: 4, weight: 16 },
  { value: 5, weight: 10 },
  { value: 6, weight: 6 },
];

const GENDERS_WEIGHTED = [
  { value: "Hombre", weight: 54 },
  { value: "Mujer", weight: 46 },
];

const AGE_BUCKET_OPTIONS = [
  { value: "5-11", weight: 6 },
  { value: "12-17", weight: 9 },
  { value: "18-25", weight: 18 },
  { value: "26-35", weight: 22 },
  { value: "36-45", weight: 17 },
  { value: "46-60", weight: 16 },
  { value: "60+", weight: 12 },
];
const AGE_BUCKETS = AGE_BUCKET_OPTIONS.map((item) => item.value);

const EDUCATION_OPTIONS = [
  { value: "Ninguno", weight: 4 },
  { value: "Primaria", weight: 11 },
  { value: "Noveno Grado", weight: 13 },
  { value: "Bachillerato", weight: 17 },
  { value: "Educación No formal", weight: 6 },
  { value: "Técnico", weight: 14 },
  { value: "Tecnológico", weight: 10 },
  { value: "Universitario", weight: 18 },
  { value: "Posgrado", weight: 7 },
];

const MODE_OPTIONS = [
  { value: "Metro", weight: 20 },
  { value: "Cable", weight: 6 },
  { value: "Metroplús", weight: 8 },
  { value: "Tranvía", weight: 4 },
  { value: "Bus urbano/metropolitano", weight: 22 },
  { value: "Ruta integrada/Alimentador C3-C6", weight: 10 },
  { value: "Bus intermunicipal", weight: 6 },
  { value: "Taxi individual", weight: 5 },
  { value: "Transporte informal en calle", weight: 2 },
  { value: "Auto particular (conductor)", weight: 7 },
  { value: "Auto particular (acompañante)", weight: 3 },
  { value: "Moto (conductor)", weight: 10 },
  { value: "Moto (acompañante)", weight: 4 },
  { value: "Bicicleta propia", weight: 5 },
  { value: "A pie", weight: 9 },
  { value: "Plataforma (Uber/Cabify/etc.)", weight: 4 },
];
const MODES = MODE_OPTIONS.map((item) => item.value);

const VEHICLE_BUCKETS = [
  { value: "Sin vehículo", weight: 35 },
  { value: "1 vehículo", weight: 45 },
  { value: "2+ vehículos", weight: 20 },
];

const VEHICLE_TYPES = [
  { value: "Automóvil", weight: 32 },
  { value: "Moto", weight: 30 },
  { value: "Bicicleta", weight: 14 },
  { value: "Camioneta", weight: 12 },
  { value: "Otro", weight: 12 },
];

const VEHICLE_MODELS = [
  { value: "Menor de 5 años", weight: 22 },
  { value: "Entre 5 y 10 años", weight: 24 },
  { value: "(En blanco)", weight: 10 },
  { value: "Entre 10 y 15 años", weight: 22 },
  { value: "Más de 15 años", weight: 22 },
];

const OCCUPATIONS = [
  "Ama de casa",
  "Jubilado",
  "Estudiante",
  "Trabajador independiente",
  "Trabajador dependiente o empleado",
  "Desempleado",
  "Jubilado y estudiante",
  "Jubilado y trabajador",
  "Ama de casa y estudiante",
  "Trabajador y estudiante",
  "Ninguna",
];

const PURPOSES = [
  { value: "Estudio", weight: 22 },
  { value: "Visitar a un amigo", weight: 10 },
  { value: "Trabajo", weight: 38 },
  { value: "Regreso al hogar", weight: 30 },
];
const STAGE_BUCKETS = [
  { value: "1 etapa", weight: 64 },
  { value: "2 etapas", weight: 22 },
  { value: "3 etapas", weight: 9 },
  { value: "4 o más etapas", weight: 5 },
];

const randomFactory = (seedStart = 17737) => {
  let seed = seedStart;
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
};

const pickWeighted = (rand, items) => {
  const total = items.reduce((acc, item) => acc + item.weight, 0);
  let value = rand() * total;
  for (const item of items) {
    value -= item.weight;
    if (value <= 0) return item.value;
  }
  return items[items.length - 1].value;
};

const pickRandom = (rand, arr) => arr[Math.floor(rand() * arr.length) % arr.length];

export function buildSyntheticDataset(baseDataset, targetTrips = DEFAULT_TRIPS) {
  const rand = randomFactory();

  const municipalities = (baseDataset.metadata?.municipios || []).filter(
    (mun) => mun && mun !== "Zona Externa"
  );
  const internalMunicipalities = municipalities.filter((m) => m !== "AMVA General");

  const macroByMunicipio = Object.fromEntries(
    Object.entries(baseDataset.metadata?.macrozonasPorMunicipio || {}).filter(
      ([key]) => key !== "Zona Externa"
    )
  );

  const averageTripsPerPerson = 5.2;
  const personsTarget = Math.ceil(targetTrips / averageTripsPerPerson);
  const householdsTarget = Math.ceil(personsTarget / 3.1);

  const households = Array.from({ length: householdsTarget }, (_, idx) => {
    const municipio = pickRandom(rand, internalMunicipalities);
    const macrozona = pickRandom(rand, macroByMunicipio[municipio] || ["Urbana"]);
    const estrato = pickWeighted(rand, WEIGHTED_ESTRATO);
    const vehicleBucket = pickWeighted(rand, VEHICLE_BUCKETS);
    const vehicleType = pickWeighted(rand, VEHICLE_TYPES);
    const vehicleModel = pickWeighted(rand, VEHICLE_MODELS);

    return {
      id: `H${idx + 1}`,
      municipio,
      macrozona,
      size: Math.max(1, Math.round(rand() * 5) + 1),
      estrato,
      vehicleBucket,
      vehicleType,
      vehicleModel,
    };
  });

  const persons = [];
  households.forEach((household) => {
    const members = Math.max(1, Math.round(rand() * 3) + 1);
    for (let i = 0; i < members; i += 1) {
      persons.push({
        id: `P${persons.length + 1}`,
        householdId: household.id,
        municipio: household.municipio,
        macrozona: household.macrozona,
        ageRange: pickWeighted(rand, AGE_BUCKET_OPTIONS),
        gender: pickWeighted(rand, GENDERS_WEIGHTED),
        estrato: household.estrato,
        edu: pickWeighted(rand, EDUCATION_OPTIONS),
      });
    }
  });

  const trips = [];
  let personIdx = 0;
  while (trips.length < targetTrips) {
    const person = persons[personIdx % persons.length];
    personIdx += 1;

    const plannedTrips = Math.max(2, Math.round(rand() * 5) + 1);
    for (let i = 0; i < plannedTrips && trips.length < targetTrips; i += 1) {
      const originMunicipio = person.municipio;
      const destinationMunicipio = pickRandom(rand, internalMunicipalities);
      const originMacro = pickRandom(rand, macroByMunicipio[originMunicipio] || ["Urbana"]);
      const destinationMacro = pickRandom(
        rand,
        macroByMunicipio[destinationMunicipio] || ["Urbana"]
      );

      trips.push({
        id: `T${trips.length + 1}`,
        personId: person.id,
        originMunicipio,
        destinationMunicipio,
        originMacro,
        destinationMacro,
        distanceKm: Number((rand() * 25 + 0.5).toFixed(1)),
        durationMin: Math.max(6, Math.round(rand() * 80) + 8),
        mode: pickWeighted(rand, MODE_OPTIONS),
        tripPurpose: pickWeighted(rand, PURPOSES),
        stageBucket: pickWeighted(rand, STAGE_BUCKETS),
      });
    }
  }

  return {
    metadata: {
      municipios: municipalities,
      macrozonasPorMunicipio: macroByMunicipio,
    },
    households,
    persons,
    trips,
  };
}

export const metadataConstants = {
  VEHICLE_TYPES,
  VEHICLE_MODELS,
  VEHICLE_BUCKETS: VEHICLE_BUCKETS.map((item) => item.value),
  MODES,
};
