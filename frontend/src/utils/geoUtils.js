export const ZONE_GEO_CATALOG = [
  {
    id: "tapacari_zona_andina",
    name: "Tapacarí",
    sub: "Zona Alta",
    alt: "3680 m",
    risk: "Helada y ladera",
    coords: [-17.518, -66.612],
    svgPos: { x: 65, y: 80 },
    towns: "Tapacarí, Challa, Confital, Leque, Bolívar",
    polygon: [
      [-17.35, -66.82],
      [-17.32, -66.45],
      [-17.48, -66.35],
      [-17.70, -66.45],
      [-17.72, -66.80],
      [-17.52, -66.90],
    ],
  },
  {
    id: "punata_valle_alto",
    name: "Punata",
    sub: "Valle Alto",
    alt: "2750 m",
    risk: "Poca lluvia",
    coords: [-17.542, -65.835],
    svgPos: { x: 175, y: 100 },
    towns: "Punata, Cliza, Arani, Tarata, San Benito",
    polygon: [
      [-17.42, -66.02],
      [-17.40, -65.68],
      [-17.55, -65.60],
      [-17.70, -65.72],
      [-17.68, -66.02],
      [-17.54, -66.08],
    ],
  },
  {
    id: "mizque_cono_sur",
    name: "Mizque",
    sub: "Cono Sur",
    alt: "2050 m",
    risk: "Sol fuerte",
    coords: [-17.941, -65.342],
    svgPos: { x: 265, y: 145 },
    towns: "Mizque, Aiquile, Totora, Omereque, Vila Vila",
    polygon: [
      [-17.75, -65.58],
      [-17.72, -65.15],
      [-17.92, -65.05],
      [-18.15, -65.20],
      [-18.14, -65.58],
      [-17.95, -65.65],
    ],
  },
];

export const COCHABAMBA_COMMUNITIES = [
  { id: "punata", name: "Punata", region: "Valle Alto", zoneId: "punata_valle_alto", alt: "2750 m", coords: [-17.542, -65.835] },
  { id: "cliza", name: "Cliza", region: "Valle Alto", zoneId: "punata_valle_alto", alt: "2730 m", coords: [-17.588, -65.932] },
  { id: "arani", name: "Arani", region: "Valle Alto", zoneId: "punata_valle_alto", alt: "2740 m", coords: [-17.569, -65.768] },
  { id: "tarata", name: "Tarata", region: "Valle Alto", zoneId: "punata_valle_alto", alt: "2760 m", coords: [-17.612, -66.022] },
  { id: "san_benito", name: "San Benito", region: "Valle Alto", zoneId: "punata_valle_alto", alt: "2740 m", coords: [-17.523, -65.908] },
  { id: "tolata", name: "Tolata", region: "Valle Alto", zoneId: "punata_valle_alto", alt: "2720 m", coords: [-17.530, -65.963] },
  { id: "toco", name: "Toco", region: "Valle Alto", zoneId: "punata_valle_alto", alt: "2740 m", coords: [-17.624, -65.948] },
  { id: "villa_rivero", name: "Villa Rivero", region: "Valle Alto", zoneId: "punata_valle_alto", alt: "2760 m", coords: [-17.596, -65.792] },
  { id: "tapacari", name: "Tapacarí", region: "Zona Alta", zoneId: "tapacari_zona_andina", alt: "3680 m", coords: [-17.518, -66.612] },
  { id: "challa_grande", name: "Challa Grande", region: "Zona Alta", zoneId: "tapacari_zona_andina", alt: "3920 m", coords: [-17.618, -66.742] },
  { id: "confital", name: "Confital", region: "Zona Alta", zoneId: "tapacari_zona_andina", alt: "4180 m", coords: [-17.664, -66.850] },
  { id: "leque", name: "Leque", region: "Zona Alta", zoneId: "tapacari_zona_andina", alt: "3750 m", coords: [-17.651, -66.628] },
  { id: "bolivar", name: "Bolívar", region: "Zona Alta", zoneId: "tapacari_zona_andina", alt: "3780 m", coords: [-17.968, -66.544] },
  { id: "colomi", name: "Colomi", region: "Zona Alta", zoneId: "tapacari_zona_andina", alt: "3310 m", coords: [-17.348, -65.869] },
  { id: "morochata", name: "Morochata", region: "Zona Alta", zoneId: "tapacari_zona_andina", alt: "3020 m", coords: [-17.224, -66.526] },
  { id: "independencia", name: "Independencia", region: "Zona Alta", zoneId: "tapacari_zona_andina", alt: "2890 m", coords: [-17.081, -66.821] },
  { id: "mizque", name: "Mizque", region: "Cono Sur", zoneId: "mizque_cono_sur", alt: "2050 m", coords: [-17.941, -65.342] },
  { id: "aiquile", name: "Aiquile", region: "Cono Sur", zoneId: "mizque_cono_sur", alt: "2250 m", coords: [-18.203, -65.177] },
  { id: "totora", name: "Totora", region: "Cono Sur", zoneId: "mizque_cono_sur", alt: "2810 m", coords: [-17.727, -65.193] },
  { id: "omereque", name: "Omereque", region: "Cono Sur", zoneId: "mizque_cono_sur", alt: "1620 m", coords: [-18.172, -64.933] },
  { id: "vila_vila", name: "Vila Vila", region: "Cono Sur", zoneId: "mizque_cono_sur", alt: "2560 m", coords: [-18.020, -65.588] },
  { id: "pasorapa", name: "Pasorapa", region: "Cono Sur", zoneId: "mizque_cono_sur", alt: "2380 m", coords: [-18.321, -64.677] },
  { id: "pojo", name: "Pojo", region: "Cono Sur", zoneId: "mizque_cono_sur", alt: "2520 m", coords: [-17.752, -64.863] },
  { id: "vacas", name: "Vacas", region: "Cono Sur", zoneId: "mizque_cono_sur", alt: "3480 m", coords: [-17.575, -65.595] },
];

const normText = (s = "") => String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export function searchCommunities(query = "") {
  const q = normText(query);
  if (!q) return COCHABAMBA_COMMUNITIES;
  return COCHABAMBA_COMMUNITIES.filter(
    (c) => normText(c.name).includes(q) || normText(c.region).includes(q) || normText(c.alt).includes(q)
  );
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const km = 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(km * 10) / 10;
}

export function findNearestZone(lat, lon) {
  let best = { zone: ZONE_GEO_CATALOG[1], distanceKm: haversineKm(lat, lon, ZONE_GEO_CATALOG[1].coords[0], ZONE_GEO_CATALOG[1].coords[1]) };
  for (const zone of ZONE_GEO_CATALOG) {
    const distanceKm = haversineKm(lat, lon, zone.coords[0], zone.coords[1]);
    if (distanceKm < best.distanceKm) {
      best = { zone, distanceKm };
    }
  }
  return best;
}
