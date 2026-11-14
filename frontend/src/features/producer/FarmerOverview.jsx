import React from "react";
import { CropIllustration } from "./FarmPictograms.jsx";
import { BotonGrande, BotonAltavoz } from "../../components/ui/TarpuyBaseComponents.jsx";
import { PersonajeGuia } from "../../components/personality/PersonajeGuia.jsx";
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

  const nombreCultivo = (qu ? crop?.name_qu : crop?.name_es) || crop?.name_es || cropId;

  return (
    <section
      aria-label={qu ? "Chakray" : "Mi parcela"}
      data-zona={zone?.zone_id || "punata_valle_alto"}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* 4. LA PARCELA: Reducida a una línea clara con dibujo del cultivo y nombre de comunidad con franja de acento */}
        <div className="tarpuy-card-physical overflow-hidden lg:col-span-2 flex flex-col justify-between">
          {/* Franja de acento de la zona */}
          <div
            className="px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 font-extrabold"
            style={{
              backgroundColor: "var(--acento-zona-suave)",
              borderBottom: "var(--border-width-medium) solid var(--tinta)",
              color: "var(--tinta)",
            }}
          >
            <span className="inline-flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full inline-block"
                style={{
                  backgroundColor: "var(--acento-zona)",
                  border: "1.5px solid var(--tinta)",
                }}
                aria-hidden="true"
              />
              <span>
                {qu ? "Chakray · Llaqta:" : "Tu parcela en:"}{" "}
                <strong>{community || zone?.name || "—"}</strong>
              </span>
            </span>

            <span className="text-sm font-bold" style={{ color: "var(--tinta-suave)" }}>
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
                className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--arena)",
                  border: "var(--border-width-medium) solid var(--tinta)",
                }}
              >
                <CropIllustration cropId={cropId} className="w-16 h-16" />
              </div>

              <div className="min-w-0 space-y-0.5">
                <h2 className="tarpuy-subtitle break-words">
                  {community || zone?.name}
                </h2>
                <p className="text-base font-bold" style={{ color: "var(--tinta-suave)" }}>
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

          {/* Acciones secundarias de la parcela (Cambiar comunidad / Guardar sin internet) */}
          <div
            className="px-5 py-3 flex flex-wrap items-center justify-between gap-3"
            style={{
              backgroundColor: "var(--arena)",
              borderTop: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            <button
              type="button"
              onClick={onMap}
              className="font-extrabold text-base underline cursor-pointer py-1"
              style={{ color: "var(--tinta)" }}
            >
              {qu ? tr(lang, "community") : "Cambiar comunidad en el mapa"}
            </button>

            <button
              type="button"
              onClick={onSave}
              disabled={offline}
              className="font-extrabold text-base underline cursor-pointer py-1 disabled:opacity-50"
              style={{ color: "var(--tinta)" }}
            >
              {qu ? tr(lang, "refreshCopy") : "Guardar copia para usar sin internet"}
            </button>
          </div>
        </div>

        <div className="tarpuy-card-physical p-6 flex flex-col items-center justify-center gap-4 text-center" style={{backgroundColor:'var(--hoja-suave)'}}>
          <PersonajeGuia nombre="Guía de Tarpuy" pose="saludo" size={124} />
          <p className="tarpuy-subtitle">{qu ? "Chakraykita qhawasun." : "Tu tierra, tus decisiones."}</p>
          <p className="text-base">{qu ? "Allpata yakuta qhaway." : "Escucha la guía y revisa las opciones para tu próxima siembra."}</p>
        </div>
      </div>
    </section>
  );
}
