import React from "react";
import { IlustracionTarpuy, DibujoAltavoz } from "../illustrations/TarpuyIllustrations.jsx";
import { SABERES_DEL_DIA_EJEMPLO } from "../../data/saberesDelDia.js";

/**
 * TARPUY NASA COCHABAMBA — ELEMENTOS VISUALES DE PARTE 2 (FASE 1C)
 * ================================================================
 * Construidos únicamente como componentes visuales con valores de ejemplo
 * por props y comentarios explícitos `TODO-FUNCIONALIDAD` para que el equipo
 * de desarrollo conecte la lógica real.
 *
 * Cero códigos hexadecimales sueltos: usa únicamente variables CSS de tokens.css.
 */

/* ============================================================================
 * 6. PAISAJE POR HORA (3 zonas × 4 momentos del día, dibujado por capas)
 * TODO-FUNCIONALIDAD: el equipo decide cómo se calcula el momento del día y la zona.
 * ============================================================================ */
export const ZONAS_PAISAJE = [
  { id: "cordillera", alias: "tapacari", nombre: "Cordillera (Tapacarí)", acento: "var(--piedra)" },
  { id: "valle", alias: "punata", nombre: "Valle Alto (Punata)", acento: "var(--dorado)" },
  { id: "selva", alias: "chapare", nombre: "Trópico / Selva (Chapare)", acento: "var(--hoja)" },
];

export const MOMENTOS_DIA = [
  { id: "amanecer", nombre: "Amanecer", saludo: "Claridad suave en la chacra" },
  { id: "mediodia", nombre: "Mediodía", saludo: "Sol alto sobre los surcos" },
  { id: "atardecer", nombre: "Atardecer", saludo: "Sol bajando tras los cerros" },
  { id: "noche", nombre: "Noche", saludo: "Luna y escarcha en la tierra" },
];

export function PaisajePorHora({
  momento = "amanecer", // 'amanecer' | 'mediodia' | 'atardecer' | 'noche'
  zona = "valle",       // 'cordillera'/'tapacari' | 'valle'/'punata' | 'selva'/'chapare'
  className = "",
}) {
  // TODO-FUNCIONALIDAD: el equipo decide cómo se calcula el momento del día y la zona.
  const zonaNormalizada =
    zona === "tapacari" || zona === "tapacari_zona_andina"
      ? "cordillera"
      : zona === "chapare" || zona === "chapare_tropico"
      ? "selva"
      : zona === "punata" || zona === "punata_valle_alto"
      ? "valle"
      : zona;

  const configuracionMomento = {
    amanecer: {
      cieloBg: "var(--dorado-suave)",
      etiqueta: "Amanecer",
      astro: "sol_bajo",
    },
    mediodia: {
      cieloBg: "var(--cielo-suave)",
      etiqueta: "Mediodía",
      astro: "sol_alto",
    },
    atardecer: {
      cieloBg: "var(--tierra-suave)",
      etiqueta: "Atardecer",
      astro: "sol_tarde",
    },
    noche: {
      cieloBg: "var(--cielo-oscuro)",
      etiqueta: "Noche (Luna y escarcha)",
      astro: "luna_escarcha",
    },
  };

  const estadoMomento = configuracionMomento[momento] || configuracionMomento.amanecer;
  const esNoche = momento === "noche";

  return (
    <div
      className={`tarpuy-card-physical overflow-hidden select-none ${className}`}
      role="img"
      aria-label={`Paisaje de ${zonaNormalizada} al ${estadoMomento.etiqueta}`}
    >
      <svg
        viewBox="0 0 360 150"
        className="w-full h-36 sm:h-40 block"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* CAPA 1: CIELO SEGÚN HORA DEL DÍA */}
        <rect x="0" y="0" width="360" height="150" fill={estadoMomento.cieloBg} />

        {/* CAPA 2: ASTRO (SOL O LUNA + ESTRELLAS) */}
        {estadoMomento.astro === "sol_bajo" && (
          <g>
            <circle
              cx="85"
              cy="76"
              r="22"
              fill="var(--dorado)"
              stroke="var(--tinta)"
              strokeWidth="2.6"
            />
            <path
              d="M85 44V36M55 60L48 55M115 60L122 55"
              stroke="var(--tinta)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {estadoMomento.astro === "sol_alto" && (
          <g>
            <circle
              cx="180"
              cy="34"
              r="20"
              fill="var(--dorado)"
              stroke="var(--tinta)"
              strokeWidth="2.6"
            />
            <path
              d="M180 6V11M180 57V62M150 34H155M205 34H210M158 14L162 18M198 50L202 54M202 14L198 18M162 50L158 54"
              stroke="var(--tinta)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        )}

        {estadoMomento.astro === "sol_tarde" && (
          <g>
            <circle
              cx="275"
              cy="74"
              r="23"
              fill="var(--alerta-cuidado)"
              stroke="var(--tinta)"
              strokeWidth="2.6"
            />
            <path
              d="M240 62H228M310 62H322M275 42V33"
              stroke="var(--tinta)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </g>
        )}

        {esNoche && (
          <g>
            {/* Luna creciente en crema cálido */}
            <path
              d="M275 20C264 22 258 33 261 44C264 55 275 61 286 58C276 59 268 51 268 40C268 30 275 22 284 21C281 20 278 20 275 20Z"
              fill="var(--tarjeta)"
              stroke="var(--tinta)"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
            {/* Estrellas sutiles */}
            <circle cx="65" cy="26" r="2.5" fill="var(--tarjeta)" />
            <circle cx="135" cy="19" r="2" fill="var(--dorado-suave)" />
            <circle cx="205" cy="30" r="2.5" fill="var(--tarjeta)" />
            {/* Cristales de escarcha nocturna en el aire */}
            <g stroke="var(--tarjeta)" strokeWidth="2" strokeLinecap="round">
              <path d="M98 40V54M91 47H105M93 42L103 52M103 42L93 52" />
              <path d="M168 44V56M162 50H174" />
            </g>
          </g>
        )}

        {/* CAPA 3: RELIEVE DE FONDO SEGÚN ZONA (CORDILLERA / VALLE / SELVA) */}
        {zonaNormalizada === "cordillera" && (
          <g>
            {/* Cumbres altas y escarpadas de Tapacarí */}
            <path
              d="M-10 118L55 48L118 96L185 38L255 98L312 52L370 118Z"
              fill="var(--piedra)"
              stroke="var(--tinta)"
              strokeWidth="2.8"
              strokeLinejoin="round"
            />
            {/* Cumbres nevadas / escarchadas */}
            <path
              d="M55 48L39 65L55 61L71 65Z"
              fill="var(--tarjeta)"
              stroke="var(--tinta)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M185 38L165 59L185 53L204 59Z"
              fill="var(--tarjeta)"
              stroke="var(--tinta)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>
        )}

        {zonaNormalizada === "valle" && (
          <g>
            {/* Colinas suaves del Valle Alto (Punata) y casita de adobe */}
            <path
              d="M-10 116C45 68 115 68 175 98C230 66 300 66 370 116Z"
              fill="var(--piedra-suave)"
              stroke="var(--tinta)"
              strokeWidth="2.6"
            />
            {/* Pequeña casa de adobe con techo ladrillo */}
            <rect
              x="228"
              y="84"
              width="26"
              height="18"
              fill="var(--tarjeta)"
              stroke="var(--tinta)"
              strokeWidth="2.2"
            />
            <polygon
              points="224,85 241,72 258,85"
              fill="var(--ladrillo)"
              stroke="var(--tinta)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </g>
        )}

        {zonaNormalizada === "selva" && (
          <g>
            {/* Montes verdes densos y río serpenteante del Chapare */}
            <path
              d="M-10 116C35 64 95 62 145 94C195 58 275 58 370 116Z"
              fill="var(--hoja)"
              stroke="var(--tinta)"
              strokeWidth="2.6"
            />
            {/* Copas de árboles tropicales */}
            <circle cx="72" cy="84" r="14" fill="var(--hoja-oscura)" stroke="var(--tinta)" strokeWidth="2.2" />
            <circle cx="92" cy="88" r="11" fill="var(--hoja)" stroke="var(--tinta)" strokeWidth="2.2" />
            <circle cx="285" cy="84" r="14" fill="var(--hoja-oscura)" stroke="var(--tinta)" strokeWidth="2.2" />
          </g>
        )}

        {/* CAPA 4: PRIMER PLANO DE SURCOS / CHACRA (con escarcha si es de noche) */}
        <path
          d="M0 106C110 98 250 98 360 106V150H0V106Z"
          fill={zonaNormalizada === "selva" ? "var(--hoja-suave)" : "var(--tierra)"}
          stroke="var(--tinta)"
          strokeWidth="2.8"
        />
        {/* Líneas de surcos */}
        <path
          d="M35 150L95 104M135 150L165 102M235 150L215 102M325 150L275 104"
          stroke="var(--tinta)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Escarcha blanca sobre los surcos cuando es de noche */}
        {esNoche && (
          <g>
            <path
              d="M16 115H110M145 113H245M265 116H342"
              stroke="var(--tarjeta)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="6 6"
            />
            <path
              d="M48 130V140M43 135H53M190 128V138M185 133H195M300 129V139M295 134H305"
              stroke="var(--tarjeta)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>

      {/* Pie informativo de la tarjeta de paisaje */}
      <div
        className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-sm font-extrabold"
        style={{
          backgroundColor: "var(--tarjeta)",
          borderTop: "var(--border-width-medium) solid var(--tinta)",
          color: "var(--tinta)",
        }}
      >
        <span>Zona: {zonaNormalizada.toUpperCase()}</span>
        <span
          className="px-2.5 py-0.5 rounded-full"
          style={{
            backgroundColor: "var(--arena)",
            border: "1.5px solid var(--tinta)",
          }}
        >
          {estadoMomento.etiqueta}
        </span>
      </div>
    </div>
  );
}

/* ============================================================================
 * 7. MI CHACRA (Dibujo pequeño que recibe `cultivo` y `etapa`)
 * TODO-FUNCIONALIDAD: conectar con el cultivo y la etapa reales.
 * ============================================================================ */
export const ETAPAS_MI_CHACRA = [
  { id: "semilla", nombre: "1. Semilla en surco", dibujoId: "semilla" },
  { id: "brote", nombre: "2. Brote tierno", dibujoId: "brote" },
  { id: "planta", nombre: "3. Planta crecida", dibujoId: "planta_crecida" },
  { id: "cosecha", nombre: "4. Lista para cosecha", dibujoId: "cosecha" },
];

export const CULTIVOS_MI_CHACRA = [
  { id: "papa", nombre: "Papa" },
  { id: "maiz", nombre: "Maíz" },
  { id: "haba", nombre: "Haba" },
  { id: "quinua", nombre: "Quinua" },
  { id: "avena", nombre: "Avena" },
];

export function MiChacra({
  cultivo = "papa", // 'papa' | 'maiz' | 'haba' | 'quinua' | 'avena'
  etapa = "brote",  // 'semilla' | 'brote' | 'planta' | 'cosecha'
  className = "",
}) {
  // TODO-FUNCIONALIDAD: conectar con el cultivo y la etapa reales.
  const etapaInfo = ETAPAS_MI_CHACRA.find((e) => e.id === etapa) || ETAPAS_MI_CHACRA[1];
  const cultivoInfo = CULTIVOS_MI_CHACRA.find((c) => c.id === cultivo) || CULTIVOS_MI_CHACRA[0];

  return (
    <div
      className={`tarpuy-card-physical p-4 flex items-center gap-4 select-none ${className}`}
      style={{ backgroundColor: "var(--tarjeta)" }}
    >
      {/* Mini escena de surco con el cultivo y la etapa */}
      <div
        className="w-24 h-24 rounded-2xl flex flex-col items-center justify-between p-2 shrink-0 overflow-hidden"
        style={{
          backgroundColor: "var(--hoja-suave)",
          border: "var(--border-width-medium) solid var(--tinta)",
        }}
      >
        <div className="flex items-center justify-center gap-1">
          <IlustracionTarpuy id={etapaInfo.dibujoId} size={46} />
          <IlustracionTarpuy id={cultivoInfo.id} size={34} />
        </div>
        {/* Surco de tierra en la base */}
        <div
          className="w-full h-3 rounded-full"
          style={{
            backgroundColor: "var(--tierra)",
            border: "1.5px solid var(--tinta)",
          }}
          aria-hidden="true"
        />
      </div>

      <div className="space-y-1 text-left">
        <span
          className="inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide"
          style={{
            backgroundColor: "var(--dorado-suave)",
            color: "var(--dorado-oscuro)",
            border: "1.5px solid var(--tinta)",
          }}
        >
          Mi Chacra · {cultivoInfo.nombre}
        </span>
        <h4 className="font-extrabold" style={{ fontSize: "var(--font-size-body)" }}>
          {etapaInfo.nombre}
        </h4>
        <p className="text-sm font-bold" style={{ color: "var(--tinta-suave)" }}>
          Cultivo: {cultivoInfo.nombre} · Etapa: {etapa}
        </p>
      </div>
    </div>
  );
}

/* ============================================================================
 * 8. SABER DEL DÍA (Tarjeta ilustrada que recibe un texto por prop)
 * TODO-FUNCIONALIDAD: origen y rotación de las frases.
 * ============================================================================ */
export function TarjetaSaberDelDia({
  titulo = SABERES_DEL_DIA_EJEMPLO[0].tituloEs,
  texto = SABERES_DEL_DIA_EJEMPLO[0].textoEs,
  textoQuechua = SABERES_DEL_DIA_EJEMPLO[0].textoQu,
  dibujoId = SABERES_DEL_DIA_EJEMPLO[0].dibujoId,
  pendienteValidacionComunidad = SABERES_DEL_DIA_EJEMPLO[0].pendienteValidacionComunidad,
  mostrarQuechua = false,
  className = "",
}) {
  // TODO-FUNCIONALIDAD: origen y rotación de las frases.
  return (
    <article
      className={`tarpuy-card-physical p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 ${className}`}
      style={{ backgroundColor: "var(--dorado-suave)" }}
    >
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          backgroundColor: "var(--tarjeta)",
          border: "var(--border-width-medium) solid var(--tinta)",
        }}
      >
        <IlustracionTarpuy id={dibujoId} size={60} />
      </div>

      <div className="space-y-2 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider"
            style={{
              backgroundColor: "var(--tarjeta)",
              color: "var(--dorado-oscuro)",
              border: "1.5px solid var(--tinta)",
            }}
          >
            Saber del día
          </span>

          {pendienteValidacionComunidad && (
            <span
              className="px-3 py-0.5 rounded-full text-xs font-extrabold"
              style={{
                backgroundColor: "var(--ladrillo-suave)",
                color: "var(--ladrillo-oscuro)",
                border: "1.5px solid var(--tinta)",
              }}
            >
              Validar con la comunidad
            </span>
          )}
        </div>

        <h3 className="tarpuy-subtitle">{titulo}</h3>
        <p className="tarpuy-body">{mostrarQuechua && textoQuechua ? textoQuechua : texto}</p>
      </div>
    </article>
  );
}

/* ============================================================================
 * 9. SONIDO Y TACTO (Solo diseño del botón "Sonido" activo/apagado)
 * TODO-FUNCIONALIDAD: conectar el audio y la vibración con el equipo.
 * ============================================================================ */
export function BotonSonido({
  activo = true,
  onToggle,
  className = "",
}) {
  // TODO-FUNCIONALIDAD: conectar el audio de respuesta y la vibración (navigator.vibrate) al tocar.
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={activo}
      aria-label={activo ? "Sonido activado. Toca para apagar" : "Sonido apagado. Toca para activar"}
      className={`tarpuy-btn-physical ${
        activo ? "tarpuy-btn-physical--water" : "tarpuy-btn-physical--secondary"
      } inline-flex items-center justify-center gap-3.5 px-5 py-3 cursor-pointer ${className}`}
    >
      <span
        className="w-11 h-11 rounded-xl flex items-center justify-center relative shrink-0"
        style={{
          backgroundColor: "var(--tarjeta)",
          border: "var(--border-width-medium) solid var(--tinta)",
        }}
      >
        <DibujoAltavoz size={34} animated={false} />
        {!activo && (
          <svg
            viewBox="0 0 40 40"
            className="w-full h-full absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <path
              d="M8 8L32 32"
              stroke="var(--alerta-critico)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>

      <span className="text-left leading-tight">
        <span className="block font-extrabold" style={{ fontSize: "var(--font-size-body)" }}>
          {activo ? "Sonido: Sí" : "Sonido: No"}
        </span>
      </span>
    </button>
  );
}
