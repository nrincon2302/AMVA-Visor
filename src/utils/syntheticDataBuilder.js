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
  { value: "Trabajo", weight: 28 },
  { value: "Estudio", weight: 18 },
  { value: "Regreso al hogar", weight: 20 },
  { value: "Almuerzo", weight: 6 },
  { value: "Compras", weight: 6 },
  { value: "Salud", weight: 5 },
  { value: "Recreación", weight: 5 },
  { value: "Diligencia o trámite", weight: 5 },
  { value: "Acompañar a alguien", weight: 4 },
  { value: "Recoger o dejar alguien", weight: 2 },
  { value: "Otro", weight: 1 },
];
const NO_TRAVEL_REASONS = [
  { value: "Estaba enfermo", weight: 10 },
  { value: "Debía cuidar a alguien", weight: 10 },
  { value: "Debía trabajar en casa", weight: 10 },
  { value: "Debía estudiar en casa", weight: 10 },
  { value: "No quiso salir", weight: 10 },
  { value: "No necesitó salir", weight: 10 },
  { value: "Por el clima", weight: 10 },
  { value: "No contaba con el dinero para pagar el transporte", weight: 10 },
  { value: "Por pico y placa", weight: 10 },
  { value: "Otros", weight: 10 },
];
const POPULATION_INTEREST = [
  { value: "Cuidador", weight: 4 },
  { value: "Madre cabeza de familia", weight: 4 },
  { value: "Extranjero (residente permanente)", weight: 3 },
  { value: "Persona en situación de discapacidad", weight: 4 },
  { value: "Ninguna", weight: 85 },
];
const INCOME_BUCKETS = [
  { value: "Menos de 1 SMMLV", weight: 18 },
  { value: "Entre 1 y 2 SMMLV", weight: 28 },
  { value: "Entre 2 y 3 SMMLV", weight: 24 },
  { value: "Entre 3 y 4 SMMLV", weight: 14 },
  { value: "Más de 4 SMMLV", weight: 10 },
  { value: "No reporta", weight: 6 },
];

const STAGE_BUCKETS = [
  { value: "1 etapa", weight: 64 },
  { value: "2 etapas", weight: 22 },
  { value: "3 etapas", weight: 9 },
  { value: "4 o más etapas", weight: 5 },
];

// Generador de números aleatorios mejorado con múltiples seeds
const randomFactory = (seedStart = null) => {
  // Si no hay seed, usar timestamp + random para máxima aleatoriedad
  let seed = seedStart ?? (Date.now() * Math.random() * 1000000) % 4294967296;
  let counter = 0;
  
  return () => {
    counter++;
    // Combinar múltiples fuentes de aleatoriedad
    seed = (seed * 1664525 + 1013904223 + counter) % 4294967296;
    const random1 = seed / 4294967296;
    
    // Segunda capa de aleatoriedad
    seed = (seed * 22695477 + 1) % 4294967296;
    const random2 = seed / 4294967296;
    
    // Combinar ambas para mayor variación
    return (random1 + random2) / 2;
  };
};

// Función mejorada para selección ponderada con más variación
const pickWeighted = (rand, items) => {
  const total = items.reduce((acc, item) => acc + item.weight, 0);
  // Agregar pequeña variación aleatoria a los pesos
  const variance = 0.15; // 15% de variación
  let value = rand() * total * (1 + (rand() - 0.5) * variance);
  
  for (const item of items) {
    value -= item.weight;
    if (value <= 0) return item.value;
  }
  return items[items.length - 1].value;
};

const pickRandom = (rand, arr) => {
  const index = Math.floor(rand() * arr.length);
  return arr[index % arr.length];
};

// Función para agregar variación a números
const addVariation = (rand, base, variationPercent = 0.2) => {
  const variation = (rand() - 0.5) * 2 * variationPercent;
  return base * (1 + variation);
};

export function buildSyntheticDataset(baseDataset, targetTrips = DEFAULT_TRIPS) {
  // Usar seed aleatoria para cada generación
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

  // Variar los promedios
  const averageTripsPerPerson = addVariation(rand, 5.2, 0.3);
  const personsTarget = Math.ceil(targetTrips / averageTripsPerPerson);
  const averagePersonsPerHousehold = addVariation(rand, 3.1, 0.25);
  const householdsTarget = Math.ceil(personsTarget / averagePersonsPerHousehold);

  const households = Array.from({ length: householdsTarget }, (_, idx) => {
    const municipio = pickRandom(rand, internalMunicipalities);
    const macrozona = pickRandom(rand, macroByMunicipio[municipio] || ["Urbana"]);
    const estrato = pickWeighted(rand, WEIGHTED_ESTRATO);
    const vehicleBucket = pickWeighted(rand, VEHICLE_BUCKETS);
    const vehicleType = pickWeighted(rand, VEHICLE_TYPES);
    const vehicleModel = pickWeighted(rand, VEHICLE_MODELS);
    const income = pickWeighted(rand, INCOME_BUCKETS);
    const vehicleCount =
      vehicleBucket === "Sin vehículo"
        ? 0
        : vehicleBucket === "1 vehículo"
        ? 1
        : 2;
    const vehicles = Array.from({ length: vehicleCount }, (_, idx) => ({
      id: `${household.id}-V${idx + 1}`,
      type: pickWeighted(rand, VEHICLE_TYPES),
      model: pickWeighted(rand, VEHICLE_MODELS),
    }));

    // Variar el tamaño del hogar con más distribución
    const baseSize = rand() * 6;
    const size = Math.max(1, Math.min(8, Math.round(baseSize + (rand() - 0.5) * 2)));

    return {
      id: `H${idx + 1}`,
      municipio,
      macrozona,
      size,
      estrato,
      income,
      vehicleBucket,
      vehicleType,
      vehicleModel,
      vehicles,
    };
  });

  const persons = [];
  households.forEach((household) => {
    // Variar el número de miembros
    const baseMembers = rand() * 4;
    const members = Math.max(1, Math.min(6, Math.round(baseMembers + (rand() - 0.5))));
    
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
        occupation: pickRandom(rand, OCCUPATIONS),
        populationInterest: pickWeighted(rand, POPULATION_INTEREST),
        noTravelReason: null,
      });
    }
  });

  const trips = [];
  let personIdx = 0;
  
  let noTravelIndex = 0;

  while (trips.length < targetTrips) {
    const person = persons[personIdx % persons.length];
    personIdx += 1;

    // Variar el número de viajes por persona
    const baseTrips = rand() * 6;
    const plannedTrips = Math.max(0, Math.round(baseTrips + (rand() - 0.5) * 3));
    if (plannedTrips === 0) {
      const reason =
        NO_TRAVEL_REASONS[noTravelIndex % NO_TRAVEL_REASONS.length]?.value ||
        "Otros";
      noTravelIndex += 1;
      person.noTravelReason = reason;
    }
    
    for (let i = 0; i < plannedTrips && trips.length < targetTrips; i += 1) {
      const originMunicipio = person.municipio;
      
      // 80% de probabilidad de quedarse en el mismo municipio
      const destinationMunicipio = rand() < 0.8 
        ? originMunicipio 
        : pickRandom(rand, internalMunicipalities);
        
      const originMacro = pickRandom(rand, macroByMunicipio[originMunicipio] || ["Urbana"]);
      const destinationMacro = pickRandom(
        rand,
        macroByMunicipio[destinationMunicipio] || ["Urbana"]
      );

      // Variar distancia y duración con distribución más realista
      const baseDistance = rand() * 30;
      const distanceKm = Number((baseDistance * (0.5 + rand() * 0.8)).toFixed(1));
      
      const baseDuration = distanceKm * 3 + 10; // ~3 min por km + base
      const durationMin = Math.max(5, Math.round(baseDuration * (0.7 + rand() * 0.6)));

      trips.push({
        id: `T${trips.length + 1}`,
        personId: person.id,
        originMunicipio,
        destinationMunicipio,
        originMacro,
        destinationMacro,
        distanceKm,
        durationMin,
        mode: pickWeighted(rand, MODE_OPTIONS),
        tripPurpose: pickWeighted(rand, PURPOSES),
        stageBucket: pickWeighted(rand, STAGE_BUCKETS),
      });
    }
  }

  console.log(`Generated: ${households.length} households, ${persons.length} persons, ${trips.length} trips`);

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
  OCCUPATIONS,
  AGE_BUCKETS,
};
