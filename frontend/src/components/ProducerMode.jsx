import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import PrioritySelectorGrid from "../features/producer/PrioritySelectorGrid.jsx";
import RotationCard from "../features/producer/RotationCard.jsx";
import { CropIllustration } from "../features/producer/FarmPictograms.jsx";
import { BotonGrande } from "./ui/TarpuyBaseComponents.jsx";
import { PatronPantalla, SelloCartilla } from "./personality/PatronesYSellos.jsx";
import { IlustracionTarpuy } from "./illustrations/TarpuyIllustrations.jsx";
import { tr } from "../utils/quechuaI18n.js";

/**
 * TARPUY NASA COCHABAMBA — PANTALLA DE SIEMBRA Y ROTACIONES (FASE 4)
 * ==================================================================
 * Mismo motor agronómico, mismos datos y mismo estado:
 * - Conversación guiada con dibujos en 4 bloques numerados + botón "Ver mi plan".
 * - Patrón fijo de Siembra: <PatronPantalla tipo="terrazas" />.
 * - Las 3 estrategias ordenadas como tarjetas grandes:
 *   1. "La mejor para ti" (con estrella en --dorado)
 *   2. "Otra buena opción"
 *   3. "Como siempre se hizo" (línea base)
 * - Cero códigos hexadecimales sueltos.
 */

export default function ProducerMode({
  zone,
  activeZoneId,
  crops = [],
  cropId,
  onChangeCrop,
  priorities = [],
  onChangePriorities,
  irrigation,
  onChangeIrrigation,
  equipment,
  onChangeEquipment,
  strategies = [],
  onSpeak,
  activeAudioKey,
  isCalculating = false,
  isAdvanced = false,
  lang = "es",
  onDetectGps,
  onOpenMap,
  municipalChip = null,
  municipalTip = null,
  municipalContext = null,
}) {
  const currentZoneId = activeZoneId || zone?.zone_id || "punata_valle_alto";
  const indicators = zone?.monthly_harmonized_indicators || [];
  const chip = municipalChip || municipalContext?.label_es;
  const tip = municipalTip || municipalContext?.tip_es;
  const resultadosRef = useRef(null);
  const qu = lang === "qu";

  /* Orden: 1. La mejor para ti, 2. Otra buena opción, 3. Como siempre se hizo (baseline) */
  const ordered = [
    ...strategies.filter((s) => s.strategy_type !== "current_baseline"),
    ...strategies.filter((s) => s.strategy_type === "current_baseline"),
  ];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showComparison, setShowComparison] = useState(true);

  useEffect(() => {
    setSelectedIdx(0);
  }, [cropId, irrigation, priorities]);

  const shownStrategy = ordered[selectedIdx] || ordered[0];

  const handleVerMiPlan = () => {
    setShowComparison(true);
    if (resultadosRef.current) {
      resultadosRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const tabInfo = (s, idx) => {
    const isBase = s.strategy_type === "current_baseline";
    if (isBase) {
      return {
        etiqueta: qu ? "3. Ñawpaqman jina" : "3. Como siempre se hizo",
        sub: qu ? "Allpa sayk'uchiq" : "Para comparar con tu práctica actual",
        bg: "var(--alerta-cuidado-suave)",
        estrella: false,
      };
    }
    if (idx === 0) {
      return {
        etiqueta: qu ? "1. Aswan allin qampaq" : "1. La mejor para ti",
        sub: qu ? "Chakraykipaq akllasqa" : "Opción óptima recomendada",
        bg: "var(--dorado-suave)",
        estrella: true,
      };
    }
    return {
      etiqueta: qu ? "2. Wakin allin tarpuy" : "2. Otra buena opción",
      sub: qu ? "Iskay ñiqin yanapa" : "Alternativa recomendada",
      bg: "var(--hoja-suave)",
      estrella: false,
    };
  };

  return (
    <div className="space-y-8" data-zona={currentZoneId}>
      {/* Cabecera de la Pantalla de Siembra */}
      <div className="tarpuy-card-physical p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <span
            className="inline-block px-3 py-0.5 rounded-full text-sm font-extrabold uppercase tracking-wider"
            style={{
              backgroundColor: "var(--acento-zona-suave)",
              color: "var(--acento-zona-oscuro)",
              border: "1.5px solid var(--tinta)",
            }}
          >
            {tr(lang, "rotationSubtitle")} · {zone?.name || currentZoneId}
          </span>
          <h2 className="tarpuy-title">{tr(lang, "rotationTitle")}</h2>
          {chip ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-[#7E57C2]/15 text-[#4A148C] border border-[#7E57C2]/40 px-3 py-1 text-xs font-bold">
                {chip}
              </span>
              {tip ? <span className="text-xs text-slate-600 max-w-xl">{tip}</span> : null}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <BotonGrande
            variante="secundario"
            ilustracionId="pin_ubicacion"
            texto={tr(lang, "myGps")}
            onClick={onDetectGps}
          />
          <BotonGrande
            variante="secundario"
            ilustracionId="mapa_chacra"
            texto={tr(lang, "map")}
            onClick={onOpenMap}
          />
          <a
            href={`/api/poster/${currentZoneId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="tarpuy-btn-physical tarpuy-btn-physical--secondary inline-flex items-center justify-center gap-3 px-5 py-3 no-underline"
          >
            <span
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "var(--tarjeta)",
                border: "var(--border-width-medium) solid var(--tinta)",
              }}
            >
              <IlustracionTarpuy id="cartilla_grafico" size={34} />
            </span>
            <span className="font-extrabold">{tr(lang, "posterBtn")}</span>
          </a>
        </div>
      </div>

      {/* Patrón fijo de Siembra: Terrazas agrícolas */}
      <PatronPantalla tipo="terrazas" />

      {/* 1. LAS 4 PREGUNTAS CONVERSACIONALES + 2. BOTÓN GRANDE "VER MI PLAN" */}
      <PrioritySelectorGrid
        crops={crops}
        cropId={cropId}
        onChangeCrop={onChangeCrop}
        priorities={priorities}
        onChangePriorities={onChangePriorities}
        irrigation={irrigation}
        onChangeIrrigation={onChangeIrrigation}
        equipment={equipment}
        onChangeEquipment={onChangeEquipment}
        onVerPlan={handleVerMiPlan}
        isAdvanced={isAdvanced}
        lang={lang}
      />

      {/* Patrón fijo de Siembra antes de los resultados */}
      <PatronPantalla tipo="terrazas" />

      {/* 3. LOS RESULTADOS (Las 3 estrategias ordenadas) */}
      <div ref={resultadosRef} className="space-y-6">
        {isCalculating ? (
          <div className="tarpuy-card-physical p-10 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--hoja-oscura)" }} />
            <p className="tarpuy-subtitle">{tr(lang, "calculating")}</p>
          </div>
        ) : ordered.length > 0 && shownStrategy ? (
          <div className="space-y-6">
            {/* Encabezado de resultados + Sello de Cartilla de Fase 1C */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="tarpuy-title">
                  {qu ? "Chakraykipaq 3 tarpuy ñankuna" : "Tus 3 opciones de siembra"}
                </h3>
                <p className="tarpuy-body font-bold" style={{ color: "var(--tinta-suave)" }}>
                  {qu
                    ? " hukta ñit'iy 12 killa tarpuyta rikunapaq"
                    : "Toca cualquiera de las 3 tarjetas para ver su calendario de 12 meses"}
                </p>
              </div>

              <SelloCartilla
                texto={qu ? "Tarpuy wakichisqa" : "Plan de siembra listo"}
                subtitulo={zone?.name || currentZoneId}
                color="dorado"
              />
            </div>

            {/* Selector visual de las 3 estrategias (La mejor para ti, Otra buena opción, Como siempre se hizo) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {ordered.map((s, idx) => {
                const info = tabInfo(s, idx);
                const activa = selectedIdx === idx;
                const primerCultivo = s.crop_sequence?.[0] || { crop_id: cropId };

                return (
                  <button
                    key={s.strategy_id || idx}
                    type="button"
                    aria-pressed={activa}
                    onClick={() => setSelectedIdx(idx)}
                    className={`tarpuy-btn-physical ${
                      activa ? "tarpuy-btn-physical--pressed" : ""
                    } p-4 flex flex-col justify-between gap-3 text-left cursor-pointer`}
                    style={{
                      minHeight: "148px",
                      backgroundColor: activa ? info.bg : "var(--tarjeta)",
                      color: "var(--tinta)",
                      outline: activa ? "3px solid var(--tinta)" : "none",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-extrabold uppercase tracking-wide"
                        style={{
                          backgroundColor: info.bg,
                          color: "var(--tinta)",
                          border: "1.5px solid var(--tinta)",
                        }}
                      >
                        {info.etiqueta}
                      </span>

                      {info.estrella && (
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: "var(--dorado)",
                            border: "2px solid var(--tinta)",
                          }}
                          aria-hidden="true"
                        >
                          ★
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: "var(--arena)",
                          border: "var(--border-width-medium) solid var(--tinta)",
                        }}
                      >
                        <CropIllustration
                          cropId={primerCultivo.crop_id}
                          name={primerCultivo.crop_name}
                          className="w-12 h-12"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-lg leading-snug line-clamp-2">
                          {s.title_es}
                        </p>
                        <p
                          className="text-xs font-bold mt-0.5"
                          style={{ color: "var(--tinta-suave)" }}
                        >
                          {info.sub}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Tarjeta completa de la estrategia seleccionada */}
            <RotationCard
              strategy={shownStrategy}
              index={selectedIdx + 1}
              indicators={indicators}
              onSpeak={onSpeak}
              activeAudioKey={activeAudioKey}
              isAdvanced={isAdvanced}
              lang={lang}
            />
          </div>
        ) : (
          <div
            role="status"
            className="tarpuy-card-physical p-6 flex items-center gap-4"
            style={{ backgroundColor: "var(--alerta-cuidado-suave)" }}
          >
            <IlustracionTarpuy id="semilla" size={52} />
            <p className="tarpuy-body font-extrabold">
              {qu
                ? "Mana tarpuy yachay kanchu."
                : "Todavía no hay recomendaciones para esta zona. Conéctate y guarda sus datos para consultarlos después."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
