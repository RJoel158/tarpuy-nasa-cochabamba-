import HorizontalCarousel from "./ui/HorizontalCarousel.jsx";
import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import PrioritySelectorGrid from "../features/producer/PrioritySelectorGrid.jsx";
import RotationCard from "../features/producer/RotationCard.jsx";
import { CropIllustration } from "../features/producer/FarmPictograms.jsx";
import { BotonGrande } from "./ui/TarpuyBaseComponents.jsx";
import { PatronPantalla, SelloCartilla } from "./personality/PatronesYSellos.jsx";
import { IlustracionTarpuy } from "./illustrations/TarpuyIllustrations.jsx";
import MamaTomasaAyuda from "./personality/MamaTomasaAyuda.jsx";
import { buildStrategyNarration } from "../services/narration.js";
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
  const ordered = [...strategies].sort((a, b) =>
    (b.priority_alignment_score ?? -1) - (a.priority_alignment_score ?? -1));
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    setSelectedIdx(0);
  }, [cropId, irrigation, priorities]);

  const shownStrategy = ordered[selectedIdx] || ordered[0];
  const stratKey = shownStrategy
    ? `${shownStrategy.strategy_id}_${qu ? "qu" : "es"}`
    : `siembra_guia_${qu ? "qu" : "es"}`;

  const handleListenMamaTomasa = () => {
    if (shownStrategy) {
      onSpeak?.(
        buildStrategyNarration(shownStrategy, qu ? "qu" : "es"),
        qu ? "qu" : "es",
        stratKey,
        `strat_${shownStrategy.strategy_id}`
      );
    } else {
      const msg = qu
        ? "Kay 4 tapuykunata kutichiy, chakraykipaq allin tarpuyta rikuchisqayki."
        : "Responde estas 4 preguntas con calma tocando los dibujos. Abajo verás el mejor plan para tu tierra.";
      onSpeak?.(msg, qu ? "qu" : "es", stratKey);
    }
  };

  /* Semáforo y expresión de Fase 1 de Mamá Tomasa para la estrategia seleccionada */
  const tl = shownStrategy?.traffic_light || {};
  const esLineaBase = shownStrategy?.strategy_type === "current_baseline";
  const semaforoPrincipalSiembra = esLineaBase
    ? tl.soil === "red" || tl.water === "red"
      ? "rojo"
      : "amarillo"
    : selectedIdx === 0
    ? "verde"
    : "verde";

  const posePrincipalSiembra = esLineaBase
    ? "alerta"
    : selectedIdx === 0
    ? "cosecha"
    : "siembra";

  const mensajeCortoSiembra = !shownStrategy
    ? qu
      ? "4 tapuykunata ñit'iy allin tarpuyta rikunapaq."
      : "Toca los dibujos de las 4 preguntas para ver tu plan."
    : esLineaBase
    ? qu
      ? "Kikinllata tarpuyqa allpata sayk'uchin."
      : "Repetir el mismo cultivo cansa la tierra. Mira el semáforo:"
    : selectedIdx === 0
    ? qu
      ? "Kay tarpuyqa allpaykita wanuchan, yakutapas waqaychan."
      : "Este es el mejor plan: abona tu tierra y cuida el agua."
    : qu
    ? "Allin tarpuy allpayki samananpaq."
    : "Buena opción para rotar tus cultivos y cuidar el suelo.";

  const mapTrafficColor = (val) =>
    val === "green" ? "verde" : val === "red" ? "rojo" : "amarillo";

  const tarjetasMamaTomasa = shownStrategy
    ? [
        {
          id: "semaforo_suelo",
          dibujoId: "planta_crecida",
          pose: tl.soil === "red" ? "alerta" : "siembra",
          semaforo: mapTrafficColor(tl.soil || (esLineaBase ? "yellow" : "green")),
          titulo: qu ? "Allpa wan wanu (Tu tierra)" : "Tu tierra y abono",
          frase:
            tl.soil === "green"
              ? qu
                ? "Allpata samachin, wanutapas saqin."
                : "Deja abono natural y descansa la tierra."
              : tl.soil === "red"
              ? qu
                ? "Allpata utqhaylla sayk'uchin."
                : "Agota los nutrientes del suelo."
              : qu
              ? "Allpata chawpillanpi waqaychan."
              : "Mantiene el suelo regular.",
        },
        {
          id: "semaforo_agua",
          dibujoId: "gota_agua",
          pose: tl.water === "red" ? "alerta" : "riego",
          semaforo: mapTrafficColor(tl.water || "green"),
          titulo: qu ? "Yaku munay (El agua)" : "Cuidado del agua",
          frase:
            tl.water === "green"
              ? qu
                ? "Allpapi yakuta allinta waqaychan."
                : "Guarda bien la humedad en los surcos."
              : tl.water === "red"
              ? qu
                ? "Achka yakuta munan."
                : "Pierde humedad rápido; pide más riego."
              : qu
              ? "Chawpi qarpayta munan."
              : "Necesita riego moderado.",
        },
        {
          id: "semaforo_cosecha",
          dibujoId: "cosecha",
          pose: esLineaBase ? "alerta" : "cosecha",
          semaforo: esLineaBase ? "amarillo" : "verde",
          titulo: qu ? "Puquy (La cosecha)" : "Tu cosecha",
          frase: esLineaBase
            ? qu
              ? "Watamanta wataman pisi puquy."
              : "Da menos cosecha con el paso de los años."
            : qu
            ? "Allin puquy, allin mikhuna."
            : "Buena cosecha y alimento seguro.",
        },
      ]
    : [];

  const handleVerMiPlan = () => {
    setShowComparison(true);
    requestAnimationFrame(() => resultadosRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const tabInfo = (s, idx) => {
    const baseline = s.strategy_type === "current_baseline";
    const score = s.priority_alignment_score;
    const best = ordered[0]?.priority_alignment_score;
    const evaluated = Number.isFinite(score) && Number.isFinite(best);
    const recommended = evaluated && score === best;
    const lower = evaluated && idx === ordered.length - 1 && score < best && ordered.length > 2;
    return {
      etiqueta: !evaluated ? (qu ? "Tarpuy ñan" : "Opción por evaluar")
        : recommended ? (qu ? "Aswan allin · Recomendada" : "Recomendada")
        : lower ? (qu ? "Pisi tupaq · Menor ajuste" : "Menor ajuste a tus prioridades")
        : (qu ? "Wakin tarpuy · Alternativa" : "Alternativa"),
      sub: !evaluated ? "Faltan datos para comparar esta opción."
        : recommended ? "Es la que mejor responde a tus prioridades actuales."
        : lower ? "Responde menos a tus prioridades que las otras opciones."
        : "Otra posibilidad para tus condiciones y prioridades.",
      bg: recommended ? "var(--dorado-suave)" : lower ? "var(--alerta-cuidado-suave)" : "var(--hoja-suave)",
      estrella: recommended,
      baseline,
    };
  };

  return (
    <div className="space-y-8" data-zona={currentZoneId}>
      <h2 className="tarpuy-title">{tr(lang, "rotationTitle")}</h2>

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

      {/* Único patrón suave de Siembra antes de los resultados */}
      <PatronPantalla tipo="terrazas" />

      {/* 3. LOS RESULTADOS (Las 3 estrategias ordenadas) */}
      <div ref={resultadosRef} className="space-y-6" hidden={!showComparison}>
        {isCalculating ? (
          <div className="tarpuy-card-physical p-10 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "var(--hoja-oscura)" }} />
            <p className="tarpuy-subtitle">{tr(lang, "calculating")}</p>
          </div>
        ) : ordered.length > 0 && shownStrategy ? (
          <div className="space-y-6">
            {/* Encabezado de resultados + Sello de Cartilla */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="tarpuy-title">
                  {qu ? "Chakraykipaq 3 tarpuy ñankuna" : "Tus 3 opciones de siembra"}
                </h3>
                <p className="tarpuy-body font-normal" style={{ color: "var(--tinta-suave)" }}>
                  {qu
                    ? "Hukta ñit'iy 12 killa tarpuyta rikunapaq"
                    : "Desliza para comparar y selecciona una opción para ver su plan. El orden depende de tus prioridades."}
                </p>
              </div>

              <SelloCartilla
                texto={qu ? "Tarpuy wakichisqa" : "Plan de siembra listo"}
                subtitulo={zone?.name || currentZoneId}
                color="dorado"
              />
            </div>

            {/* Selector visual de las 3 estrategias */}
            <HorizontalCarousel label="Opciones de siembra" kind="strategy">
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
                    className={`strategy-choice ${activa ? "strategy-choice--selected" : ""}`}
                    style={{
                      minHeight: "140px",
                      backgroundColor: activa ? info.bg : "var(--tarjeta)",
                      color: "var(--tinta)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <span
                        className="px-3 py-0.5 rounded-full text-sm font-bold"
                        style={{
                          backgroundColor: activa ? "var(--tarjeta)" : info.bg,
                          color: "var(--tinta)",
                        }}
                      >
                        {idx + 1}. {info.etiqueta}
                      </span>

                      {info.estrella && (
                        <span
                          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold"
                          style={{
                            backgroundColor: "var(--dorado)",
                            color: "var(--tinta)",
                          }}
                          aria-hidden="true"
                        >
                          ★
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "var(--arena)" }}
                      >
                        <CropIllustration
                          cropId={primerCultivo.crop_id}
                          name={primerCultivo.crop_name}
                          className="w-11 h-11"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="font-extrabold text-lg leading-snug break-words">
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
                    <div className="strategy-choice-footer">
                      <span>{info.baseline ? "Práctica actual" : "Plan propuesto"}</span>
                      <strong>{activa ? "✓ Seleccionada" : "Ver este plan →"}</strong>
                    </div>
                  </button>
                );
              })}
            </HorizontalCarousel>

            {/* Tarjeta completa de la estrategia seleccionada */}
            <RotationCard
              strategy={shownStrategy}
              choiceLabel={tabInfo(shownStrategy, selectedIdx).etiqueta}
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

      {/* Ventana emergente de Mamá Tomasa en la pantalla de Siembra */}
      <MamaTomasaAyuda
        titulo={
          shownStrategy
            ? shownStrategy.title_es
            : tr(lang, "rotationTitle")
        }
        pose={posePrincipalSiembra}
        semaforoPrincipal={semaforoPrincipalSiembra}
        mensaje={mensajeCortoSiembra}
        tarjetas={tarjetasMamaTomasa}
        onListen={handleListenMamaTomasa}
        isSpeaking={activeAudioKey === stratKey}
        badgeCount={tarjetasMamaTomasa.length}
        lang={lang}
      />
    </div>
  );
}
