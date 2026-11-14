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

const MAPA_POR_ID = Object.fromEntries(
  CATALOGO_ILUSTRACIONES.map((item) => [item.id, item.Component])
);

export function IlustracionTarpuy({ id = "semilla", size = 64, className = "", animated = false }) {
  const Comp = MAPA_POR_ID[id] || DibujoSemilla;
  return <Comp size={size} className={className} animated={animated} />;
}
