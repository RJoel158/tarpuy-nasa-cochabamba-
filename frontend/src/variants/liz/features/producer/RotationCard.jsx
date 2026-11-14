import React, { useState, useEffect } from "react";
import { buildStrategyNarration } from "../../../../services/narration.js";
import CropCalendarBar from "./CropCalendarBar.jsx";
import { CropIllustration, CheckIllustration } from "./FarmPictograms.jsx";
import { IlustracionTarpuy } from "../../components/illustrations/TarpuyIllustrations.jsx";
import { BotonGrande, BotonAltavoz } from "../../components/ui/TarpuyBaseComponents.jsx";
import { tr } from "../../utils/quechuaI18n.js";

/**
 * TARPUY NASA COCHABAMBA — TARJETA DE ESTRATEGIA DE SIEMBRA (FASE 4)
 * ==================================================================
 * 3. LOS RESULTADOS:
 *    - La Óptima (index === 1): estrella/corona en --dorado + "La mejor para ti"
 *    - La Segunda (index === 2): "Otra buena opción"
 *    - Línea Base (current_baseline): "Como siempre se hizo"
 *    Cada tarjeta muestra: dibujo del cultivo, una frase de por qué, y 3 íconos
 *    simples (más fuerza para la tierra, cuánta agua necesita, cuánto puede ganar).
 * 4. CALENDARIO (CropCalendarBar de 12 meses).
 * 5. CONSEJOS DE SUELO existentes: 2 o 3 tarjetas ilustradas con frase corta y altavoz.
 * 6. MODO AVANZADO / "Ver números": nitrógeno, balance hídrico, rentabilidad,
 *    puntaje % y evidencia NASA conservados completos en sección plegable.
 *
 * Cero códigos hexadecimales sueltos.
 */

const PLAIN_TITLES = {
  punata_strat_baseline: {
    es: "Seguir solo con maíz y dejar la tierra pelada",
    qu: "Sarallawan tarpuy, allpata q'arata saqispa",
  },
  punata_strat_cover_avena_vicia: {
    es: "Maíz y luego Avena con Vicia para tapar la tierra",
    qu: "Sara, chaymanta Avena-Vicia allpa qhatanapaq",
  },
  punata_strat_legume_diversified: {
    es: "Alfalfa 3 años, luego Papa Huaycha y Maíz",
    qu: "Alfalfa 3 wata, chaymanta Akshu, Sara ima",
  },
  tapacari_strat_baseline: {
    es: "Sembrar solo papa y dejar la ladera vacía",
    qu: "Akshullata tarpuy, urquta ch'usaq saqispa",
  },
  tapacari_strat_tarwi_papa_contour: {
    es: "Tarwi en surcos de contorno, Papa y Cebada",
    qu: "Tarwi qhatapi, Akshu, Siwara ima muyuchispa",
  },
  tapacari_strat_quinua_haba_intercrop: {
    es: "Rotar Haba, Quinua y Avena para animales",
    qu: "Jawasa, Kinwa, uywa Avenawan muyuy",
  },
  mizque_strat_baseline: {
    es: "Maíz y Cebolla dejando la tierra pelada al sol",
    qu: "Sara, Cebolla ima allpata q'arata saqispa",
  },
  mizque_strat_drought_cover_mulch: {
    es: "Maíz tapado con Avena-Vicia y Haba",
    qu: "Sara chhallawan qhatasqa, Avena-Vicia, Jawasawan",
  },
  mizque_strat_agroforestry_alfalfa_grain: {
    es: "Franjas de Alfalfa con Quinua y Maíz",
    qu: "Alfalfa wach'ukuna Kinwawan, Sarawan",
  },
};

/* Estrella / Corona dibujada a mano en --dorado para "La mejor para ti" */
function EstrellaDorada({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="22" cy="22" r="20" fill="var(--tarjeta)" stroke="var(--tinta)" strokeWidth="2.6" />
      <polygon
        points="22,6 26.8,15.6 37.4,17.2 29.7,24.7 31.5,35.2 22,30.2 12.5,35.2 14.3,24.7 6.6,17.2 17.2,15.6"
        fill="var(--dorado)"
        stroke="var(--tinta)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function RotationCard({
  strategy = {},
  index = 1,
  indicators = [],
  onSpeak,
  activeAudioKey,
  isAdvanced = false,
  lang = "es",
}) {
  const [verNumeros, setVerNumeros] = useState(isAdvanced);

  useEffect(() => {
    setVerNumeros(isAdvanced);
  }, [isAdvanced]);

  const isQu = lang === "qu";
  const isBase = strategy.strategy_type === "current_baseline";
  const esMejor = !isBase && index === 1;
  const scorePct = Math.round((strategy.priority_alignment_score || 0.45) * 100);

  const titleObj = PLAIN_TITLES[strategy.strategy_id];
  const title = titleObj ? (isQu ? titleObj.qu : titleObj.es) : strategy.title_es;
  const qKey = `${strategy.strategy_id || index}_qu`;
  const esKey = `${strategy.strategy_id || index}_es`;
  const tl = strategy.visual_traffic_light || {};

  /* Etiqueta clara de las 3 estrategias */
  const etiquetaEstrategia = isBase
    ? isQu
      ? "Ñawpaqman jina (Como siempre se hizo)"
      : "Como siempre se hizo"
    : esMejor
    ? isQu
      ? "Aswan allin qampaq (La mejor para ti)"
      : "La mejor para ti"
    : isQu
    ? "Wakin allin tarpuy (Otra buena opción)"
    : "Otra buena opción";

  const primerCultivo = strategy.crop_sequence?.[0] || {
    crop_id: "maiz_valle",
    crop_name: title,
  };

  /* 3. Los 3 íconos simples: más fuerza para la tierra, cuánta agua necesita, cuánto puede ganar */
  const tresIconosSimples = [
    {
      id: "tierra",
      dibujoId: "tierra_humeda",
      titulo: isQu ? "Allpa kallpa" : "Más fuerza para la tierra",
      estado:
        tl.soil === "green"
          ? isQu
            ? "Allpata kallpachan"
            : "Abona y cuida tu suelo"
          : tl.soil === "red"
          ? isQu
            ? "Allpa sayk'un"
            : "Cansa y pela la tierra"
          : isQu
          ? "Allpata qhaway"
          : "Mantiene el suelo regular",
      bg:
        tl.soil === "green"
          ? "var(--hoja-suave)"
          : tl.soil === "red"
          ? "var(--alerta-critico-suave)"
          : "var(--tierra-suave)",
    },
    {
      id: "agua",
      dibujoId: "gota_agua",
      titulo: isQu ? "Yaku munay" : "Cuánta agua necesita",
      estado:
        tl.water === "green"
          ? isQu
            ? "Yakuta waqaychan"
            : "Aprovecha y guarda la humedad"
          : tl.water === "red"
          ? isQu
            ? "Achka yakuta munan"
            : "Pierde humedad rápido"
          : isQu
          ? "Chawpi yaku"
          : "Necesita riego moderado",
      bg:
        tl.water === "green"
          ? "var(--cielo-suave)"
          : tl.water === "red"
          ? "var(--alerta-cuidado-suave)"
          : "var(--cielo-suave)",
    },
    {
      id: "ganancia",
      dibujoId: "cosecha",
      titulo: isQu ? "Puquy wan qullqi" : "Cuánto puede ganar",
      estado: isBase
        ? isQu
          ? "Pisi puquy qhipaman"
          : "Menor cosecha con los años"
        : esMejor
        ? isQu
          ? "Allin mikhuna, allin qhatu"
          : "Buena cosecha y alimento seguro"
        : isQu
        ? "Allin yanapa"
        : "Cosecha estable y forraje",
      bg: isBase ? "var(--alerta-cuidado-suave)" : "var(--dorado-suave)",
    },
  ];

  const LIGHT_STYLE = {
    green: { bg: "var(--hoja-suave)", word: tr(lang, "wellWord") },
    yellow: { bg: "var(--alerta-cuidado-suave)", word: tr(lang, "careWord") },
    red: { bg: "var(--alerta-critico-suave)", word: tr(lang, "riskWord") },
  };

  const checks = [
    { key: "water", name: tr(lang, "waterCheck"), val: tl.water || "yellow" },
    { key: "soil", name: tr(lang, "soilCheck"), val: tl.soil || "yellow" },
    { key: "frost", name: tr(lang, "frostCheck"), val: tl.frost || "yellow" },
    { key: "erosion", name: tr(lang, "windRainCheck"), val: tl.erosion || "yellow" },
  ];

  const primaryText = buildStrategyNarration(strategy, lang, indicators);

  /* 5. Consejos de suelo extraídos de los pasos de la estrategia */
  const consejosSuelo = (strategy.crop_sequence || []).slice(0, 3).map((paso, idx) => ({
    id: `${paso.crop_id || idx}_${idx}`,
    dibujoCropId: paso.crop_id,
    nombre: paso.crop_name,
    frase: paso.agronomic_role || primaryText,
  }));

  return (
    <article
      className="tarpuy-card-physical overflow-hidden space-y-0"
      style={{
        backgroundColor: "var(--tarjeta)",
        border: esMejor ? "2px solid var(--tinta)" : undefined,
      }}
    >
      {/* Cabecera de la estrategia (Corona/Estrella dorada en "La mejor para ti") */}
      <div
        className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          backgroundColor: esMejor
            ? "var(--dorado-suave)"
            : isBase
            ? "var(--alerta-cuidado-suave)"
            : "var(--hoja-suave)",
        }}
      >
        <div className="flex items-center gap-4">
          {esMejor ? (
            <EstrellaDorada size={50} />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--tarjeta)" }}
            >
              <CropIllustration
                cropId={primerCultivo.crop_id}
                name={primerCultivo.crop_name}
                className="w-14 h-14"
              />
            </div>
          )}

          <div className="space-y-1">
            <span
              className="inline-block px-3 py-0.5 rounded-full text-sm font-bold"
              style={{
                backgroundColor: "var(--tarjeta)",
                color: "var(--tinta)",
              }}
            >
              {etiquetaEstrategia}
            </span>
            <h3 className="tarpuy-title">{title}</h3>
          </div>
        </div>

        {/* Botón de altavoz directo en la cabecera */}
        <BotonAltavoz
          sonando={activeAudioKey === (isQu ? qKey : esKey)}
          mostrarTexto={true}
          etiqueta={tr(lang, "listenBtn")}
          onClick={() =>
            onSpeak(
              buildStrategyNarration(strategy, isQu ? "qu" : "es", indicators),
              isQu ? "qu" : "es",
              isQu ? qKey : esKey,
              `strat_${strategy.strategy_id}`
            )
          }
        />
      </div>

      <div className="p-6 sm:p-7 space-y-8">
        {/* Una frase clara de por qué conviene (sin bordes dobles) */}
        <div
          className="p-5 rounded-3xl flex flex-col sm:flex-row items-center gap-4"
          style={{ backgroundColor: "var(--arena)" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--tarjeta)" }}
          >
            <CropIllustration
              cropId={primerCultivo.crop_id}
              name={primerCultivo.crop_name}
              className="w-14 h-14"
            />
          </div>
          <p className="tarpuy-body font-normal">{primaryText}</p>
        </div>

        {/* 3 ÍCONOS SIMPLES: sin bordes gruesos ni cajas dentro de cajas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {tresIconosSimples.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl flex flex-col items-center text-center gap-2.5"
              style={{ backgroundColor: "var(--arena)" }}
            >
              <div
                className="w-18 h-18 rounded-full flex items-center justify-center"
                style={{ backgroundColor: item.bg }}
              >
                <IlustracionTarpuy id={item.dibujoId} size={50} />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--tinta-suave)" }}
              >
                {item.titulo}
              </span>
              <p className="font-bold text-xl leading-snug">{item.estado}</p>
            </div>
          ))}
        </div>

        {/* 4. CALENDARIO DE 12 MESES DIBUJADO */}
        <CropCalendarBar
          cropSequence={strategy.crop_sequence}
          indicators={indicators}
          lang={lang}
        />

        {/* 5. CONSEJOS DE SUELO EXISTENTES (sin bordes gruesos en elementos informativos) */}
        {consejosSuelo.length > 0 && (
          <div className="space-y-4">
            <h4 className="tarpuy-subtitle">
              {isQu ? "Allpa waqaychay yuyaychaykuna" : "Consejos para cuidar tu suelo en este plan"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {consejosSuelo.map((c, cIdx) => {
                const audioConsejoKey = `${strategy.strategy_id}_consejo_${cIdx}_${lang}`;
                return (
                  <div
                    key={c.id}
                    className="p-5 rounded-3xl flex flex-col justify-between gap-4"
                    style={{ backgroundColor: "var(--arena)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "var(--tarjeta)" }}
                      >
                        <CropIllustration
                          cropId={c.dibujoCropId}
                          name={c.nombre}
                          className="w-12 h-12"
                        />
                      </div>
                      <h5 className="font-bold text-lg leading-tight">{c.nombre}</h5>
                    </div>

                    <p className="tarpuy-body font-normal">{c.frase}</p>

                    <div className="pt-1 flex justify-end">
                      <BotonAltavoz
                        sonando={activeAudioKey === audioConsejoKey}
                        mostrarTexto={true}
                        etiqueta={tr(lang, "listenBtn")}
                        onClick={() =>
                          onSpeak(
                            `${c.nombre}. ${c.frase}`,
                            lang,
                            audioConsejoKey
                          )
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botones de voz bilingüe originales (Castellano y Runasimi) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <BotonGrande
            variante={activeAudioKey === qKey ? "agua" : "secundario"}
            ilustracionId="altavoz"
            estado={activeAudioKey === qKey ? "presionado" : "normal"}
            texto={tr(lang, "listenQuBtn")}
            onClick={() =>
              onSpeak(
                buildStrategyNarration(strategy, "qu", indicators),
                "qu",
                qKey,
                `strat_${strategy.strategy_id}`
              )
            }
          />
          <BotonGrande
            variante={activeAudioKey === esKey ? "agua" : "secundario"}
            ilustracionId="altavoz"
            estado={activeAudioKey === esKey ? "presionado" : "normal"}
            texto={tr(lang, "listenEsBtn")}
            onClick={() =>
              onSpeak(
                buildStrategyNarration(strategy, "es", indicators),
                "es",
                esKey,
                `strat_${strategy.strategy_id}`
              )
            }
          />
        </div>

        {/* 6. SECCIÓN PLEGABLE "VER NÚMEROS" (Nitrógeno, balance hídrico, rentabilidad, semáforos y evidencia NASA) */}
        <div className="space-y-4 pt-2">
          <BotonGrande
            variante="secundario"
            ilustracionId="cartilla_grafico"
            estado={verNumeros ? "presionado" : "normal"}
            texto={
              verNumeros
                ? isQu
                  ? "Yupaykunata pakay (Ocultar números)"
                  : "Ocultar números"
                : isQu
                ? "Yupaykunata qhaway (Ver números)"
                : "Ver números"
            }
            onClick={() => setVerNumeros((v) => !v)}
          />

          {verNumeros && (
            <div
              className="p-5 sm:p-6 rounded-3xl space-y-5"
              style={{
                backgroundColor: "var(--arena)",
                border: "var(--border-width-thick) solid var(--tinta)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="tarpuy-subtitle">
                  {isQu
                    ? "Yupaykuna: Nitrógeno, Yaku wan Rentabilidad"
                    : "Números técnicos: Nitrógeno, Balance Hídrico y Rentabilidad"}
                </h4>
                <span
                  className="px-3.5 py-1 rounded-full text-base font-extrabold"
                  style={{
                    backgroundColor: "var(--dorado-suave)",
                    color: "var(--dorado-oscuro)",
                    border: "1.5px solid var(--tinta)",
                  }}
                >
                  {tr(lang, "recommendedBadge")} · {scorePct}%
                </span>
              </div>

              {/* Los 4 semáforos técnicos originales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {checks.map((c) => {
                  const st = LIGHT_STYLE[c.val] || LIGHT_STYLE.yellow;
                  return (
                    <div
                      key={c.name}
                      className="p-3.5 rounded-2xl flex items-center gap-3 min-w-0"
                      style={{
                        backgroundColor: "var(--tarjeta)",
                        border: "var(--border-width-medium) solid var(--tinta)",
                      }}
                    >
                      <CheckIllustration kind={c.key} className="w-10 h-10 shrink-0" />
                      <div className="min-w-0">
                        <span
                          className="text-sm font-bold block truncate"
                          style={{ color: "var(--tinta-suave)" }}
                        >
                          {c.name}
                        </span>
                        <span
                          className="inline-block mt-1 text-sm font-extrabold px-2.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: st.bg,
                            color: "var(--tinta)",
                            border: "1.5px solid var(--tinta)",
                          }}
                        >
                          {st.word}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Indicadores numéricos de la estrategia (Nitrógeno, Agua, Cobertura, Rentabilidad) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <span className="text-sm font-bold block" style={{ color: "var(--tinta-suave)" }}>
                    Fijación de Nitrógeno / Suelo
                  </span>
                  <strong className="text-xl font-extrabold">
                    {strategy.soil_benefit_summary ||
                      (tl.soil === "green" ? "Alta reposición (+N)" : "Baja reposición")}
                  </strong>
                </div>

                <div
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <span className="text-sm font-bold block" style={{ color: "var(--tinta-suave)" }}>
                    Eficiencia y Balance de Agua
                  </span>
                  <strong className="text-xl font-extrabold">
                    {strategy.water_requirement_level ||
                      (tl.water === "green" ? "Óptimo ahorro hídrico" : "Demanda estándar")}
                  </strong>
                </div>

                <div
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <span className="text-sm font-bold block" style={{ color: "var(--tinta-suave)" }}>
                    Alineación y Rentabilidad
                  </span>
                  <strong className="text-xl font-extrabold">
                    {scorePct}% de ajuste a tu parcela
                  </strong>
                </div>
              </div>

              {strategy.nasa_evidence ? (
                <div
                  className="p-4 rounded-2xl text-base font-bold leading-relaxed"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <strong>Respaldo Satelital NASA:</strong> {strategy.nasa_evidence}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
