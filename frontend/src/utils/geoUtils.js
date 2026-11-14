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
