// src/hooks/useTravelCrossfilterRecharts.js
import { useEffect, useState } from "react";
import baseDataset from "../data/travelData.json";
import { metadataConstants } from "../utils/syntheticDataBuilder";
import { MUNICIPIO_MACROZONA_HIERARCHY } from "../config/geoHierarchy";

const MACROZONAS_POR_MUNICIPIO = MUNICIPIO_MACROZONA_HIERARCHY;
const MUNICIPIOS = ["AMVA General", ...Object.keys(MACROZONAS_POR_MUNICIPIO)];
// Reduce el tamaño por defecto para evitar consumir demasiada memoria en dev
const TARGET_TRIPS = 200_000;
const formatMacrozonaLabel = (municipio, macrozona) =>
  `${municipio} - ${macrozona}`;

const MODE_OPTIONS = [
  "Metro",
  "Cable",
  "Metroplús",
  "Tranvía",
  "Bus / Buseta / Microbús urbano o metropolitano",
  "Ruta integrada o alimentador C3 y C6",
  "Bus / Buseta / Microbús intermunicipal",
  "Taxi individual (amarillo)",
  "Taxi colectivo (amarillo)",
  "Taxi intermunicipal o colectivo (blanco)",
  "Particular con pago (en calle sin plataforma)",
  "Particular con pago (solicitado con plataforma)",
  "Auto particular (conductor)",
  "Auto particular (acompañante)",
  "Escolar",
  "Vehículo empresarial",
  "Moto (conductor)",
  "Moto (acompañante)",
  "Mototaxi",
  "Motocarro",
  "Bicicleta propia",
  "Bicicleta pública",
  "Patineta eléctrica",
  "A pie",
  "Avión"
];

const MODE_DISTRIBUTION = [
  { value: "Metro", weight: 18 },
  { value: "Cable", weight: 6 },
  { value: "Metroplús", weight: 7 },
  { value: "Tranvía", weight: 4 },
  { value: "Bus / Buseta / Microbús urbano o metropolitano", weight: 28 },
  { value: "Ruta integrada o alimentador C3 y C6", weight: 16 },
  { value: "Bus / Buseta / Microbús intermunicipal", weight: 8 },
  { value: "Taxi individual (amarillo)", weight: 6 },
  { value: "Taxi colectivo (amarillo)", weight: 4 },
  { value: "Taxi intermunicipal o colectivo (blanco)", weight: 3 },
  { value: "Particular con pago (en calle sin plataforma)", weight: 2 },
  { value: "Particular con pago (solicitado con plataforma)", weight: 2 },
  { value: "Vehículo de pago por plataforma", weight: 5 },
  { value: "Auto particular (conductor)", weight: 18 },
  { value: "Auto particular (acompañante)", weight: 9 },
  { value: "Escolar", weight: 3 },
  { value: "Vehículo empresarial", weight: 2 },
  { value: "Moto (conductor)", weight: 14 },
  { value: "Moto (acompañante)", weight: 6 },
  { value: "Mototaxi", weight: 2 },
  { value: "Motocarro", weight: 2 },
  { value: "Bicicleta propia", weight: 6 },
  { value: "Bicicleta pública", weight: 2 },
  { value: "Patineta eléctrica", weight: 1 },
  { value: "A pie", weight: 15 },
  { value: "Avión", weight: 5 }
];

const POPULATION_INTEREST_VALUES = [
  "Cuidador",
  "Madre cabeza de familia",
  "Extranjero (residente permanente)",
  "Persona en situación de discapacidad",
  "Ninguna",
];

const THEMATIC_OPTIONS = {
  gender: ["Hombre", "Mujer"],
  ageRange: [
    "5-11",
    "12-17",
    "18-25",
    "26-35",
    "36-45",
    "46-60",
    "60+",
  ],
  estrato: [1, 2, 3, 4, 5, 6],
  mode: MODE_OPTIONS,
  edu: [
    "Ninguno",
    "Primaria",
    "Noveno Grado",
    "Bachillerato",
    "Educación No formal",
    "Técnico",
    "Tecnológico",
    "Universitario",
    "Posgrado",
  ],
  occupation: [
    "Trabajador dependiente o empleado",
    "Trabajador independiente",
    "Estudiante",
    "Ama de casa",
    "Desempleado",
    "Trabajador y estudiante",
    "Jubilado",
    "Jubilado y trabajador",
    "Jubilado y estudiante",
    "Ama de casa y estudiante",
    "Ninguna",
  ],
  populationInterest: POPULATION_INTEREST_VALUES,
};

const hashString = (value) =>
  value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

const deriveCategorical = (seedValue, options) => {
  if (!options?.length) return null;

  const normalizedSeed = Math.abs(hashString(seedValue));
  const asWeightedObjects =
    typeof options[0] === "object" && Object.prototype.hasOwnProperty.call(options[0], "value");

  if (asWeightedObjects) {
    const totalWeight = options.reduce((acc, item) => acc + (item.weight || 1), 0);
    let cursor = normalizedSeed % totalWeight || totalWeight;

    for (const item of options) {
      cursor -= item.weight || 1;
      if (cursor <= 0) return item.value;
    }

    return options[options.length - 1].value;
  }

  return options[normalizedSeed % options.length];
};

const normalizeMode = (mode, id) => {
  const baseMap = {
    Metro: "Metro",
    Bus: "Bus / Buseta / Microbús urbano o metropolitano",
    "Bus urbano/metropolitano": "Bus / Buseta / Microbús urbano o metropolitano",
    "Bus intermunicipal": "Bus / Buseta / Microbús intermunicipal",
    Moto: "Moto (conductor)",
    Carro: "Auto particular (conductor)",
    Bicicleta: "Bicicleta propia",
    "Bicicleta pública": "Bicicleta pública",
    Caminata: "A pie",
    Taxi: "Taxi individual (amarillo)",
    "Taxi individual": "Taxi individual (amarillo)",
    "Taxi colectivo": "Taxi colectivo (amarillo)",
    "Taxi intermunicipal": "Taxi intermunicipal o colectivo (blanco)",
    "Ruta integrada": "Ruta integrada o alimentador C3 y C6",
    "Ruta integrada/Alimentador C3-C6": "Ruta integrada o alimentador C3 y C6",
    Tranvía: "Tranvía",
    "Transporte informal en calle": "Particular con pago (en calle sin plataforma)",
    "Plataforma (Uber/Cabify/etc.)": "Particular con pago (solicitado con plataforma)",
  };

  if (baseMap[mode]) return baseMap[mode];
  return deriveCategorical(`${mode}-${id}`, MODE_OPTIONS);
};

const normalizeEducation = (edu, id) => {
  if (!edu) return deriveCategorical(`${id}-edu`, THEMATIC_OPTIONS.edu);

  const match = THEMATIC_OPTIONS.edu.find(
    (item) => item.toLowerCase() === edu.toLowerCase()
  );

  if (match) return match;
  return deriveCategorical(`${edu}-${id}`, THEMATIC_OPTIONS.edu);
};

const normalizeAgeRange = (person) => {
  if (person.ageRange === "5-11" || person.ageRange === "12-17") {
    return person.ageRange;
  }

  const seed = hashString(person.id) % 10;
  if (seed === 0 || seed === 1) return "5-11";
  if (seed === 2 || seed === 3) return "12-17";

  return person.ageRange;
};

const VEHICLE_BUCKETS = metadataConstants.VEHICLE_BUCKETS;
const VEHICLE_TYPES = metadataConstants.VEHICLE_TYPES;
const VEHICLE_MODELS = metadataConstants.VEHICLE_MODELS;
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
const TRIP_FREQUENCY_OPTIONS = [
  { value: "Los 7 días de la semana", weight: 30 },
  { value: "2-6 días a la semana", weight: 40 },
  { value: "Solo un día a la semana", weight: 20 },
  { value: "Es un viaje eventual", weight: 10 },
];
const POPULATION_INTEREST = [
  { value: POPULATION_INTEREST_VALUES[0], weight: 4 },
  { value: POPULATION_INTEREST_VALUES[1], weight: 4 },
  { value: POPULATION_INTEREST_VALUES[2], weight: 3 },
  { value: POPULATION_INTEREST_VALUES[3], weight: 4 },
  { value: POPULATION_INTEREST_VALUES[4], weight: 85 },
];
const INCOME_BUCKETS = [
  { value: "Menos de 1 SMMLV", weight: 18 },
  { value: "Entre 1 y 2 SMMLV", weight: 28 },
  { value: "Entre 2 y 3 SMMLV", weight: 24 },
  { value: "Entre 3 y 4 SMMLV", weight: 14 },
  { value: "Más de 4 SMMLV", weight: 10 },
  { value: "No reporta", weight: 6 },
];

const OCCUPATIONS = [
  { value: "Trabajador dependiente o empleado", weight: 32 },
  { value: "Trabajador independiente", weight: 22 },
  { value: "Estudiante", weight: 14 },
  { value: "Ama de casa", weight: 9 },
  { value: "Desempleado", weight: 8 },
  { value: "Trabajador y estudiante", weight: 6 },
  { value: "Jubilado", weight: 4 },
  { value: "Jubilado y trabajador", weight: 3 },
  { value: "Jubilado y estudiante", weight: 2 },
  { value: "Ama de casa y estudiante", weight: 2 },
  { value: "Ninguna", weight: 4 },
];
const STAGE_BUCKETS = [
  { value: "1 etapa", weight: 64 },
  { value: "2 etapas", weight: 22 },
  { value: "3 etapas", weight: 9 },
  { value: "4 o más etapas", weight: 5 },
];
const VEHICLE_BUCKET_OPTIONS = [
  { value: "Sin vehículo", weight: 35 },
  { value: "1 vehículo", weight: 45 },
  { value: "2+ vehículos", weight: 20 },
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickFromMap = (map, key, fallback = []) => {
  const list = map?.[key] || fallback;
  return list.length ? pickRandom(list) : null;
};
const pickWeighted = (options) => {
  const total = options.reduce((acc, item) => acc + (item.weight || 1), 0);
  let cursor = Math.random() * total;
  for (const item of options) {
    cursor -= item.weight || 1;
    if (cursor <= 0) return item.value;
  }
  return options[options.length - 1].value;
};

const DEFAULT_THEMATIC_FILTERS = {
  gender: THEMATIC_OPTIONS.gender,
  ageRange: THEMATIC_OPTIONS.ageRange,
  estrato: THEMATIC_OPTIONS.estrato,
  mode: MODE_OPTIONS,
  edu: THEMATIC_OPTIONS.edu,
  occupation: OCCUPATIONS.map((item) => item.value),
  populationInterest: THEMATIC_OPTIONS.populationInterest,
  vehicleBucket: VEHICLE_BUCKET_OPTIONS.map((item) => item.value),
  tripPurpose: PURPOSES.map((item) => item.value),
  stageBucket: STAGE_BUCKETS.map((item) => item.value),
};

const getFallbackMacrozone = (municipio) =>
  MUNICIPIO_MACROZONA_HIERARCHY[municipio]?.[0] || "Urbana";

const normalizeMacrozonaForMunicipio = (municipio, macrozona) => {
  const options = MUNICIPIO_MACROZONA_HIERARCHY[municipio] || [];
  if (!options.length) return macrozona || "Urbana";
  if (macrozona && options.includes(macrozona)) return macrozona;
  return pickFromMap(MUNICIPIO_MACROZONA_HIERARCHY, municipio, [getFallbackMacrozone(municipio)]);
};

const isNoTravelPerson = (personId) => hashString(personId) % 100 < 14;
const getNoTravelReason = (personId) =>
  NO_TRAVEL_REASONS[hashString(personId) % NO_TRAVEL_REASONS.length]?.value || "Otros";

const stageCountFromBucket = (bucket) => {
  if (bucket === "1 etapa") return 1;
  if (bucket === "2 etapas") return 2;
  if (bucket === "3 etapas") return 3;
  return 4 + (hashString(bucket) % 2);
};

const buildStageModes = (primaryMode, stagesCount) => {
  if (stagesCount <= 1) return [primaryMode];
  const modes = [primaryMode];
  for (let i = 1; i < stagesCount; i += 1) {
    modes.push(deriveCategorical(`${primaryMode}-${i}`, MODE_OPTIONS));
  }
  return modes;
};

const aggregatePersonPercentages = (data, field) => {
  const filtered = data.filter((item) => item[field]);
  if (!filtered.length) return [];
  return aggregatePercentages(filtered, field);
};

const MODE_GROUPS = {
  public: new Set([
    "Metro",
    "Cable",
    "Metroplús",
    "Tranvía",
    "Bus / Buseta / Microbús urbano o metropolitano (1)",
    "Ruta integrada o alimentador C3 y C6",
    "Bus / Buseta / Microbús intermunicipal (1)",
    "Taxi individual (amarillo)",
    "Taxi colectivo (amarillo)",
    "Taxi intermunicipal o colectivo (blanco)",
  ]),
  private: new Set([
    "Auto particular (conductor)",
    "Auto particular (acompañante)",
    "Moto (conductor)",
    "Moto (acompañante)",
    "Vehículo empresarial",
    "Particular con pago (en calle sin plataforma)",
    "Particular con pago (solicitado con plataforma)",
    "Avión"
  ]),
  nonMotorized: new Set([
    "Bicicleta propia",
    "Bicicleta pública",
    "Patineta eléctrica",
    "A pie"
  ]),
};

const OTHER_MODES = new Set([
  "Vehículo empresarial",
  "Motocarro",
  "Vehículo de pago por plataforma",
  "Patineta eléctrica",
  "Transporte informal o particular",
]);

const groupModeLabel = (mode) => {
  if (mode === "Metro" || mode === "Cable") return "Metro";
  if (mode === "Metroplús" || mode === "Ruta integrada o alimentador C3 y C6") {
    return "Metroplus";
  }
  if (mode === "Tranvía") return "Tranvía";
  if (mode === "Bus / Buseta / Microbús urbano o metropolitano") {
    return "Transporte Público Colectivo";
  }
  if (
    mode === "Taxi individual (amarillo)" ||
    mode === "Taxi colectivo (amarillo)" ||
    mode === "Taxi intermunicipal o colectivo (blanco)"
  ) {
    return "Taxi";
  }
  if (
    mode === "Particular con pago (solicitado con plataforma)" ||
    mode === "Particular con pago (en calle sin plataforma)" ||
    mode === "Auto particular (conductor)" ||
    mode === "Auto particular (acompañante)"
  ) {
    return "Auto";
  }
  if (mode === "Escolar") return "Transporte escolar";
  if (
    mode === "Moto (conductor)" ||
    mode === "Moto (acompañante)" ||
    mode === "Mototaxi" ||
    mode === "Motocarro"
  ) {
    return "Moto";
  }
  if (mode === "Bicicleta propia" || mode === "Bicicleta pública") return "Bicicleta";
  if (mode === "A pie") return "A Pie";
  if (
    mode === "Vehículo empresarial" || 
    mode === "Patineta eléctrica" ||
    mode === "Avión" ||
    mode === "Bus / Buseta / Microbús intermunicipal"
  ) return "Otros";
  return mode;
};

const getModeGroup = (mode) => {
  if (MODE_GROUPS.public.has(mode)) return "public";
  if (MODE_GROUPS.private.has(mode)) return "private";
  if (MODE_GROUPS.nonMotorized.has(mode)) return "nonMotorized";
  return "other";
};

const buildHourlyModeGroupSeries = (trips) => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, "0")}:00`);
  const buckets = hours.map((hour) => ({
    hour,
    total: 0,
    public: 0,
    private: 0,
    nonMotorized: 0,
    other: 0,
  }));

  trips.forEach((trip) => {
    const idx = trip.departureHour ?? Number(trip.departureLabel?.split(":")[0]) ?? 0;
    const bucket = buckets[idx] || buckets[0];
    bucket.total += 1;
    const group = getModeGroup(trip.mode);
    bucket[group] += 1;
  });

  return buckets;
};

const buildDurationHistogram = (trips) => {
  const bins = [
    { label: "0-15", min: 0, max: 15 },
    { label: "15-30", min: 15, max: 30 },
    { label: "30-45", min: 30, max: 45 },
    { label: "45-60", min: 45, max: 60 },
    { label: "60-90", min: 60, max: 90 },
    { label: "90-120", min: 90, max: 120 },
    { label: "120+", min: 120, max: Infinity },
  ];

  const counts = bins.map((bin) => ({ label: bin.label, value: 0 }));
  trips.forEach((trip) => {
    const duration = trip.durationMin ?? 0;
    const index = bins.findIndex((bin) => duration >= bin.min && duration < bin.max);
    if (index >= 0) counts[index].value += 1;
  });
  const total = trips.length || 1;
  return counts.map((bin) => ({
    ...bin,
    value: Number(((bin.value / total) * 100).toFixed(1)),
  }));
};

const buildAverageDurationByModeGroup = (trips) => {
  const totals = {
    public: { sum: 0, count: 0 },
    private: { sum: 0, count: 0 },
    nonMotorized: { sum: 0, count: 0 },
  };

  trips.forEach((trip) => {
    const group = getModeGroup(trip.mode);
    if (!totals[group]) return;
    totals[group].sum += trip.durationMin ?? 0;
    totals[group].count += 1;
  });

  return [
    {
      label: "Transporte público",
      value: totals.public.count ? Number((totals.public.sum / totals.public.count).toFixed(1)) : 0,
    },
    {
      label: "Transporte privado",
      value: totals.private.count ? Number((totals.private.sum / totals.private.count).toFixed(1)) : 0,
    },
    {
      label: "Modos no motorizados",
      value: totals.nonMotorized.count
        ? Number((totals.nonMotorized.sum / totals.nonMotorized.count).toFixed(1))
        : 0,
    },
  ];
};

const computeVehicleRates = (households, persons) => {
  const population = persons.length || 1;
  const vehicles = households.flatMap((household) => household.vehicles || []);
  const counts = vehicles.reduce(
    (acc, vehicle) => {
      const type = vehicle.type;
      if (type === "Automóvil" || type === "Camioneta") acc.autos += 1;
      if (type === "Moto") acc.motos += 1;
      if (type === "Bicicleta") acc.bicicletas += 1;
      return acc;
    },
    { autos: 0, motos: 0, bicicletas: 0 }
  );

  return {
    autos: Number(((counts.autos / population) * 1000).toFixed(1)),
    motos: Number(((counts.motos / population) * 1000).toFixed(1)),
    bicicletas: Number(((counts.bicicletas / population) * 1000).toFixed(1)),
  };
};

function aggregatePercentages(data, field) {
  if (!data.length) return [];
  const counts = data.reduce((acc, item) => {
    const key = item[field];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({
      label,
      value: Number(((value / data.length) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.value - a.value);
}

function aggregatePercentagesMapped(data, field, mapValue) {
  if (!data.length) return [];
  const counts = data.reduce((acc, item) => {
    const key = mapValue ? mapValue(item[field]) : item[field];
    if (!key) return acc;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({
      label,
      value: Number(((value / data.length) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.value - a.value);
}

function aggregateCounts(data, field) {
  if (!data.length) return [];
  const counts = data.reduce((acc, item) => {
    const key = item[field];
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function useTravelCrossfilterRecharts() {
  const [municipio, setMunicipio] = useState("AMVA General");
  const [destinationMunicipio, setDestinationMunicipio] = useState("AMVA General");
  const [thematicFilters, setThematicFilters] = useState(DEFAULT_THEMATIC_FILTERS);
  const [isLoading, setIsLoading] = useState(true);

  const [households, setHouseholds] = useState([]);
  const [persons, setPersons] = useState([]);
  const [trips, setTrips] = useState([]);
  const [derivedHouseholds, setDerivedHouseholds] = useState({});
  const [personsNormalized, setPersonsNormalized] = useState([]);
  const [enrichedTrips, setEnrichedTrips] = useState([]);

  const [filteredTrips, setFilteredTrips] = useState([]);
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [filteredPersonsBase, setFilteredPersonsBase] = useState([]);
  const [filteredHouseholds, setFilteredHouseholds] = useState([]);
  const [geoFilteredTrips, setGeoFilteredTrips] = useState([]);
  const [geoFilteredPersons, setGeoFilteredPersons] = useState([]);
  const [geoFilteredHouseholds, setGeoFilteredHouseholds] = useState([]);

  const [estratoData, setEstratoData] = useState([]);
  const [edadData, setEdadData] = useState([]);
  const [generoData, setGeneroData] = useState([]);
  const [escolaridadData, setEscolaridadData] = useState([]);
  const [modeData, setModeData] = useState([]);
  const [stageData, setStageData] = useState([]);
  const [purposeData, setPurposeData] = useState([]);
  const [noTravelReasonData, setNoTravelReasonData] = useState([]);
  const [occupationData, setOccupationData] = useState([]);
  const [populationInterestData, setPopulationInterestData] = useState([]);
  const [vehicleTenureData, setVehicleTenureData] = useState([]);
  const [vehicleTypeData, setVehicleTypeData] = useState([]);
  const [vehicleModelData, setVehicleModelData] = useState([]);
  const [geoHourlyModeData, setGeoHourlyModeData] = useState([]);
  const [geoDurationHistogramData, setGeoDurationHistogramData] = useState([]);
  const [geoDurationByModeGroupData, setGeoDurationByModeGroupData] = useState([]);
  const [geoTripsByEstratoData, setGeoTripsByEstratoData] = useState([]);
  const [geoTripFrequencyData, setGeoTripFrequencyData] = useState([]);
  const [geoVehicleRates, setGeoVehicleRates] = useState({
    autos: 0,
    motos: 0,
    bicicletas: 0,
  });
  const [macroHeatData, setMacroHeatData] = useState({ origin: [], destination: [] });

  useEffect(() => {
    setIsLoading(true);
    setHouseholds(baseDataset.households || []);
    setPersons(baseDataset.persons || []);
    setTimeout(() => {
      const baseTrips = baseDataset.trips || [];
      if (!baseTrips.length) {
        setTrips([]);
        return;
      }

      const multiplier = Math.ceil(TARGET_TRIPS / baseTrips.length);
      const expanded = [];
      let idCounter = 1;

      for (let i = 0; i < multiplier; i += 1) {
        for (let j = 0; j < baseTrips.length && expanded.length < TARGET_TRIPS; j += 1) {
          const trip = baseTrips[j];
          const destinationMunicipio = pickRandom(
            MUNICIPIOS.filter((item) => item && item !== "AMVA General")
          );
          const originMunicipio = trip.originMunicipio || destinationMunicipio;
          const originMacro = normalizeMacrozonaForMunicipio(
            originMunicipio,
            trip.originMacro
          );
          const destinationMacro = normalizeMacrozonaForMunicipio(
            destinationMunicipio,
            trip.destinationMacro
          );
          expanded.push({
            ...trip,
            id: `T${idCounter}`,
            mode: pickWeighted(MODE_DISTRIBUTION),
            tripPurpose: pickWeighted(PURPOSES),
            tripFrequency: pickWeighted(TRIP_FREQUENCY_OPTIONS),
            stageBucket: pickWeighted(STAGE_BUCKETS),
            distanceKm: Number((Math.random() ** 0.8 * 32 + 0.3).toFixed(1)),
            durationMin: Math.max(5, Math.round(Math.random() ** 0.7 * 120) + 6),
            originMunicipio,
            destinationMunicipio,
            originMacro,
            destinationMacro,
          });
          idCounter += 1;
        }
      }

      setTrips(expanded);
    }, 0);
  }, []);

  useEffect(() => {
    const nextDerived = households.reduce((acc, household) => {
      const estratoValue = household.estrato ?? deriveCategorical(household.id, THEMATIC_OPTIONS.estrato);
      const incomeValue = household.income ?? deriveCategorical(`${household.id}-income`, INCOME_BUCKETS);
      const vehicleSeed = `${household.id}-${household.size}-${household.municipio}`;
      const vehicleBucket =
        household.vehicleBucket || deriveCategorical(vehicleSeed, VEHICLE_BUCKET_OPTIONS);
      const vehicleType =
        household.vehicleType || deriveCategorical(`${vehicleSeed}-type`, VEHICLE_TYPES);
      const vehicleModel =
        household.vehicleModel || deriveCategorical(`${vehicleSeed}-model`, VEHICLE_MODELS);
      const vehicleCount =
        vehicleBucket === "Sin vehículo"
          ? 0
          : vehicleBucket === "1 vehículo"
          ? 1
          : 2;
      const vehicles = Array.from({ length: vehicleCount }, (_, idx) => ({
        id: `${household.id}-V${idx + 1}`,
        type: deriveCategorical(`${vehicleSeed}-type-${idx}`, VEHICLE_TYPES),
        model: deriveCategorical(`${vehicleSeed}-model-${idx}`, VEHICLE_MODELS),
      }));

      acc[household.id] = {
        ...household,
        estrato: estratoValue,
        income: incomeValue,
        vehicleBucket,
        vehicleType,
        vehicleModel,
        vehicleCount,
        vehicles,
      };
      return acc;
    }, {});
    setDerivedHouseholds(nextDerived);
  }, [households]);

  useEffect(() => {
    const normalized = persons.map((person) => {
      const household = derivedHouseholds[person.householdId];
      const municipio = household?.municipio || person.municipio;
      const macrozona = normalizeMacrozonaForMunicipio(municipio, person.macrozona);
      const noTravel = isNoTravelPerson(person.id);
      return {
        ...person,
        municipio,
        macrozona,
        estrato: household?.estrato ?? person.estrato,
        ageRange: normalizeAgeRange(person),
        edu: normalizeEducation(person.edu, person.id),
        occupation: deriveCategorical(person.id, OCCUPATIONS),
        populationInterest: deriveCategorical(`${person.id}-interest`, POPULATION_INTEREST),
        noTravelReason: noTravel ? getNoTravelReason(person.id) : null,
        vehicleBucket:
          household?.vehicleBucket || deriveCategorical(person.id, VEHICLE_BUCKET_OPTIONS),
        vehicleType:
          household?.vehicleType || deriveCategorical(`${person.id}-type`, VEHICLE_TYPES),
        vehicleModel:
          household?.vehicleModel || deriveCategorical(`${person.id}-model`, VEHICLE_MODELS),
        household,
        macrozonaKey: formatMacrozonaLabel(municipio, macrozona),
      };
    });
    setPersonsNormalized(normalized);
  }, [persons, derivedHouseholds]);

  useEffect(() => {
    const personsById = Object.fromEntries(personsNormalized.map((p) => [p.id, p]));
    const enriched = trips.map((trip) => {
      const person = personsById[trip.personId];
      if (!person || person.noTravelReason) {
        return null;
      }
      const originMunicipio = person?.municipio || "AMVA General";
      const departureHour = hashString(trip.id) % 24;
      const normalizedMode = normalizeMode(trip.mode, trip.id);
      const purpose = trip.tripPurpose || deriveCategorical(trip.id, PURPOSES);
      const tripFrequency =
        trip.tripFrequency || deriveCategorical(`${trip.id}-frequency`, TRIP_FREQUENCY_OPTIONS);
      const stageBucket = trip.stageBucket || deriveCategorical(`${trip.id}-stage`, STAGE_BUCKETS);
      const originMacro = normalizeMacrozonaForMunicipio(originMunicipio, trip.originMacro);
      const destinationMacro = normalizeMacrozonaForMunicipio(
        trip.destinationMunicipio,
        trip.destinationMacro
      );
      const stagesCount = stageCountFromBucket(stageBucket);

      return {
        ...trip,
        ...person,
        mode: normalizedMode,
        tripPurpose: purpose,
        tripFrequency,
        stageBucket,
        originMunicipio,
        originMacro,
        destinationMacro,
        originKey: formatMacrozonaLabel(originMunicipio, originMacro),
        destinationKey: formatMacrozonaLabel(trip.destinationMunicipio, destinationMacro),
        stagesCount,
        stages: buildStageModes(normalizedMode, stagesCount),
        departureHour,
        departureLabel: `${departureHour.toString().padStart(2, "0")}:00`,
      };
    }).filter(Boolean);
    setEnrichedTrips(enriched);
  }, [trips, personsNormalized]);

  useEffect(() => {
    if (!enrichedTrips.length || !personsNormalized.length) return;

    const buildFilteredData = (skipThematic = null) => {
      const matchPerson = (person) => {
        if (municipio !== "AMVA General" && municipio !== "Todos") {
          if (person.municipio !== municipio) return false;
        }

        if (skipThematic !== "gender" && thematicFilters.gender.length) {
          if (!thematicFilters.gender.includes(person.gender)) return false;
        }
        if (skipThematic !== "ageRange" && thematicFilters.ageRange.length) {
          if (!thematicFilters.ageRange.includes(person.ageRange)) return false;
        }
        if (skipThematic !== "estrato" && thematicFilters.estrato.length) {
          if (!thematicFilters.estrato.includes(person.estrato)) return false;
        }
        if (skipThematic !== "edu" && thematicFilters.edu.length) {
          if (!thematicFilters.edu.includes(person.edu)) return false;
        }
        if (skipThematic !== "vehicleBucket" && thematicFilters.vehicleBucket.length) {
          if (!thematicFilters.vehicleBucket.includes(person.vehicleBucket)) return false;
        }
        if (skipThematic !== "occupation" && thematicFilters.occupation.length) {
          if (!thematicFilters.occupation.includes(person.occupation)) return false;
        }
        if (skipThematic !== "populationInterest" && thematicFilters.populationInterest.length) {
          if (!thematicFilters.populationInterest.includes(person.populationInterest)) return false;
        }
        return true;
      };

      const personsBaseFiltered = personsNormalized.filter(matchPerson);
      const personIds = new Set(personsBaseFiltered.map((p) => p.id));

      const matchTrip = (trip) => {
        if (!personIds.has(trip.personId)) return false;

        if (
          municipio !== "AMVA General" &&
          municipio !== "Todos" &&
          trip.originMunicipio !== municipio
        ) {
          return false;
        }
        if (
          destinationMunicipio !== "AMVA General" &&
          destinationMunicipio !== "Todos" &&
          trip.destinationMunicipio !== destinationMunicipio
        ) {
          return false;
        }

        if (skipThematic !== "mode" && thematicFilters.mode.length) {
          if (!thematicFilters.mode.includes(trip.mode)) return false;
        }
        if (skipThematic !== "tripPurpose" && thematicFilters.tripPurpose.length) {
          if (!thematicFilters.tripPurpose.includes(trip.tripPurpose)) return false;
        }
        if (skipThematic !== "stageBucket" && thematicFilters.stageBucket.length) {
          if (!thematicFilters.stageBucket.includes(trip.stageBucket)) return false;
        }

        return true;
      };

      const tripsForCharts = enrichedTrips.filter((trip) => matchTrip(trip));
      const tripsForMaps = tripsForCharts;

      const activePersonIds = new Set(tripsForCharts.map((trip) => trip.personId));
      const personsWithTrips = personsBaseFiltered.filter((person) =>
        activePersonIds.has(person.id)
      );

      const baseHouseholdIds = new Set(
        personsBaseFiltered.map((person) => person.householdId)
      );

      const householdsBase = households
        .map((household) => derivedHouseholds[household.id])
        .filter((household) => baseHouseholdIds.has(household.id));

      return {
        personsBaseFiltered,
        personsFiltered: personsWithTrips,
        tripsFiltered: tripsForCharts,
        tripsForMaps,
        householdsFiltered: householdsBase,
      };
    };

    const buildGeoFilteredData = () => {
      const matchPersonGeo = (person) => {
        if (municipio !== "AMVA General" && municipio !== "Todos") {
          if (person.municipio !== municipio) return false;
        }
        return true;
      };

      const personsBaseGeo = personsNormalized.filter(matchPersonGeo);
      const personIds = new Set(personsBaseGeo.map((p) => p.id));

      const tripsGeo = enrichedTrips.filter((trip) => {
        if (!personIds.has(trip.personId)) return false;
        if (
          municipio !== "AMVA General" &&
          municipio !== "Todos" &&
          trip.originMunicipio !== municipio
        ) {
          return false;
        }
        if (
          destinationMunicipio !== "AMVA General" &&
          destinationMunicipio !== "Todos" &&
          trip.destinationMunicipio !== destinationMunicipio
        ) {
          return false;
        }
        return true;
      });

      const baseHouseholdIds = new Set(
        personsBaseGeo.map((person) => person.householdId)
      );

      const householdsBase = households
        .map((household) => derivedHouseholds[household.id])
        .filter((household) => baseHouseholdIds.has(household.id));

      return {
        personsBaseGeo,
        tripsGeo,
        householdsBase,
      };
    };

    const filtered = buildFilteredData(null);

    setFilteredTrips(filtered.tripsFiltered);
    setFilteredPersons(filtered.personsFiltered);
    setFilteredPersonsBase(filtered.personsBaseFiltered);
    setFilteredHouseholds(filtered.householdsFiltered);

    const geoFiltered = buildGeoFilteredData();
    setGeoFilteredTrips(geoFiltered.tripsGeo);
    setGeoFilteredPersons(geoFiltered.personsBaseGeo);
    setGeoFilteredHouseholds(geoFiltered.householdsBase);

    setEstratoData(aggregatePercentages(buildFilteredData("estrato").tripsFiltered, "estrato"));
    setEdadData(aggregatePercentages(buildFilteredData("ageRange").tripsFiltered, "ageRange"));
    const genero = aggregatePercentages(buildFilteredData("gender").tripsFiltered, "gender").map(
      (item) => ({ name: item.label, value: item.value })
    );
    setGeneroData(genero);
    setEscolaridadData(
      aggregatePercentages(buildFilteredData("edu").tripsFiltered, "edu")
    );
    setModeData(
      aggregatePercentagesMapped(
        buildFilteredData("mode").tripsFiltered,
        "mode",
        groupModeLabel
      )
    );
    setStageData(
      aggregatePercentages(buildFilteredData("stageBucket").tripsFiltered, "stageBucket")
    );
    setPurposeData(
      aggregatePercentages(buildFilteredData("tripPurpose").tripsFiltered, "tripPurpose")
    );
    setNoTravelReasonData(
      aggregatePersonPercentages(filtered.personsBaseFiltered, "noTravelReason")
    );
    setOccupationData(
      aggregatePercentages(buildFilteredData("occupation").tripsFiltered, "occupation")
    );
    setPopulationInterestData(
      aggregatePercentages(
        buildFilteredData("populationInterest").tripsFiltered,
        "populationInterest"
      )
    );

    const vehicleHouseholds = buildFilteredData("vehicleBucket").householdsFiltered;
    if (vehicleHouseholds?.length) {
      const counts = vehicleHouseholds.reduce((acc, household) => {
        acc[household.vehicleBucket] = (acc[household.vehicleBucket] || 0) + 1;
        return acc;
      }, {});

      const total = vehicleHouseholds.length;
      const vehicleTenure = Object.entries(counts)
        .map(([label, value]) => ({
          label,
          value: Number(((value / total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value);
      setVehicleTenureData(vehicleTenure);
    } else {
      setVehicleTenureData([]);
    }

    if (filtered.householdsFiltered?.length) {
      const typeCounts = filtered.householdsFiltered.reduce((acc, household) => {
        const key = household.vehicleType || "Otro";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const modelCounts = filtered.householdsFiltered.reduce((acc, household) => {
        const key = household.vehicleModel || "(En blanco)";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const total = filtered.householdsFiltered.length;
      const vehicleTypes = Object.entries(typeCounts)
        .map(([label, value]) => ({
          label,
          value: Number(((value / total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value);
      const vehicleModels = Object.entries(modelCounts)
        .map(([label, value]) => ({
          label,
          value: Number(((value / total) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.value - a.value);
      setVehicleTypeData(vehicleTypes);
      setVehicleModelData(vehicleModels);
    } else {
      setVehicleTypeData([]);
      setVehicleModelData([]);
    }

    const originCounts = filtered.tripsForMaps.reduce((acc, trip) => {
      acc[trip.originKey] = (acc[trip.originKey] || 0) + 1;
      return acc;
    }, {});

    const destinationCounts = filtered.tripsForMaps.reduce((acc, trip) => {
      acc[trip.destinationKey] = (acc[trip.destinationKey] || 0) + 1;
      return acc;
    }, {});

    const toSeries = (counts) =>
      Object.entries(counts).map(([name, value]) => ({ name, value }));

    setMacroHeatData({
      origin: toSeries(originCounts),
      destination: toSeries(destinationCounts),
    });

    
    setGeoHourlyModeData(buildHourlyModeGroupSeries(geoFiltered.tripsGeo));
    setGeoDurationHistogramData(buildDurationHistogram(geoFiltered.tripsGeo));
    setGeoDurationByModeGroupData(buildAverageDurationByModeGroup(geoFiltered.tripsGeo));
    setGeoTripFrequencyData(
      aggregatePercentages(geoFiltered.tripsGeo, "tripFrequency")
    );
    const tripsByEstrato = aggregatePercentages(geoFiltered.tripsGeo, "estrato").sort(
      (a, b) => Number(a.label) - Number(b.label)
    );
    setGeoTripsByEstratoData(tripsByEstrato);
    setGeoVehicleRates(
      computeVehicleRates(geoFiltered.householdsBase, geoFiltered.personsBaseGeo)
    );
    setIsLoading(false);
  }, [
    enrichedTrips,
    personsNormalized,
    households,
    derivedHouseholds,
    municipio,
    destinationMunicipio,
    thematicFilters,
  ]);

  const filters = {
    municipio,
    destinationMunicipio,
    thematicFilters,
  };

  const setThematicValues = (key, values) => {
    const normalizedValues =
      key === "estrato" ? values.map((value) => Number(value)) : values;
    setThematicFilters((prev) => ({ ...prev, [key]: normalizedValues }));
  };

  const setExclusiveThematicValues = (key, values) => {
    const normalizedValues =
      key === "estrato" ? values.map((value) => Number(value)) : values;
    setThematicFilters((prev) => {
      const cleared = Object.fromEntries(Object.keys(prev).map((k) => [k, []]));
      return { ...cleared, [key]: normalizedValues };
    });
  };

  return {
    households,
    persons: personsNormalized,
    trips,
    derivedHouseholds,
    filters,
    municipios: MUNICIPIOS,
    filteredTrips,
    filteredPersons,
    filteredHouseholds,
    filteredPersonsBase,
    geoFilteredTrips,
    geoFilteredPersons,
    geoFilteredHouseholds,
    estratoData,
    edadData,
    generoData,
    escolaridadData,
    modeData,
    stageData,
    purposeData,
    noTravelReasonData,
    occupationData,
    populationInterestData,
    vehicleTenureData,
    vehicleTypeData,
    vehicleModelData,
    geoHourlyModeData,
    geoDurationHistogramData,
    geoDurationByModeGroupData,
    geoTripsByEstratoData,
    geoTripFrequencyData,
    geoVehicleRates,
    macroHeatData,
    isLoading,
    setMunicipio,
    setDestinationMunicipio,
    setThematicValues,
    setExclusiveThematicValues,
    thematicOptions: THEMATIC_OPTIONS,
  };
}
