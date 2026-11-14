import React from "react";

/**
 * TARPUY NASA COCHABAMBA — SET DE 24 ILUSTRACIONES PROPIAS EN SVG (FASE 1)
 * =========================================================================
 * Estilo: Almanaque campesino andino / dibujo hecho a mano con trazo de grosor
 * irregular (combinando contornos de 3.2px, 2.4px y achurados de 1.6px) y
 * rellenos desplazados tipo grabado.
 * REGLA: Cero colores hexadecimales sueltos; 100% variables CSS de tokens.css.
 */

const INK = "var(--color-ink-stroke)";
const HIGHLIGHT = "var(--color-ink-highlight)";
const SUN = "var(--color-illus-sun)";
const SUN_SOFT = "var(--color-illus-sun-soft)";
const WATER = "var(--color-illus-water)";
const WATER_SOFT = "var(--color-illus-water-soft)";
const LEAF = "var(--color-illus-leaf)";
const LEAF_SOFT = "var(--color-illus-leaf-soft)";
const EARTH_WET = "var(--color-illus-earth-wet)";
const EARTH_DRY = "var(--color-illus-earth-dry)";
const CLAY = "var(--color-illus-andean-clay)";
const WOOD = "var(--color-illus-wood)";
const CLOUD = "var(--color-illus-cloud)";
const WARN_INK = "var(--color-weather-warn-ink)";
const DANGER_INK = "var(--color-weather-danger-ink)";

function SvgFrame({ size = 64, className = "", label, children }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : "true"}
    >
      {children}
    </svg>
  );
}

/* 1. SOL */
export function DibujoSol({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Sol">
      <circle cx="33" cy="33" r="14.5" fill={SUN} />
      <path
        d="M31.5 18.5C39.5 18 46 24.5 45.5 32.5C45 40.5 38.5 46.5 30.5 45.8C23 45.2 17.8 39 18.4 31C19 23.5 24.5 19 31.5 18.5Z"
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M25 26C27 23.5 30 22.5 33 23" stroke={HIGHLIGHT} strokeWidth="2.2" strokeLinecap="round" />
      {/* Rayos irregulares hechos a mano */}
      <path d="M32 6.5L31.5 13.5M32.5 50.5L32 57.5M6.5 32L13.5 32.5M50.5 31.5L57.5 32" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M13.5 14L18.8 19.2M45.2 45L50.5 50.2M49.8 13.8L44.8 19M19 45.2L13.8 50.2" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 2. NUBE */
export function DibujoNube({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Nube">
      <path
        d="M17 45H48C53.5 44.5 57 40 56.5 35C56 30 51.5 27 47.5 27.2C45.5 19.5 38.5 15 30.5 16C23 16.8 18 22.5 17.5 29C12 29.5 8.5 33.8 9 39C9.5 43.2 13 45 17 45Z"
        fill={CLOUD}
      />
      <path
        d="M16.5 44.2C27 44.8 38 44.5 48.5 44.2C53.8 43.8 56.8 39.2 56 34.5C55.2 29.8 51 27 47 27.4C45 19.2 37.8 15 29.8 16.2C22.8 17.2 18 22.8 17.5 29.2C12.2 29.4 8.5 33.5 9.2 38.5C9.8 42.5 12.8 44 16.5 44.2Z"
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M23 24C26 20.5 31.5 19.5 35.5 21.5" stroke={HIGHLIGHT} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18 39.5H31" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 3. LLUVIA */
export function DibujoLluvia({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Lluvia">
      <path
        d="M16 36H48C52.8 35.5 55.8 31.5 55.2 27.2C54.6 23 50.5 20.5 46.8 20.8C44.8 14 38.2 10.2 30.8 11.2C24 12 19.5 17 19 22.5C14 23 10.8 26.8 11.4 31C11.8 34.4 13.5 36 16 36Z"
        fill={WATER_SOFT}
        stroke={INK}
        strokeWidth="3.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gotas de lluvia inclinadas con trazo expresivo */}
      <path d="M20 42L16.5 52.5" stroke={WATER} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M20 42L16.5 52.5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M32.5 41.5L28.5 55" stroke={WATER} strokeWidth="3.8" strokeLinecap="round" />
      <path d="M32.5 41.5L28.5 55" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M44.5 42L41 52.5" stroke={WATER} strokeWidth="3.6" strokeLinecap="round" />
      <path d="M44.5 42L41 52.5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 4. HELADA (Cristal de hielo + planta con escarcha) */
export function DibujoHelada({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Helada">
      {/* Halo frío */}
      <circle cx="24" cy="24" r="15" fill={WATER_SOFT} />
      {/* Cristal de hielo hecho a mano */}
      <path d="M24 10V38M11 24H37M15 15L33 33M33 15L15 33" stroke={WATER} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M24 10L21 13.5M24 10L27 13.5M24 38L21 34.5M24 38L27 34.5" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {/* Planta encogida con escarcha al lado */}
      <path d="M10 55C24 53.5 40 53.5 55 55" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M43 54C43 44 45 36 49 31" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path
        d="M44 43C38 41 35 44 36 48C39 48 42 46 44 43Z"
        fill={LEAF_SOFT}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M46 35C52 33 56 36 55 41C51 41 48 39 46 35Z"
        fill={WATER_SOFT}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Puntos de escarcha blanca/azul sobre la planta */}
      <circle cx="49" cy="28" r="2.2" fill={WATER} />
      <circle cx="54" cy="32" r="1.8" fill={WATER} />
    </SvgFrame>
  );
}

/* 5. VIENTO */
export function DibujoViento({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Viento">
      {/* Ráfagas curvas de grosor variable */}
      <path
        d="M8 24C19 23.5 31 24 42 23.5C47 23.2 49.5 19.5 48 16C46.5 13 42 13.5 41 16.8"
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M6 34.5C21 34 36 34.5 50 34C55.5 33.8 58 38 55.5 42C53 45.5 48 44.5 47 41"
        stroke={WATER}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M13 45.5C23 45.5 31 45.5 38 45.5C42 45.5 44 48.5 42 51.5C40.5 53.5 37 53 36.5 50.5"
        stroke={INK}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Hojitas volando en el viento */}
      <path
        d="M52 19C55 16 59 17 58 21C55 22 53 21 52 19Z"
        fill={LEAF}
        stroke={INK}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <path
        d="M24 15C27 12.5 31 13.5 30 17C27.5 18 25 17 24 15Z"
        fill={LEAF}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </SvgFrame>
  );
}

/* 6. TIERRA SECA */
export function DibujoTierraSeca({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Tierra seca">
      {/* Sol pequeño secando arriba */}
      <circle cx="48" cy="15" r="6.5" fill={SUN} stroke={INK} strokeWidth="2.4" />
      {/* Bloque de suelo reseco */}
      <path
        d="M7 31C22 29.5 42 29.5 57 31L54 54H10L7 31Z"
        fill={EARTH_DRY}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Grietas profundas irregulares */}
      <path
        d="M22 30.5L26 39L21 46L24 53.5M26 39L33 42.5M41 30.5L37 40L42 49.5M37 40L32 45"
        stroke={INK}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgFrame>
  );
}

/* 7. TIERRA HÚMEDA */
export function DibujoTierraHumeda({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Tierra húmeda">
      {/* Bloque de tierra oscura fértil */}
      <path
        d="M7 32C18 29 46 29 57 32L55 54H9L7 32Z"
        fill={EARTH_WET}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Surcos esponjosos hechos a mano */}
      <path d="M12 39C20 36.5 28 41.5 36 39C42 37 48 40 52 38.5" stroke={HIGHLIGHT} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M14 47C22 45 30 49 38 47C44 45.5 48 48 51 47" stroke={HIGHLIGHT} strokeWidth="2" strokeLinecap="round" />
      {/* Gota infiltrando y pequeño brote */}
      <path
        d="M23 12C26.5 17 28.5 20 28.5 23A5.5 5.5 0 1 1 17.5 23C17.5 20 19.5 17 23 12Z"
        fill={WATER}
        stroke={INK}
        strokeWidth="2.6"
      />
      <path d="M42 30V20" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M42 22C37 19 36 14 41 14C43 15 43 19 42 22Z" fill={LEAF} stroke={INK} strokeWidth="2.2" />
      <path d="M42 22C47 19 48 14 43 14C41 15 41 19 42 22Z" fill={LEAF} stroke={INK} strokeWidth="2.2" />
    </SvgFrame>
  );
}

/* 8. SEMILLA */
export function DibujoSemilla({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Semilla">
      {/* Surco de tierra */}
      <path d="M8 46C22 43 42 43 56 46" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M13 52C25 50 39 50 51 52" stroke={EARTH_WET} strokeWidth="2.6" strokeLinecap="round" />
      {/* Semilla grande abriéndose */}
      <path
        d="M22 39C18 32 23 22 32 21C41 20 46 29 42 38C39 44 25 44 22 39Z"
        fill={SUN}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Primer brotecito asomando */}
      <path d="M32 22C32 16 35 12 39 10" stroke={LEAF} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 22C32 16 35 12 39 10" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M27 32C29 29 33 28 36 30" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 9. BROTE */
export function DibujoBrote({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Brote">
      {/* Montículo de tierra */}
      <path
        d="M12 52C20 44 44 44 52 52Z"
        fill={EARTH_WET}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Tallo tierno */}
      <path d="M32 47C32 37 31 28 32 20" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      {/* Dos hojas tiernas */}
      <path
        d="M32 31C23 29 16 22 17 15C24 15 30 21 32 31Z"
        fill={LEAF}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M32 27C41 25 48 18 47 11C40 11 34 17 32 27Z"
        fill={LEAF}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M22 20L29 27M42 16L35 23" stroke={HIGHLIGHT} strokeWidth="1.8" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 10. PLANTA CRECIDA */
export function DibujoPlantaCrecida({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Planta crecida">
      <path d="M10 55C24 53 40 53 54 55" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 54V12" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      {/* Par de hojas bajas */}
      <path d="M32 44C21 42 13 35 12 26C21 27 29 34 32 44Z" fill={LEAF} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M32 42C43 40 51 33 52 24C43 25 35 32 32 42Z" fill={LEAF} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
      {/* Par de hojas altas */}
      <path d="M32 28C23 26 17 19 18 12C25 13 30 19 32 28Z" fill={LEAF} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M32 26C41 24 47 17 46 10C39 11 34 17 32 26Z" fill={LEAF} stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
      {/* Cogollo / flor superior */}
      <circle cx="32" cy="10" r="4" fill={SUN} stroke={INK} strokeWidth="2.5" />
    </SvgFrame>
  );
}

/* 11. COSECHA (Canasta / awayo colmado de frutos de la chacra) */
export function DibujoCosecha({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Cosecha">
      {/* Frutos asomando arriba (maíz, papas, hojas) */}
      <ellipse cx="23" cy="26" rx="7" ry="10" transform="rotate(-15 23 26)" fill={SUN} stroke={INK} strokeWidth="2.8" />
      <ellipse cx="38" cy="28" rx="9" ry="7" fill={EARTH_WET} stroke={INK} strokeWidth="2.8" />
      <path d="M31 24C31 16 37 12 43 13C41 20 36 24 31 24Z" fill={LEAF} stroke={INK} strokeWidth="2.6" />
      {/* Canasta tejida */}
      <path
        d="M11 32H53L47 53C46 55 43 56 40 56H24C21 56 18 55 17 53L11 32Z"
        fill={EARTH_DRY}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Franja de tejido andino en la canasta */}
      <path d="M13 40H51M15 47H49" stroke={CLAY} strokeWidth="3" strokeLinecap="round" />
      <path d="M22 32L24 55M32 32V56M42 32L40 55" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 12. MAÍZ (Sara) */
export function DibujoMaiz({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Maíz">
      {/* Mazorca dorada */}
      <path
        d="M24 18C24 11 40 11 40 18V42C40 47 24 47 24 42V18Z"
        fill={SUN}
        stroke={INK}
        strokeWidth="3.2"
      />
      {/* Granos dibujados a mano */}
      <path d="M29 14V43M35 14V43M25 21H39M25 28H39M25 35H39" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      {/* Chala / hojas envolventes */}
      <path
        d="M32 50C21 47 13 37 12 24C20 27 26 36 32 48Z"
        fill={LEAF}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M32 50C43 47 51 37 52 24C44 27 38 36 32 48Z"
        fill={LEAF}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M32 48V57" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 13. PAPA (Papa Huaycha / Akshu) */
export function DibujoPapa({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Papa">
      {/* Hojas superiores de la planta de papa */}
      <path d="M32 25V11" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 18C25 14 20 16 21 21C25 22 29 20 32 18Z" fill={LEAF} stroke={INK} strokeWidth="2.5" />
      <path d="M32 18C39 14 44 16 43 21C39 22 35 20 32 18Z" fill={LEAF} stroke={INK} strokeWidth="2.5" />
      {/* Tubérculo orgánico irregular */}
      <path
        d="M15 39C14 29 24 24 35 25C46 26 51 33 49 43C47 52 36 55 25 53C17 51 15 46 15 39Z"
        fill={EARTH_WET}
        stroke={INK}
        strokeWidth="3.3"
        strokeLinejoin="round"
      />
      {/* Ojos de la papa */}
      <circle cx="25" cy="35" r="2" fill={SUN_SOFT} />
      <circle cx="38" cy="34" r="1.8" fill={SUN_SOFT} />
      <circle cx="32" cy="44" r="2.1" fill={SUN_SOFT} />
      <path d="M23 38C25 39 27 39 28 38M36 46C38 47 40 46 41 45" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 14. HABA (Jawasa) */
export function DibujoHaba({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Haba">
      {/* Vaina curva carnosa */}
      <path
        d="M14 44C17 24 31 12 50 13C49 32 35 47 14 44Z"
        fill={LEAF}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Semillas de haba abultadas dentro */}
      <ellipse cx="24" cy="36" rx="4.5" ry="3.2" transform="rotate(-35 24 36)" fill={LEAF_SOFT} stroke={INK} strokeWidth="2.2" />
      <ellipse cx="33" cy="28" rx="4.5" ry="3.2" transform="rotate(-35 33 28)" fill={LEAF_SOFT} stroke={INK} strokeWidth="2.2" />
      <ellipse cx="42" cy="20" rx="4.2" ry="3" transform="rotate(-35 42 20)" fill={LEAF_SOFT} stroke={INK} strokeWidth="2.2" />
    </SvgFrame>
  );
}

/* 15. QUINUA (Kinwa) */
export function DibujoQuinua({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Quinua">
      <path d="M32 57V32" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 48L20 41M32 45L44 38" stroke={LEAF} strokeWidth="3.2" strokeLinecap="round" />
      {/* Panoja arracimada hecha a mano */}
      <circle cx="32" cy="15" r="7.5" fill={CLAY} stroke={INK} strokeWidth="2.8" />
      <circle cx="24" cy="23" r="6.5" fill={SUN} stroke={INK} strokeWidth="2.8" />
      <circle cx="40" cy="23" r="6.5" fill={CLAY} stroke={INK} strokeWidth="2.8" />
      <circle cx="27" cy="31" r="5.5" fill={CLAY} stroke={INK} strokeWidth="2.6" />
      <circle cx="37" cy="31" r="5.5" fill={SUN} stroke={INK} strokeWidth="2.6" />
      <circle cx="32" cy="24" r="6" fill={SUN} stroke={INK} strokeWidth="2.6" />
    </SvgFrame>
  );
}

/* 16. AVENA */
export function DibujoAvena({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Avena">
      {/* Tallos arqueados de avena forrajera */}
      <path d="M28 57C28 40 27 24 23 11" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M36 57C36 42 38 26 42 13" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {/* Espiguillas colgantes doradas */}
      <ellipse cx="16" cy="20" rx="3.5" ry="6" transform="rotate(28 16 20)" fill={SUN} stroke={INK} strokeWidth="2.4" />
      <ellipse cx="17" cy="33" rx="3.5" ry="6" transform="rotate(25 17 33)" fill={SUN} stroke={INK} strokeWidth="2.4" />
      <ellipse cx="48" cy="22" rx="3.5" ry="6" transform="rotate(-28 48 22)" fill={SUN} stroke={INK} strokeWidth="2.4" />
      <ellipse cx="47" cy="35" rx="3.5" ry="6" transform="rotate(-25 47 35)" fill={SUN} stroke={INK} strokeWidth="2.4" />
      <path d="M28 52C21 47 15 47 12 51" stroke={LEAF} strokeWidth="2.8" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 17. GOTA DE AGUA */
export function DibujoGotaAgua({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Gota de agua">
      <path
        d="M32 9C39 20 48 30 48 40C48 49.5 40.8 56 32 56C23.2 56 16 49.5 16 40C16 30 25 20 32 9Z"
        fill={WATER}
        stroke={INK}
        strokeWidth="3.3"
        strokeLinejoin="round"
      />
      <path
        d="M23 36C22 41 24 46 28 48"
        stroke={HIGHLIGHT}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </SvgFrame>
  );
}

/* 18. RIEGO POR GRAVEDAD (Acequia / surco de agua corriendo a la chacra) */
export function DibujoRiegoGravedad({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Riego por gravedad">
      {/* Bordos de tierra de la acequia */}
      <path
        d="M6 22L22 54H10L6 22ZM58 22L42 54H54L58 22Z"
        fill={EARTH_WET}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Canal de agua corriendo hacia adelante */}
      <path
        d="M18 22H46L40 54H24L18 22Z"
        fill={WATER}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Ondas de corriente */}
      <path d="M24 31C28 29 36 29 40 31M26 41C30 39 34 39 38 41" stroke={HIGHLIGHT} strokeWidth="2.4" strokeLinecap="round" />
      {/* Plantita en el bordo */}
      <path d="M13 22V12M13 15L9 12M13 15L17 12" stroke={LEAF} strokeWidth="2.8" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 19. RIEGO POR GOTEO (Manguera con gotas precisas al pie de la planta) */
export function DibujoRiegoGoteo({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Riego por goteo">
      {/* Tubería horizontal */}
      <path d="M6 18H58" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M6 18H58" stroke={WOOD} strokeWidth="2.4" strokeLinecap="round" />
      {/* Goteros */}
      <rect x="19" y="15" width="6" height="7" rx="2" fill={INK} />
      <rect x="39" y="15" width="6" height="7" rx="2" fill={INK} />
      {/* Gotitas cayendo */}
      <path d="M22 25C24.5 29 26 31.5 26 34A4 4 0 1 1 18 34C18 31.5 19.5 29 22 25Z" fill={WATER} stroke={INK} strokeWidth="2.4" />
      <path d="M42 25C44.5 29 46 31.5 46 34A4 4 0 1 1 38 34C38 31.5 39.5 29 42 25Z" fill={WATER} stroke={INK} strokeWidth="2.4" />
      {/* Suelo y brotes */}
      <path d="M8 52H56" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M22 52V44M42 52V44" stroke={LEAF} strokeWidth="3" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 20. TRACTOR */
export function DibujoTractor({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Tractor">
      {/* Cabina y motor */}
      <path
        d="M16 20H32L35 30H50V42H16V20Z"
        fill={CLAY}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <rect x="20" y="23" width="10" height="8" fill={WATER_SOFT} stroke={INK} strokeWidth="2.2" />
      {/* Chimenea */}
      <path d="M44 30V19L47 17" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      {/* Rueda trasera grande y delantera */}
      <circle cx="23" cy="44" r="11" fill={EARTH_WET} stroke={INK} strokeWidth="3.4" />
      <circle cx="23" cy="44" r="4.5" fill={SUN} stroke={INK} strokeWidth="2.2" />
      <circle cx="46" cy="46" r="8" fill={EARTH_WET} stroke={INK} strokeWidth="3.2" />
      <circle cx="46" cy="46" r="3" fill={SUN} stroke={INK} strokeWidth="2" />
    </SvgFrame>
  );
}

/* 21. YUNTA DE BUEYES (Tradición agrícola cochabambina) */
export function DibujoYuntaBueyes({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Yunta de bueyes">
      {/* Suelo labrado */}
      <path d="M6 54C22 52 42 52 58 54" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />
      {/* Cuerpo y cabeza del buey */}
      <path
        d="M14 32C14 26 20 24 34 24L40 20L48 23L46 31L39 33V48H33V39H21V48H15V32Z"
        fill={WOOD}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Cuernos blancos curvos y yugo de madera */}
      <path d="M40 20C38 14 42 11 45 13M46 21C50 15 54 14 55 18" stroke={INK} strokeWidth="2.8" strokeLinecap="round" />
      {/* Yugo y timón de arado */}
      <path d="M35 19H45" stroke={SUN} strokeWidth="4" strokeLinecap="round" />
      <path d="M36 22L10 49" stroke={INK} strokeWidth="3" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 22. CASA (Hogar campesino con techo de teja para "Volver / Inicio") */
export function DibujoCasa({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Inicio">
      {/* Paredes de adobe */}
      <path
        d="M15 30H49V54H15V30Z"
        fill={SUN_SOFT}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Techo de teja andina */}
      <path
        d="M8 32L32 12L56 32H8Z"
        fill={CLAY}
        stroke={INK}
        strokeWidth="3.3"
        strokeLinejoin="round"
      />
      {/* Puerta de madera arqueada */}
      <path
        d="M27 54V40C27 37 37 37 37 40V54H27Z"
        fill={WOOD}
        stroke={INK}
        strokeWidth="2.8"
      />
    </SvgFrame>
  );
}

/* 23. MANO QUE TOCA (Gesto claro de acción táctil) */
export function DibujoManoToca({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Tocar aquí">
      {/* Ondas de toque */}
      <path d="M22 16C25 11 35 11 38 16" stroke={WATER} strokeWidth="2.8" strokeLinecap="round" />
      <circle cx="30" cy="19" r="3" fill={SUN} />
      {/* Mano dibujada con línea cálida */}
      <path
        d="M27 20C27 17 33 17 33 20V32L43 34C47 35 49 39 48 44L45 54H23L19 44L14 38C12 36 15 33 18 35L27 40V20Z"
        fill={SUN_SOFT}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgFrame>
  );
}

/* 24. ALTAVOZ (Voz que lee en Quechua / Español) */
export function DibujoAltavoz({ size = 64, className = "", animated = false }) {
  return (
    <SvgFrame size={size} className={className} label="Escuchar en voz alta">
      {/* Cuerpo de corneta / altavoz */}
      <path
        d="M11 26H21L35 14V50L21 38H11V26Z"
        fill={SUN}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Ondas de voz */}
      <path
        d="M42 23C46 27 46 37 42 41"
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
        className={animated ? "tarpuy-speaker-wave-1" : ""}
      />
      <path
        d="M48 16C55 24 55 40 48 48"
        stroke={WATER}
        strokeWidth="3.4"
        strokeLinecap="round"
        className={animated ? "tarpuy-speaker-wave-2" : ""}
      />
    </SvgFrame>
  );
}

/* =====================================================================
 * ILUSTRACIONES DE NAVEGACIÓN (FASE 2: PESTAÑAS, MODO, GPS, SIN SEÑAL)
 * ===================================================================== */

/* 25. NUBE CON SOL (Pestaña Clima) */
export function DibujoNubeConSol({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Clima: nube con sol">
      {/* Sol detrás arriba a la izquierda */}
      <circle cx="23" cy="22" r="11" fill={SUN} stroke={INK} strokeWidth="3" />
      <path
        d="M23 5V9M9 22H5M12 11L9 8M34 11L37 8"
        stroke={INK}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Nube adelante */}
      <path
        d="M21 48H49C54.5 48 58 44 58 39C58 34.2 54.4 30.6 49.8 30.2C48.3 23.2 42 18.5 34.8 19C27.5 19.5 22.2 25 21.6 31.8C16.8 32.5 13.5 36.2 13.5 40.8C13.5 45.2 16.8 48 21 48Z"
        fill={CLOUD}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
    </SvgFrame>
  );
}

/* 26. MANO QUE SIEMBRA UNA SEMILLA (Pestaña Siembra) */
export function DibujoManoSiembra({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Siembra: mano que siembra una semilla">
      {/* Mano inclinada soltando semilla */}
      <path
        d="M10 18H28C33 18 37 21 38 25L42 27C44 28 43 32 39 32H25L18 27H10V18Z"
        fill={SUN_SOFT}
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Semilla dorada cayendo */}
      <path
        d="M36 35C39 35 41 38 40 41C39 44 35 45 33 43C31 41 32 35 36 35Z"
        fill={SUN}
        stroke={INK}
        strokeWidth="2.6"
      />
      {/* Surco de tierra abajo con brote pequeño */}
      <path
        d="M8 52C16 47 26 47 34 52C42 47 50 47 56 52V56H8V52Z"
        fill={EARTH_DRY}
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M22 48C22 43 17 41 16 44C15 47 19 48 22 48ZM22 48C22 43 27 41 28 44C29 47 25 48 22 48Z"
        fill={LEAF}
        stroke={INK}
        strokeWidth="2.2"
      />
    </SvgFrame>
  );
}

/* 27. CHACRA VISTA DESDE ARRIBA CON CAMINO (Pestaña Mapa) */
export function DibujoMapaChacra({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Mapa: chacra vista desde arriba con camino">
      {/* Marco de parcelas vistas desde arriba */}
      <rect
        x="9"
        y="9"
        width="46"
        height="46"
        rx="9"
        fill={LEAF_SOFT}
        stroke={INK}
        strokeWidth="3.2"
      />
      {/* Parcela de tierra labrada arriba izquierda */}
      <rect x="12" y="12" width="18" height="17" rx="3" fill={EARTH_DRY} stroke={INK} strokeWidth="2.2" />
      {/* Parcela cultivada abajo derecha */}
      <rect x="34" y="34" width="18" height="18" rx="3" fill={LEAF} stroke={INK} strokeWidth="2.2" />
      {/* Camino serpenteante que cruza la chacra */}
      <path
        d="M12 48C22 44 26 36 30 30C34 24 40 18 52 15"
        stroke={SUN_SOFT}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M12 48C22 44 26 36 30 30C34 24 40 18 52 15"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      {/* Punto "estás aquí" en ladrillo */}
      <circle cx="31" cy="29" r="5.5" fill={CLAY} stroke={INK} strokeWidth="2.5" />
    </SvgFrame>
  );
}

/* 28. CARTILLA CON GRÁFICO DIBUJADO (Pestaña Datos) */
export function DibujoCartillaGrafico({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Datos: cartilla con gráfico dibujado">
      {/* Hoja de cartilla */}
      <rect
        x="11"
        y="8"
        width="42"
        height="48"
        rx="6"
        fill={HIGHLIGHT}
        stroke={INK}
        strokeWidth="3.2"
      />
      {/* Barras dibujadas a mano (agua, cultivo, sol) */}
      <rect x="18" y="34" width="6" height="14" rx="1.5" fill={WATER} stroke={INK} strokeWidth="2.2" />
      <rect x="29" y="26" width="6" height="22" rx="1.5" fill={LEAF} stroke={INK} strokeWidth="2.2" />
      <rect x="40" y="20" width="6" height="28" rx="1.5" fill={SUN} stroke={INK} strokeWidth="2.2" />
      {/* Línea base y encabezado */}
      <path d="M16 48H48M18 15H36" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 29. LUPA DIBUJADA A MANO (Modo Avanzado) */
export function DibujoLupa({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Modo Avanzado: lupa">
      <circle
        cx="27"
        cy="27"
        r="15"
        fill={WATER_SOFT}
        stroke={INK}
        strokeWidth="3.4"
      />
      <path
        d="M21 22C23 19 27 18 31 20"
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M38 38L52 52"
        stroke={WOOD}
        strokeWidth="6.5"
        strokeLinecap="round"
      />
      <path
        d="M38 38L52 52"
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </SvgFrame>
  );
}

/* 30. PIN DE UBICACIÓN (Comunidad y GPS) */
export function DibujoPinUbicacion({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Ubicación y GPS">
      {/* Base de tierra */}
      <ellipse cx="32" cy="52" rx="16" ry="5" fill={SUN_SOFT} stroke={INK} strokeWidth="2.6" />
      {/* Pin en ladrillo ("estás aquí") */}
      <path
        d="M32 8C21.5 8 14 15.5 14 25C14 36.5 32 50 32 50C32 50 50 36.5 50 25C50 15.5 42.5 8 32 8Z"
        fill={CLAY}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="24" r="6.5" fill={SUN} stroke={INK} strokeWidth="2.6" />
    </SvgFrame>
  );
}

/* 31. ANTENA CON ONDAS (Estado sin internet / señal) */
export function DibujoAntenaOndas({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Antena con ondas">
      {/* Ondas tranquilas */}
      <path
        d="M18 18C12 24 12 34 18 40M46 18C52 24 52 34 46 40"
        stroke={WATER}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M24 23C20 27 20 31 24 35M40 23C44 27 44 31 40 35"
        stroke={LEAF}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Mástil y base de antena */}
      <circle cx="32" cy="28" r="4.5" fill={SUN} stroke={INK} strokeWidth="2.8" />
      <path
        d="M32 33V52M22 52H42M26 43H38"
        stroke={INK}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </SvgFrame>
  );
}

/* 32. TERMÓMETRO DE CALOR (--tierra para calor y sol) */
export function DibujoTermometroCalor({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Temperatura cálida">
      {/* Sol pequeño de apoyo */}
      <circle cx="46" cy="18" r="7" fill={SUN} stroke={INK} strokeWidth="2.5" />
      {/* Tubo y bulbo del termómetro */}
      <path
        d="M20 14C20 10.7 22.7 8 26 8C29.3 8 32 10.7 32 14V35.5C35.2 37.5 37 41 37 45C37 51.1 32.1 56 26 56C19.9 56 15 51.1 15 45C15 41 16.8 37.5 20 35.5V14Z"
        fill={HIGHLIGHT}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Columna en --tierra para calor */}
      <circle cx="26" cy="45" r="6.5" fill={EARTH_DRY} stroke={INK} strokeWidth="2" />
      <rect x="23.5" y="18" width="5" height="24" rx="2.5" fill={EARTH_DRY} />
      <path d="M35 16H39M35 23H38M35 30H39" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 33. TERMÓMETRO DE FRÍO (--cielo para frío y escarcha) */
export function DibujoTermometroFrio({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Temperatura fría">
      {/* Cristal de frío al lado */}
      <path
        d="M46 14V26M40 20H52M42 16L50 24M50 16L42 24"
        stroke={WATER}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Tubo y bulbo del termómetro */}
      <path
        d="M20 14C20 10.7 22.7 8 26 8C29.3 8 32 10.7 32 14V35.5C35.2 37.5 37 41 37 45C37 51.1 32.1 56 26 56C19.9 56 15 51.1 15 45C15 41 16.8 37.5 20 35.5V14Z"
        fill={HIGHLIGHT}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      {/* Columna baja en --cielo para frío */}
      <circle cx="26" cy="45" r="6.5" fill={WATER} stroke={INK} strokeWidth="2" />
      <rect x="23.5" y="30" width="5" height="12" rx="2.5" fill={WATER} />
      <path d="M35 16H39M35 23H38M35 30H39" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 34. LUNA Y ESCARCHA DE NOCHE (Para previsión nocturna) */
export function DibujoNocheLuna({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Noche y madrugada">
      <path
        d="M36 10C24 12 16 24 19 37C22 49 34 56 47 52C35 53 26 44 26 32C26 21 34 12 44 11C41 10 38.5 10 36 10Z"
        fill={SUN}
        stroke={INK}
        strokeWidth="3.2"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="22" r="2.8" fill={SUN} stroke={INK} strokeWidth="1.8" />
      <path d="M14 18V26M10 22H18" stroke={WATER} strokeWidth="2.6" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 35. SATÉLITE MIRANDO LA TIERRA (Sello: Dato real de satélite) */
export function DibujoSateliteReal({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Satélite: dato real">
      {/* Panel solar izquierdo */}
      <rect x="6" y="18" width="14" height="12" rx="2.5" fill={WATER} stroke={INK} strokeWidth="2.8" />
      <path d="M13 18V30M6 24H20" stroke={INK} strokeWidth="1.8" />
      {/* Panel solar derecho */}
      <rect x="44" y="18" width="14" height="12" rx="2.5" fill={WATER} stroke={INK} strokeWidth="2.8" />
      <path d="M51 18V30M44 24H58" stroke={INK} strokeWidth="1.8" />
      {/* Brazos de unión */}
      <path d="M20 24H25M39 24H44" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {/* Cuerpo central del satélite */}
      <rect x="25" y="15" width="14" height="18" rx="4" fill={SUN} stroke={INK} strokeWidth="3" />
      <circle cx="32" cy="24" r="3.5" fill={HIGHLIGHT} stroke={INK} strokeWidth="2.2" />
      {/* Antena y ondas hacia la chacra abajo */}
      <path d="M32 33V39" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <path d="M25 42C29 45 35 45 39 42" stroke={WATER} strokeWidth="2.8" strokeLinecap="round" />
      <path d="M20 48C27 52 37 52 44 48" stroke={LEAF} strokeWidth="2.8" strokeLinecap="round" />
      {/* Arco de tierra abajo */}
      <path d="M10 56C22 51 42 51 54 56" stroke={EARTH_DRY} strokeWidth="3.5" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 36. MODELO / ESTIMACIÓN CLIMÁTICA (Sello: Estimación por modelo) */
export function DibujoModeloEstimacion({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Modelo: estimación">
      {/* Tablero de cálculo / pronóstico */}
      <rect x="10" y="10" width="44" height="44" rx="8" fill={SUN_SOFT} stroke={INK} strokeWidth="3" />
      {/* Sol y nube arriba dentro del modelo */}
      <circle cx="22" cy="22" r="5.5" fill={SUN} stroke={INK} strokeWidth="2.4" />
      <path
        d="M30 27H45C48 27 50 25 50 22.5C50 20 48 18.2 45.5 18C44.5 15 41.5 13.5 38.5 14C35.5 14.5 33.5 17 33 19.8C30.5 20.2 29 22 29 24.2C29 26 30 27 30 27Z"
        fill={HIGHLIGHT}
        stroke={INK}
        strokeWidth="2.2"
      />
      {/* Curva punteada de estimación */}
      <path
        d="M16 44C22 36 28 46 35 37C40 31 44 35 48 31"
        stroke={INK}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
      <circle cx="16" cy="44" r="3" fill={WATER} stroke={INK} strokeWidth="2" />
      <circle cx="35" cy="37" r="3" fill={SUN} stroke={INK} strokeWidth="2" />
      <circle cx="48" cy="31" r="3.5" fill={LEAF} stroke={INK} strokeWidth="2" />
    </SvgFrame>
  );
}

/* 37. ESTUDIO REGIONAL DE SUELO (Sello: Dato de la zona) */
export function DibujoEstudioSuelo({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Estudio regional de suelo: dato de la zona">
      {/* Bloque de capas de tierra de la zona */}
      <rect x="10" y="18" width="38" height="36" rx="6" fill={EARTH_DRY} stroke={INK} strokeWidth="3" />
      {/* Capa vegetal superior */}
      <path d="M10 26H48" stroke={INK} strokeWidth="2.6" />
      <path d="M10 38H48" stroke={INK} strokeWidth="2.4" strokeDasharray="4 3" />
      {/* Brote arriba de la tierra */}
      <path
        d="M26 18V10M26 12C22 8 17 10 18 14C19 17 23 16 26 14ZM26 12C30 8 35 10 34 14C33 17 29 16 26 14Z"
        fill={LEAF}
        stroke={INK}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Lupa observando las capas del suelo */}
      <circle cx="43" cy="39" r="10" fill={HIGHLIGHT} stroke={INK} strokeWidth="3" />
      <circle cx="41" cy="38" r="2" fill={EARTH_WET} />
      <circle cx="46" cy="41" r="1.8" fill={SUN} />
      <path d="M50 46L57 53" stroke={INK} strokeWidth="4" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* 38. IMPRESORA CON CARTILLA (Botón Imprimir Cartilla) */
export function DibujoImpresora({ size = 64, className = "" }) {
  return (
    <SvgFrame size={size} className={className} label="Imprimir cartilla">
      {/* Hoja superior entrando */}
      <rect x="18" y="8" width="28" height="14" rx="3" fill={HIGHLIGHT} stroke={INK} strokeWidth="2.8" />
      {/* Cuerpo de la impresora */}
      <rect x="10" y="20" width="44" height="22" rx="6" fill={CLOUD} stroke={INK} strokeWidth="3.2" />
      {/* Botón indicador */}
      <circle cx="45" cy="28" r="3" fill={LEAF} stroke={INK} strokeWidth="2" />
      {/* Ranura de salida */}
      <path d="M16 36H48" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {/* Cartilla impresa saliendo abajo */}
      <rect x="17" y="36" width="30" height="20" rx="3" fill={HIGHLIGHT} stroke={INK} strokeWidth="3" />
      <path d="M22 43H42M22 49H35" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
    </SvgFrame>
  );
}

/* Catálogo completo de las 24 ilustraciones de la Fase 1 */
export const CATALOGO_ILUSTRACIONES = [
  { id: "sol", nombre: "Sol", Component: DibujoSol },
  { id: "nube", nombre: "Nube", Component: DibujoNube },
  { id: "lluvia", nombre: "Lluvia", Component: DibujoLluvia },
  { id: "helada", nombre: "Helada", Component: DibujoHelada },
  { id: "viento", nombre: "Viento", Component: DibujoViento },
  { id: "tierra_seca", nombre: "Tierra seca", Component: DibujoTierraSeca },
  { id: "tierra_humeda", nombre: "Tierra húmeda", Component: DibujoTierraHumeda },
  { id: "semilla", nombre: "Semilla", Component: DibujoSemilla },
  { id: "brote", nombre: "Brote", Component: DibujoBrote },
  { id: "planta_crecida", nombre: "Planta crecida", Component: DibujoPlantaCrecida },
  { id: "cosecha", nombre: "Cosecha", Component: DibujoCosecha },
  { id: "maiz", nombre: "Maíz", Component: DibujoMaiz },
  { id: "papa", nombre: "Papa", Component: DibujoPapa },
  { id: "haba", nombre: "Haba", Component: DibujoHaba },
  { id: "quinua", nombre: "Quinua", Component: DibujoQuinua },
  { id: "avena", nombre: "Avena", Component: DibujoAvena },
  { id: "gota_agua", nombre: "Gota de agua", Component: DibujoGotaAgua },
  { id: "riego_gravedad", nombre: "Riego por gravedad", Component: DibujoRiegoGravedad },
  { id: "riego_goteo", nombre: "Riego por goteo", Component: DibujoRiegoGoteo },
  { id: "tractor", nombre: "Tractor", Component: DibujoTractor },
  { id: "yunta_bueyes", nombre: "Yunta de bueyes", Component: DibujoYuntaBueyes },
  { id: "casa", nombre: "Casa", Component: DibujoCasa },
  { id: "mano_toca", nombre: "Mano que toca", Component: DibujoManoToca },
  { id: "altavoz", nombre: "Altavoz", Component: DibujoAltavoz },
];

export const CATALOGO_ILUSTRACIONES_NAVEGACION = [
  { id: "nube_con_sol", nombre: "Clima (Nube con sol)", Component: DibujoNubeConSol },
  { id: "mano_siembra", nombre: "Siembra (Mano con semilla)", Component: DibujoManoSiembra },
  { id: "mapa_chacra", nombre: "Mapa (Chacra con camino)", Component: DibujoMapaChacra },
  { id: "cartilla_grafico", nombre: "Datos (Cartilla con gráfico)", Component: DibujoCartillaGrafico },
  { id: "lupa", nombre: "Modo Avanzado (Lupa)", Component: DibujoLupa },
  { id: "pin_ubicacion", nombre: "Ubicación (Pin)", Component: DibujoPinUbicacion },
  { id: "antena_ondas", nombre: "Señal (Antena con ondas)", Component: DibujoAntenaOndas },
  { id: "termometro_calor", nombre: "Termómetro calor", Component: DibujoTermometroCalor },
  { id: "termometro_frio", nombre: "Termómetro frío", Component: DibujoTermometroFrio },
  { id: "noche_luna", nombre: "Noche y luna", Component: DibujoNocheLuna },
  { id: "satelite_real", nombre: "Satélite (Dato real)", Component: DibujoSateliteReal },
  { id: "modelo_estimacion", nombre: "Modelo (Estimación)", Component: DibujoModeloEstimacion },
  { id: "estudio_suelo", nombre: "Estudio regional de suelo", Component: DibujoEstudioSuelo },
  { id: "impresora", nombre: "Imprimir cartilla", Component: DibujoImpresora },
];

const MAPA_POR_ID = Object.fromEntries(
  [...CATALOGO_ILUSTRACIONES, ...CATALOGO_ILUSTRACIONES_NAVEGACION].map((item) => [
    item.id,
    item.Component,
  ])
);

export function IlustracionTarpuy({ id = "semilla", size = 64, className = "", animated = false }) {
  const Comp = MAPA_POR_ID[id] || DibujoSemilla;
  return <Comp size={size} className={className} animated={animated} />;
}
