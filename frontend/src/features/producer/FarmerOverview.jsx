import React from "react";
import { CropIllustration } from "./FarmPictograms.jsx";
import { BotonGrande, BotonAltavoz } from "../../components/ui/TarpuyBaseComponents.jsx";
import { MiChacra } from "../../components/personality/ElementosContextualesFase1C.jsx";
import { tr } from "../../utils/quechuaI18n.js";

/**
 * TARPUY NASA COCHABAMBA — LA PARCELA Y MI CHACRA (FASE 3)
 * ========================================================
 * 4. LA PARCELA: Tarjeta compacta en una línea con dibujo del cultivo y el
 *    nombre de la comunidad con su franja de acento (--acento-zona), manteniendo
 *    todos sus botones y estados originales (onPlant, onListen, onMap, onSave).
 * 5. MI CHACRA: Componente visual de la Fase 1C ubicado junto a la parcela
 *    con valores de ejemplo y TODO-FUNCIONALIDAD.
 *
 * Cero códigos hexadecimales sueltos.
 */

export default function FarmerOverview({
  community,
  zone,
  crop,
  cropId,
  lang,
  offline,
  saved,
  onPlant,
  onMap,
  onSave,
  onListen,
  speaking,
}) {
  const qu = lang === "qu";
  const savedHere = saved?.zoneId === zone?.zone_id && saved?.updatedAt;
  const date = savedHere ? new Date(saved.updatedAt) : null;
  const dateLabel =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" })
      : "";

  const CATEGORY_NAMES = {
    hortalizas: { es: "Hortalizas (cebolla, zanahoria, tomate)", qu: "Yuyukuna" },
    tuberculos: { es: "Tubérculos (papa, oca, papalisa)", qu: "Allpa p'ukukuna" },
    cereales: { es: "Cereales y Granos (maíz, trigo, cebada)", qu: "Sara, Siwara, Trigo" },
    frutales: { es: "Frutales (durazno, manzana)", qu: "Rurukuna" },
  };
  const catMeta = CATEGORY_NAMES[cropId];
  const nombreCultivo = catMeta
    ? (qu ? catMeta.qu : catMeta.es)
    : (qu ? crop?.name_qu : crop?.name_es) || crop?.name_es || cropId;

  const cultivoSimpleEjemplo = String(cropId || "").includes("papa") || String(cropId || "").includes("tuberculo")
    ? "papa"
    : String(cropId || "").includes("haba") || String(cropId || "").includes("hortaliza")
    ? "haba"
    : String(cropId || "").includes("frutal")
    ? "alfalfa"
    : String(cropId || "").includes("quinua")
    ? "quinua"
    : String(cropId || "").includes("avena")
    ? "avena"
    : "maiz";

  return (
    <section
      aria-label={qu ? "Chakray" : "Mi parcela"}
      data-zona={zone?.zone_id || "punata_valle_alto"}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* 4. LA PARCELA: Tarjeta tranquila sin bordes internos ni cajas dentro de cajas */}
        <div className="tarpuy-card-physical overflow-hidden lg:col-span-2 flex flex-col justify-between">
          {/* Franja suave de la zona */}
          <div
            className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 font-medium"
            style={{
              backgroundColor: "var(--arena)",
              color: "var(--tinta)",
            }}
          >
            <span className="inline-flex items-center gap-2">
              <span
                className="w-3.5 h-3.5 rounded-full inline-block"
                style={{ backgroundColor: "var(--acento-zona)" }}
                aria-hidden="true"
              />
              <span>
                {qu ? "Chakray · Llaqta:" : "Tu parcela en:"}{" "}
                <strong>{community || zone?.name || "—"}</strong>
              </span>
            </span>

            <span className="text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
              {offline
                ? `${tr(lang, "offline")} · ${
                    savedHere
                      ? dateLabel
                      : qu
                      ? "Mana waqaychasqachu"
                      : "Sin copia guardada aún"
                  }`
                : savedHere
                ? `${qu ? "Waqaychasqa" : "Copia guardada"} · ${dateLabel}`
                : zone?.name || ""}
            </span>
          </div>

          {/* Línea principal: Dibujo del cultivo + Comunidad + Último cultivo + Acciones */}
          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-18 h-18 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--arena)" }}
              >
                <CropIllustration cropId={cropId} className="w-14 h-14" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <h2 className="tarpuy-subtitle">
                  {community || zone?.name} · {nombreCultivo}
                </h2>
                <p className="text-base font-normal" style={{ color: "var(--tinta-suave)" }}>
                  {tr(lang, "stepLastCrop")} {nombreCultivo}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <BotonGrande
                variante="primario"
                ilustracionId="mano_siembra"
                texto={tr(lang, "navPlant")}
                onClick={onPlant}
                className="flex-1 sm:flex-initial"
              />
              <BotonAltavoz
                sonando={speaking}
                mostrarTexto={false}
                etiqueta={tr(lang, speaking ? "stopAudio" : "listenGuide")}
                onClick={onListen}
              />
            </div>
          </div>

          {/* Acciones secundarias de la parcela */}
          <div className="px-5 pb-4 pt-1 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onMap}
              className="font-bold text-base underline cursor-pointer py-1"
              style={{ color: "var(--tinta-suave)" }}
            >
              {qu ? tr(lang, "community") : "Cambiar comunidad en el mapa"}
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={offline}
              className="font-bold text-base underline cursor-pointer py-1 disabled:opacity-50"
              style={{ color: "var(--tinta-suave)" }}
            >
              {qu ? tr(lang, "refreshCopy") : "Guardar copia para usar sin internet"}
            </button>
          </div>
        </div>

        {/* 5. MI CHACRA (Fase 1C junto a la parcela, con valores de ejemplo y TODO-FUNCIONALIDAD) */}
        <MiChacra
          cultivo={cultivoSimpleEjemplo}
          etapa="brote"
          className="h-full"
        />
      </div>
    </section>
  );
}
