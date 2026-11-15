import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";

const GLOSSARY = [
  {
    term: "Verdor de plantas (NDVI satélite)",
    plain: "Mide si la parcela está cubierta con plantas verdes o si la tierra está en descanso, sin cobertura, sufriendo con el sol.",
    icon: "planta_crecida",
  },
  {
    term: "Humedad en tierra (SMAP NASA)",
    plain: "Cuánta agua queda guardada debajo de los surcos, hasta las raíces.",
    icon: "tierra_humeda",
  },
  {
    term: "Evaporación (ET0)",
    plain: "El agua que el sol fuerte y el viento le chupan cada día a tu parcela.",
    icon: "sol",
  },
  {
    term: "Abono natural (Fijar nitrógeno)",
    plain: "Haba, tarwi, arveja, vicia y alfalfa dejan alimento gratis en sus raíces para el próximo cultivo.",
    icon: "haba",
  },
  {
    term: "Solo con lluvia (Secano)",
    plain: "Parcela que depende únicamente de las lluvias de temporada, sin canal ni pozo.",
    icon: "lluvia",
  },
];

const THREE_ORIGIN_SEALS = [
  {
    id: "satelite",
    illus: "satelite_real",
    badge: "Satélite = dato real",
    badgeQu: "Satélite = chiqaq tupuy",
    phrase: "Medido de verdad desde el cielo por los satélites de la NASA.",
    phraseQu: "Hanaq pachamanta NASA satélitekuna chiqaqta tupusqan.",
    bg: "var(--cielo-suave)",
    accent: "var(--cielo-oscuro)",
  },
  {
    id: "modelo",
    illus: "modelo_estimacion",
    badge: "Modelo = estimación",
    badgeQu: "Modelo = watuy",
    phrase: "Cálculo del tiempo que se espera para los próximos días.",
    phraseQu: "Qhipa p'unchawkunapaq imaynachus pacha kananta yupay.",
    bg: "var(--dorado-suave)",
    accent: "var(--dorado-oscuro)",
  },
  {
    id: "suelo",
    illus: "estudio_suelo",
    badge: "Estudio regional de suelo = dato de la zona",
    badgeQu: "Suyu allpa = ayllup allpan",
    phrase: "Estudios de la tierra hechos en los valles y punas de Cochabamba.",
    phraseQu: "Quchapampa ayllukunapi allpamanta yachaqkunaq qhawarisqan.",
    bg: "var(--tierra-suave)",
    accent: "var(--tierra-oscura)",
  },
];

const DEFAULT_MANIFEST = [
  {
    layer: "nasa_climatology_30yr",
    status_badge: "HISTORIA NASA · 30 AÑOS",
    title_es: "Calendario de Lluvias y Frío de Cada Mes",
    source: "NASA POWER Climatology API (promedios históricos multianuales)",
    updated: "Base histórica fija",
    honest_note: "Sirve para planificar rotaciones de todo el año, pero no predice tormentas o heladas de esta semana.",
  },
  {
    layer: "nasa_recent_daily",
    status_badge: "SATÉLITE NASA RECIENTE",
    title_es: "Observación Diaria NASA POWER (últimos días disponibles)",
    source: "NASA POWER Daily API (radiación solar y humedad superficial satelital)",
    updated: "Retraso satelital normal de 2 a 4 días",
    honest_note: "Son mediciones reales ya ocurridas desde satélite (rejilla ~50 km); no incluye días futuros ni valores faltantes (-999).",
  },
  {
    layer: "live_forecast",
    status_badge: "EN VIVO · HOY + 7 DÍAS",
    title_es: "Clima Actual y Pronóstico de 7 Días",
    source: "Open-Meteo (modelos meteorológicos globales calibrados por altura)",
    updated: "Sincronización diaria",
    honest_note: "Muestra lluvia, temperatura y viento esperados esta semana en tu zona; la lluvia exacta puede variar entre quebradas vecinas.",
  },
  {
    layer: "regional_soil_ndvi_baseline",
    status_badge: "ESTUDIO REGIONAL DE SUELO",
    title_es: "Suelo Regional y Cobertura Verde (NDVI / Pairumani)",
    source: "ISRIC SoilGrids 250m, FAO GAEZ v4, Centro Pairumani y referencia MODIS/Sentinel",
    updated: "Referencia estacional regional",
    honest_note: "Refleja el suelo típico del municipio. Tu parcela puede cambiar según riego, estiércol y pendiente; revisa un puñado de tierra antes de sembrar.",
  },
];

function resolveOriginSeal(item = {}) {
  const layer = (item.layer || "").toLowerCase();
  const src = `${item.source || ""} ${item.status_badge || ""} ${item.title_es || ""}`.toLowerCase();
  if (layer.includes("soil") || src.includes("suelo") || src.includes("soilgrids") || src.includes("pairumani")) {
    return {
      ...THREE_ORIGIN_SEALS[2],
      simpleSentence: "Dato de la zona: muestra cómo es la tierra típica de tu municipio.",
    };
  }
  if (layer.includes("forecast") || src.includes("modelo") || src.includes("open-meteo") || src.includes("pronóstico")) {
    return {
      ...THREE_ORIGIN_SEALS[1],
      simpleSentence: "Estimación por modelo: avisa qué tiempo se espera en los próximos 7 días.",
    };
  }
  return {
    ...THREE_ORIGIN_SEALS[0],
    simpleSentence: "Dato real de satélite: medido desde el espacio sobre Cochabamba.",
  };
}

export default function DataVeracityCard({ manifest = [], isAdvanced = true, lang = "es" }) {
  const [showGlossary, setShowGlossary] = useState(false);
  const [showTechDetailsInEasy, setShowTechDetailsInEasy] = useState(false);
  const isQu = lang === "qu";
  const items = manifest && manifest.length > 0 ? manifest : DEFAULT_MANIFEST;
  const showFullTech = isAdvanced || showTechDetailsInEasy;

  return (
    <section
      className="tarpuy-card-physical p-5 sm:p-7 space-y-6"
      style={{
        backgroundColor: "var(--tarjeta)",
        borderColor: "var(--tinta)",
      }}
      aria-label="Origen y veracidad de los datos"
    >
      {/* Cabecera */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 pb-4"
        style={{ borderBottom: "var(--tarpuy-border-thin) solid var(--tinta)" }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "var(--hoja-suave)",
              border: "var(--tarpuy-border-thin) solid var(--tinta)",
            }}
          >
            <IlustracionTarpuy id="satelite_real" size={44} />
          </div>
          <div>
            <h3
              className="font-extrabold"
              style={{
                fontFamily: "var(--tarpuy-font-display)",
                fontSize: "var(--tarpuy-text-subtitle)",
                color: "var(--tinta)",
              }}
            >
              {isQu
                ? "¿Maymantataq kay willaykuna lluqsin?"
                : "¿De dónde salen estos datos?"}
            </h3>
            <p
              className="font-bold mt-0.5"
              style={{
                color: "var(--tinta-suave)",
                fontSize: "var(--tarpuy-text-body-min)",
              }}
            >
              {isQu
                ? "Kimsa unanchakuna willasunki maymantachus sapa tupuy jamun."
                : "Cada dato lleva un sello dibujado para saber si viene de satélite, modelo o suelo."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowGlossary((p) => !p)}
          className="no-print min-h-[64px] w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold cursor-pointer transition-all"
          style={{
            backgroundColor: showGlossary ? "var(--dorado-suave)" : "var(--arena)",
            color: "var(--tinta)",
            border: "2px solid var(--tinta)",
            boxShadow: "0 3px 0 0 var(--tinta)",
            fontSize: "1.05rem",
          }}
        >
          <IlustracionTarpuy id="cartilla_grafico" size={28} />
          <span>{showGlossary ? "Ocultar palabras fáciles" : "Ver palabras fáciles"}</span>
          {showGlossary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {/* Los 3 Sellos Dibujados del Origen del Dato (sin bordes gruesos en elementos informativos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {THREE_ORIGIN_SEALS.map((seal) => (
          <div
            key={seal.id}
            className="rounded-2xl p-4 flex items-start gap-3.5"
            style={{ backgroundColor: seal.bg }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--tarjeta)" }}
            >
              <IlustracionTarpuy id={seal.illus} size={46} />
            </div>
            <div className="space-y-1">
              <span
                className="inline-block px-2.5 py-0.5 rounded-full font-bold"
                style={{
                  backgroundColor: "var(--tarjeta)",
                  color: seal.accent,
                  fontSize: "0.9rem",
                }}
              >
                {isQu ? seal.badgeQu : seal.badge}
              </span>
              <p
                className="font-normal leading-snug"
                style={{
                  color: "var(--tinta)",
                  fontSize: "var(--tarpuy-text-body-min)",
                }}
              >
                {isQu ? seal.phraseQu : seal.phrase}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Tarjetas de cada fuente de datos con su sello dibujado y frase simple (sin cajas dentro de cajas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const seal = resolveOriginSeal(item);
          return (
            <div
              key={item.layer || item.title_es}
              className="rounded-2xl p-4 sm:p-5 space-y-3"
              style={{ backgroundColor: "var(--arena)" }}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: seal.bg }}
                >
                  <IlustracionTarpuy id={seal.illus} size={40} />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full font-bold"
                      style={{
                        backgroundColor: seal.bg,
                        color: seal.accent,
                        fontSize: "0.85rem",
                      }}
                    >
                      {seal.badge}
                    </span>
                    <span
                      className="inline-block px-2.5 py-0.5 rounded-full font-medium"
                      style={{
                        backgroundColor: "var(--tarjeta)",
                        color: "var(--tinta-suave)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {item.status_badge}
                    </span>
                  </div>
                  <h4
                    className="font-bold leading-snug"
                    style={{
                      fontFamily: "var(--tarpuy-font-display)",
                      fontSize: "1.2rem",
                      color: "var(--tinta)",
                    }}
                  >
                    {item.title_es}
                  </h4>
                </div>
              </div>

              {/* Frase simple siempre visible */}
              <p
                className="font-medium px-3.5 py-2.5 rounded-xl"
                style={{
                  backgroundColor: "var(--tarjeta)",
                  color: "var(--tinta)",
                  fontSize: "var(--tarpuy-text-body-min)",
                }}
              >
                {seal.simpleSentence}
              </p>

              {/* Detalle técnico completo (visible en Modo Avanzado o al desplegar en Modo Fácil) */}
              {showFullTech ? (
                <div
                  className="space-y-1.5 pt-2"
                  style={{
                    borderTop: "1.5px dashed var(--piedra)",
                    fontSize: "1rem",
                  }}
                >
                  <p className="font-extrabold" style={{ color: "var(--hoja-oscura)" }}>
                    Fuente técnica: {item.source}
                  </p>
                  {item.updated ? (
                    <p className="font-bold" style={{ color: "var(--tinta-suave)" }}>
                      Actualización: {item.updated}
                    </p>
                  ) : null}
                  <p className="font-medium leading-relaxed" style={{ color: "var(--tinta)" }}>
                    {item.honest_note}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* En Modo Fácil, botón para desplegar las notas técnicas completas sin perder nada */}
      {!isAdvanced ? (
        <div className="no-print">
          <button
            type="button"
            onClick={() => setShowTechDetailsInEasy((prev) => !prev)}
            className="w-full min-h-[64px] px-4 py-3 rounded-2xl font-bold flex items-center justify-between gap-3 cursor-pointer"
            style={{
              backgroundColor: "var(--arena)",
              color: "var(--tinta)",
              border: "2px solid var(--tinta)",
              boxShadow: "0 3px 0 0 var(--tinta)",
              fontSize: "var(--tarpuy-text-body-min)",
            }}
          >
            <span>
              {showTechDetailsInEasy
                ? "Ocultar fuentes técnicas detalladas"
                : "Ver fuentes técnicas completas (NASA POWER, SMAP, SoilGrids)"}
            </span>
            {showTechDetailsInEasy ? <ChevronUp className="w-6 h-6 shrink-0" /> : <ChevronDown className="w-6 h-6 shrink-0" />}
          </button>
        </div>
      ) : null}

      {/* Diccionario simple desplegable */}
      {showGlossary ? (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{
            backgroundColor: "var(--hoja-suave)",
            border: "var(--tarpuy-border-medium) solid var(--tinta)",
          }}
        >
          <h4
            className="font-extrabold"
            style={{
              fontFamily: "var(--tarpuy-font-display)",
              fontSize: "1.35rem",
              color: "var(--tinta)",
            }}
          >
            Palabras del Campo y del Satélite Explicadas Fácil
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {GLOSSARY.map((g) => (
              <div
                key={g.term}
                className="p-4 rounded-xl flex items-start gap-3"
                style={{
                  backgroundColor: "var(--tarjeta)",
                  border: "var(--tarpuy-border-thin) solid var(--tinta)",
                }}
              >
                <IlustracionTarpuy id={g.icon} size={36} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong
                    className="block font-extrabold"
                    style={{
                      color: "var(--hoja-oscura)",
                      fontSize: "var(--tarpuy-text-body-min)",
                    }}
                  >
                    {g.term}
                  </strong>
                  <span
                    className="block font-medium leading-relaxed"
                    style={{
                      color: "var(--tinta)",
                      fontSize: "1rem",
                    }}
                  >
                    {g.plain}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
