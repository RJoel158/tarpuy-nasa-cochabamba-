import React from "react";
import { CropIllustration, WaterIllustration, ToolIllustration } from "./FarmPictograms.jsx";
import { IlustracionTarpuy } from "../../components/illustrations/TarpuyIllustrations.jsx";
import { BotonGrande } from "../../components/ui/TarpuyBaseComponents.jsx";
import { PersonajeGuia, GloboHabla } from "../../components/personality/PersonajeGuia.jsx";

/**
 * TARPUY NASA COCHABAMBA — LAS 4 PREGUNTAS GUIADAS DE SIEMBRA (FASE 4)
 * ====================================================================
 * Presenta los 4 controles existentes como bloques numerados y grandes,
 * uno debajo del otro en una sola pantalla con scroll, acompañados por el
 * personaje guía y la barra de avance dibujada (Semilla → Brote → Planta → Cosecha).
 *
 * 1. "¿Qué sembraste antes?" (fondo activo --hoja-suave + check dibujado)
 * 2. "¿Cómo riegas?" (dibujos de gravedad, goteo o solo lluvia con --cielo)
 * 3. "¿Con qué trabajas?" (yunta de bueyes o tractor)
 * 4. "¿Qué te importa más?" (4 botones grandes con dibujo para las prioridades)
 * + Botón grande "VER MI PLAN" al final.
 *
 * Cero códigos hexadecimales sueltos.
 */

const CROP_LABELS = {
  papa_huaycha: { title: "Papa", sub: "Akshu" },
  maiz_valle: { title: "Maíz", sub: "Sara" },
  haba: { title: "Haba", sub: "Jawasa" },
  cebada: { title: "Cebada", sub: "Siwara" },
  quinua: { title: "Quinua", sub: "Kinwa" },
  tarwi: { title: "Tarwi", sub: "Tarwi" },
  avena_vicia: { title: "Avena / Vicia", sub: "Uywa mikhuna" },
  alfalfa: { title: "Alfalfa", sub: "Alfalfa" },
};

const IRRIGATIONS = [
  {
    id: "none_secano",
    es: "Solo lluvia",
    esCue: "Esperando agua del cielo",
    qu: "Para yakulla",
    quCue: "Pachamanta yaku",
  },
  {
    id: "deficit_auxiliary",
    es: "Riego por goteo o turnos",
    esCue: "Cuidando cada turno de agua",
    qu: "Mit'awan parqoy",
    quCue: "Tanda yaku",
  },
  {
    id: "full_canal_well",
    es: "Riego por gravedad",
    esCue: "Canal, acequia o pozo",
    qu: "Larq'amanta / Poso",
    quCue: "Sapa kuti parqoy",
  },
];

const EQUIPMENTS = [
  {
    id: "manual_yunta",
    es: "Yunta de bueyes o a mano",
    esCue: "Arado tradicional y herramientas",
    qu: "Yunta icha makiwan",
    quCue: "Ñawpaq llamk'ana",
  },
  {
    id: "mixed_tractor_service",
    es: "Yunta y tractor",
    esCue: "Combinando ambos según el surco",
    qu: "Yuntawan tractorwan",
    quCue: "Iskayninwan llamk'ay",
  },
  {
    id: "mechanized",
    es: "Tractor",
    esCue: "Preparación con maquinaria",
    qu: "Tractorllawan",
    quCue: "Maquinawan llamk'ay",
  },
];

const PRIORITY_PRESETS = [
  {
    id: "cuidar_todo",
    dibujoId: "tierra_humeda",
    es: "Cuidar agua y tierra",
    qu: "Yakuta allpata jark'ay",
    ids: ["water_conservation", "nitrogen_fixation", "erosion_control"],
  },
  {
    id: "agua",
    dibujoId: "gota_agua",
    es: "Guardar humedad",
    qu: "Uqhu allpa waqaychay",
    ids: ["water_conservation", "organic_matter"],
  },
  {
    id: "abono",
    dibujoId: "brote",
    es: "Dar fuerza al suelo",
    qu: "Allpata wanuchay",
    ids: ["nitrogen_fixation", "organic_matter"],
  },
  {
    id: "pasto_venta",
    dibujoId: "cosecha",
    es: "Forraje y cosecha para vender",
    qu: "Uywa q'achu, qhatu",
    ids: ["forage_value", "market_income"],
  },
];

function CheckDibujado({ size = 28 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle
        cx="14"
        cy="14"
        r="12"
        fill="var(--hoja-oscura)"
        stroke="var(--tinta)"
        strokeWidth="2.4"
      />
      <path
        d="M8.5 14.5L12.5 18.5L19.5 10"
        stroke="var(--tarjeta)"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Barra de avance dibujada: Semilla → Brote → Planta → Cosecha */
function BarraAvanceDibujada({ qu = false }) {
  const pasos = [
    { num: 1, dibujo: "semilla", texto: qu ? "1. Ñawpa tarpuy" : "1. Cultivo anterior" },
    { num: 2, dibujo: "brote", texto: qu ? "2. Yaku" : "2. Riego" },
    { num: 3, dibujo: "planta_crecida", texto: qu ? "3. Llamk'ana" : "3. Herramienta" },
    { num: 4, dibujo: "cosecha", texto: qu ? "4. Munayniyki" : "4. Lo más importante" },
  ];

  return (
    <div
      aria-label="Pasos de tu conversación de siembra"
      className="p-4 rounded-3xl grid grid-cols-2 sm:grid-cols-4 gap-3"
      style={{
        backgroundColor: "var(--arena)",
        border: "var(--border-width-medium) solid var(--tinta)",
      }}
    >
      {pasos.map((p) => (
        <div
          key={p.num}
          className="px-3 py-2.5 rounded-2xl flex items-center gap-3"
          style={{
            backgroundColor: "var(--tarjeta)",
            border: "var(--border-width-medium) solid var(--tinta)",
          }}
        >
          <IlustracionTarpuy id={p.dibujo} size={38} />
          <span className="font-extrabold text-base leading-tight">{p.texto}</span>
        </div>
      ))}
    </div>
  );
}

export default function PrioritySelectorGrid({
  crops = [],
  cropId,
  onChangeCrop,
  priorities = [],
  onChangePriorities,
  irrigation,
  onChangeIrrigation,
  equipment,
  onChangeEquipment,
  onVerPlan,
  lang = "es",
}) {
  const qu = lang === "qu";
  const cropItems =
    crops.length > 0
      ? crops
      : Object.keys(CROP_LABELS).map((id) => ({ crop_id: id }));

  const isPresetActive = (ids) =>
    ids.length === priorities.length && ids.every((id) => priorities.includes(id));

  return (
    <div className="space-y-6">
      {/* Encabezado conversacional con el Personaje Guía y Barra de avance dibujada */}
      <div className="tarpuy-card-physical p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <PersonajeGuia pose="siembra" mostrarEtiquetaNombre={true} size={96} />
          <GloboHabla
            direccionCola="izquierda"
            tono="recomendado"
            texto={
              qu
                ? " kay 4 tapuykunata kutichiy, chakraykipaq allin tarpuyta rikuchisqayki."
                : "Responde estas 4 preguntas con calma tocando los dibujos. Abajo verás el mejor plan para tu tierra."
            }
            className="w-full"
          />
        </div>

        <BarraAvanceDibujada qu={qu} />
      </div>

      {/* ===================================================================
       * BLOQUE 1: "¿Qué sembraste antes?" (fondo --hoja-suave y check dibujado)
       * =================================================================== */}
      <section className="tarpuy-card-physical p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-xl shrink-0"
            style={{
              backgroundColor: "var(--hoja-suave)",
              color: "var(--tinta)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            1
          </span>
          <div>
            <h3 className="tarpuy-subtitle">
              {qu ? "¿Imatataq qayna tarpurqanki?" : "¿Qué sembraste antes?"}
            </h3>
            <p className="text-base font-bold" style={{ color: "var(--tinta-suave)" }}>
              {qu ? "Qayna puqusqata ñit'iy" : "Toca el último cultivo que sacaste de tu parcela"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {cropItems.map((c) => {
            const active = cropId === c.crop_id;
            const meta = CROP_LABELS[c.crop_id] || {
              title: c.name_es || c.crop_id,
              sub: c.name_qu || "",
            };
            const mainName = qu ? meta.sub || meta.title : meta.title;
            const subName = qu ? meta.title : meta.sub;

            return (
              <button
                key={c.crop_id}
                type="button"
                onClick={() => onChangeCrop(c.crop_id)}
                aria-pressed={active}
                className={`tarpuy-btn-physical ${
                  active ? "tarpuy-btn-physical--pressed" : ""
                } relative p-4 flex flex-col items-center justify-between gap-2.5 text-center cursor-pointer`}
                style={{
                  minHeight: "148px",
                  backgroundColor: active ? "var(--hoja-suave)" : "var(--tarjeta)",
                  color: "var(--tinta)",
                }}
              >
                {active && (
                  <span className="absolute right-2.5 top-2.5">
                    <CheckDibujado size={26} />
                  </span>
                )}

                <span
                  className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--arena)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <CropIllustration cropId={c.crop_id} className="w-16 h-16" />
                </span>

                <span className="min-w-0">
                  <span className="block font-extrabold text-xl leading-snug break-words">
                    {mainName}
                  </span>
                  {subName ? (
                    <span
                      className="block text-sm font-bold mt-0.5 break-words"
                      style={{ color: "var(--tinta-suave)" }}
                    >
                      {subName}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===================================================================
       * BLOQUE 2: "¿Cómo riegas?" (gravedad, goteo o solo lluvia con --cielo)
       * =================================================================== */}
      <section className="tarpuy-card-physical p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-xl shrink-0"
            style={{
              backgroundColor: "var(--cielo-suave)",
              color: "var(--tinta)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            2
          </span>
          <div>
            <h3 className="tarpuy-subtitle">
              {qu ? "¿Imaynata parqonki?" : "¿Cómo riegas?"}
            </h3>
            <p className="text-base font-bold" style={{ color: "var(--tinta-suave)" }}>
              {qu ? "Yaku kayninta akllay" : "Elige con qué agua cuentas en tu terreno"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {IRRIGATIONS.map((opt) => {
            const active = irrigation === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeIrrigation(opt.id)}
                aria-pressed={active}
                className={`tarpuy-btn-physical ${
                  active ? "tarpuy-btn-physical--pressed" : ""
                } relative p-4 flex items-center gap-4 text-left cursor-pointer`}
                style={{
                  minHeight: "104px",
                  backgroundColor: active ? "var(--cielo-suave)" : "var(--tarjeta)",
                  color: "var(--tinta)",
                }}
              >
                <span
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <WaterIllustration id={opt.id} className="w-14 h-14" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold text-xl leading-snug">
                    {qu ? opt.qu : opt.es}
                  </span>
                  <span
                    className="block text-sm font-bold mt-1"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    {qu ? opt.quCue : opt.esCue}
                  </span>
                </span>

                {active && <CheckDibujado size={26} />}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===================================================================
       * BLOQUE 3: "¿Con qué trabajas?" (yunta de bueyes o tractor)
       * =================================================================== */}
      <section className="tarpuy-card-physical p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-xl shrink-0"
            style={{
              backgroundColor: "var(--tierra-suave)",
              color: "var(--tinta)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            3
          </span>
          <div>
            <h3 className="tarpuy-subtitle">
              {qu ? "¿Imawan llamk'anki?" : "¿Con qué trabajas?"}
            </h3>
            <p className="text-base font-bold" style={{ color: "var(--tinta-suave)" }}>
              {qu ? "Allpa wakichinata akllay" : "Cómo preparas los surcos de tu chacra"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EQUIPMENTS.map((opt) => {
            const active = equipment === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeEquipment(opt.id)}
                aria-pressed={active}
                className={`tarpuy-btn-physical ${
                  active ? "tarpuy-btn-physical--pressed" : ""
                } p-4 flex items-center gap-4 text-left cursor-pointer`}
                style={{
                  minHeight: "100px",
                  backgroundColor: active ? "var(--tierra-suave)" : "var(--tarjeta)",
                  color: "var(--tinta)",
                }}
              >
                <span
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <ToolIllustration id={opt.id} className="w-14 h-14" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block font-extrabold text-xl leading-snug">
                    {qu ? opt.qu : opt.es}
                  </span>
                  <span
                    className="block text-sm font-bold mt-1"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    {qu ? opt.quCue : opt.esCue}
                  </span>
                </span>

                {active && <CheckDibujado size={26} />}
              </button>
            );
          })}
        </div>
      </section>

      {/* ===================================================================
       * BLOQUE 4: "¿Qué te importa más?" (4 botones grandes con dibujo)
       * =================================================================== */}
      <section className="tarpuy-card-physical p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <span
            className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-xl shrink-0"
            style={{
              backgroundColor: "var(--dorado-suave)",
              color: "var(--tinta)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            4
          </span>
          <div>
            <h3 className="tarpuy-subtitle">
              {qu ? "¿Imatataq aswan munanki?" : "¿Qué te importa más?"}
            </h3>
            <p className="text-base font-bold" style={{ color: "var(--tinta-suave)" }}>
              {qu ? "Chakraykipaq munayniykita akllay" : "Elige qué quieres lograr en esta campaña"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRIORITY_PRESETS.map((preset) => {
            const active = isPresetActive(preset.ids);
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onChangePriorities(preset.ids)}
                aria-pressed={active}
                className={`tarpuy-btn-physical ${
                  active ? "tarpuy-btn-physical--pressed" : ""
                } p-4 flex items-center justify-between gap-4 text-left cursor-pointer`}
                style={{
                  minHeight: "88px",
                  backgroundColor: active ? "var(--dorado-suave)" : "var(--tarjeta)",
                  color: "var(--tinta)",
                }}
              >
                <span className="flex items-center gap-3.5 min-w-0">
                  <span
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: "var(--arena)",
                      border: "var(--border-width-medium) solid var(--tinta)",
                    }}
                  >
                    <IlustracionTarpuy id={preset.dibujoId} size={44} />
                  </span>
                  <span className="font-extrabold text-xl leading-snug">
                    {qu ? preset.qu : preset.es}
                  </span>
                </span>

                {active && <CheckDibujado size={26} />}
              </button>
            );
          })}
        </div>

        {/* 2. UN BOTÓN GRANDE "VER MI PLAN" AL FINAL DEL FORMULARIO */}
        <div className="pt-4">
          <BotonGrande
            variante="primario"
            ilustracionId="brote"
            texto={qu ? "Tarpuyniyta qhaway (Ver mi plan)" : "Ver mi plan"}
            onClick={onVerPlan}
            className="w-full text-2xl py-4 justify-center"
          />
        </div>

        {/* TODO-FUNCIONALIDAD: Si el equipo decide activar un asistente paso a paso
            (1 pregunta por pantalla con botones "Atrás" y "Siguiente"), conectar el
            estado de paso activo (1..4) en este contenedor de controles. */}
      </section>
    </div>
  );
}
