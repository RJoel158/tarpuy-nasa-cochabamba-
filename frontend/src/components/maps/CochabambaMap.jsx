import React, { useEffect, useRef, useMemo, useState } from "react";
import L from "leaflet";
import { ZONE_GEO_CATALOG } from "../../utils/geoUtils.js";
import CommunitySearchCombobox from "../ui/CommunitySearchCombobox.jsx";
import { BotonGrande, BotonAltavoz } from "../ui/TarpuyBaseComponents.jsx";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";
import { PatronPantalla, SelloCartilla } from "../personality/PatronesYSellos.jsx";
import { PaisajePorHora } from "../personality/ElementosContextualesFase1C.jsx";
import MamaTomasaAyuda from "../personality/MamaTomasaAyuda.jsx";
import { speakSpanish, speakQuechua } from "../../services/speechService.js";

/**
 * TARPUY NASA COCHABAMBA — PANTALLA DE MAPA (FASE 5)
 * ==================================================
 * Mismo mapa Leaflet, mismas zonas, mismos polígonos y pines, mismo GPS
 * y mismo clic en el mapa, rediseñado para comprensión inmediata:
 * 1. Mapa base cálido (crema y arena) + controles de zoom +/- grandes (58 px).
 * 2. Pines de comunidades grandes y distintos entre sí:
 *    - Tapacarí: cordillera con helada (--piedra)
 *    - Punata: valle plano con acequia (--dorado)
 *    - Mizque / Chapare: vegetación con lluvia/sol (--hoja)
 * 3. Tarjeta inferior grande al tocar una comunidad: dibujo del paisaje,
 *    nombre, 3 datos con dibujo ("Altura: alto, frío", "Riesgo: heladas",
 *    "El suelo"), botón enorme "Usar esta comunidad" y botón de altavoz.
 * 4. Botón gigante de GPS "¿Dónde estoy?" + mensaje amable con el personaje
 *    guía si falla ("No pude encontrarte. Toca tu comunidad en el mapa").
 * 5. Leyenda mínima con dibujos.
 * 6. Modo Fácil pliega capas técnicas sin eliminarlas; Modo Avanzado las muestra.
 *
 * Cero códigos hexadecimales sueltos.
 */

const PERFIL_VISUAL_ZONA = {
  tapacari_zona_andina: {
    tokenAcento: "--piedra",
    tokenSuave: "--piedra-suave",
    zonaKey: "tapacari",
    paisajeKey: "cordillera",
    alturaSimpleEs: "Altura: alto, frío",
    alturaSimpleQu: "ura/wichay: Jatun urqu, chiri",
    dibujoAltura: "termometro_frio",
    riesgoSimpleEs: "Riesgo: heladas",
    riesgoSimpleQu: "Manchay: Qasa",
    dibujoRiesgo: "helada",
    sueloSimpleEs: "El suelo: ladera firme y pedregosa",
    sueloSimpleQu: "Allpa: Qaqa qhata allpa",
    dibujoSuelo: "tierra_humeda",
  },
  punata_valle_alto: {
    tokenAcento: "--dorado",
    tokenSuave: "--dorado-suave",
    zonaKey: "punata",
    paisajeKey: "valle",
    alturaSimpleEs: "Altura: valle templado",
    alturaSimpleQu: "Pampa: Q'uñi qhichwa",
    dibujoAltura: "termometro_calor",
    riesgoSimpleEs: "Riesgo: poca lluvia",
    riesgoSimpleQu: "Manchay: Pisi para",
    dibujoRiesgo: "tierra_seca",
    sueloSimpleEs: "El suelo: tierra plana y profunda de valle",
    sueloSimpleQu: "Allpa: Pampa uqhu allpa",
    dibujoSuelo: "tierra_humeda",
  },
  mizque_cono_sur: {
    tokenAcento: "--hoja",
    tokenSuave: "--hoja-suave",
    zonaKey: "chapare",
    paisajeKey: "selva",
    alturaSimpleEs: "Altura: bajo y cálido",
    alturaSimpleQu: "Ura pampa: Rupha pacha",
    dibujoAltura: "termometro_calor",
    riesgoSimpleEs: "Riesgo: sol fuerte y viento",
    riesgoSimpleQu: "Manchay: Sinchi inti",
    dibujoRiesgo: "sol",
    sueloSimpleEs: "El suelo: vega fértil junto al río",
    sueloSimpleQu: "Allpa: Mayu patapi sumaq allpa",
    dibujoSuelo: "tierra_humeda",
  },
};

/* Genera el SVG del pin ilustrado para Leaflet según la zona (sin hex sueltos) */
function construirPinSvgZona(zoneId, nombre, activo) {
  const perf = PERFIL_VISUAL_ZONA[zoneId] || PERFIL_VISUAL_ZONA.punata_valle_alto;
  const size = activo ? 66 : 54;

  let dibujoInterno = "";
  if (zoneId === "tapacari_zona_andina") {
    /* Cordillera con cristal de helada */
    dibujoInterno = `
      <path d="M8 38L20 18L29 30L38 14L50 38Z" fill="var(--piedra)" stroke="var(--tinta)" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M20 18L15 26L20 24L25 26Z" fill="var(--tarjeta)" stroke="var(--tinta)" stroke-width="1.6"/>
      <path d="M38 14L33 22L38 20L43 22Z" fill="var(--tarjeta)" stroke="var(--tinta)" stroke-width="1.6"/>
      <path d="M16 11V17M13 14H19" stroke="var(--cielo-oscuro)" stroke-width="2.2" stroke-linecap="round"/>
    `;
  } else if (zoneId === "punata_valle_alto") {
    /* Valle plano con acequia de agua y sol */
    dibujoInterno = `
      <circle cx="42" cy="15" r="6" fill="var(--dorado)" stroke="var(--tinta)" stroke-width="2"/>
      <path d="M8 36C18 28 38 28 50 36V42H8V36Z" fill="var(--tierra)" stroke="var(--tinta)" stroke-width="2.2"/>
      <path d="M24 42C26 35 30 32 34 29" stroke="var(--cielo)" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M14 28C16 23 20 23 22 28" stroke="var(--hoja)" stroke-width="2.6" stroke-linecap="round"/>
    `;
  } else {
    /* Selva / Valle cálido con vegetación y lluvia */
    dibujoInterno = `
      <path d="M10 38C18 24 40 24 48 38Z" fill="var(--hoja)" stroke="var(--tinta)" stroke-width="2.2"/>
      <circle cx="22" cy="24" r="8" fill="var(--hoja-oscura)" stroke="var(--tinta)" stroke-width="2"/>
      <circle cx="35" cy="25" r="7" fill="var(--hoja)" stroke="var(--tinta)" stroke-width="2"/>
      <path d="M20 11L18 16M30 10L28 15M40 11L38 16" stroke="var(--cielo-oscuro)" stroke-width="2.4" stroke-linecap="round"/>
    `;
  }

  return `
    <div style="
      transform: translate(-50%, -92%);
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      user-select: none;
    ">
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 9999px;
        background: ${activo ? `var(${perf.tokenAcento})` : "var(--tarjeta)"};
        border: ${activo ? "4px" : "3px"} solid var(--tinta);
        box-shadow: 0 4px 0 var(--tinta);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
      ">
        <svg viewBox="0 0 58 48" width="${size - 10}" height="${size - 12}" fill="none">
          <rect x="3" y="4" width="52" height="40" rx="18" fill="var(--tarjeta)" stroke="var(--tinta)" stroke-width="2"/>
          ${dibujoInterno}
        </svg>
      </div>
      <div style="
        margin-top: 4px;
        padding: 4px 12px;
        border-radius: 9999px;
        background: ${activo ? "var(--dorado)" : "var(--tarjeta)"};
        color: var(--tinta);
        border: 2.5px solid var(--tinta);
        box-shadow: 0 3px 0 var(--tinta);
        font-family: var(--font-family-display);
        font-size: ${activo ? "17px" : "15px"};
        font-weight: 800;
        white-space: nowrap;
      ">
        ${activo ? "★ " : ""}${nombre}
      </div>
    </div>
  `;
}

export default function CochabambaMap({
  zones = [],
  activeZoneId,
  onSelectZone,
  selectedCommunityName = "Punata",
  onSelectCommunity,
  userPoint = null,
  onPickMapPoint,
  onDetectGps,
  forceOffline,
  isOnline,
  tall = false,
  lang = "es",
  isAdvanced = false,
  onSpeak = null,
  activeAudioKey = null,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const pickRef = useRef(onPickMapPoint);
  const selectRef = useRef(onSelectZone);
  pickRef.current = onPickMapPoint;
  selectRef.current = onSelectZone;

  const [errorGpsAmable, setErrorGpsAmable] = useState(false);
  const [mostrarCapasTecnicas, setMostrarCapasTecnicas] = useState(isAdvanced);

  useEffect(() => {
    setMostrarCapasTecnicas(isAdvanced);
  }, [isAdvanced]);

  const qu = lang === "qu";
  const canUseLeaflet = !forceOffline && isOnline;

  const zoneList = useMemo(() => {
    return ZONE_GEO_CATALOG.map((p) => {
      const match = zones.find((z) => (z.zone_id || z.id) === p.id);
      return {
        ...p,
        zoneData: match || null,
        coords: match?.coordinates ? [match.coordinates.lat, match.coordinates.lon] : p.coords,
        elevation: match?.elevation_msnm ? `${match.elevation_msnm} m` : p.alt,
      };
    });
  }, [zones]);

  const zonaActivaObj =
    zoneList.find((z) => z.id === activeZoneId) || zoneList[1] || zoneList[0];
  const perfilActivo =
    PERFIL_VISUAL_ZONA[zonaActivaObj?.id] || PERFIL_VISUAL_ZONA.punata_valle_alto;

  /* 4. Botón gigante "¿Dónde estoy?" con manejo amable de error en la ventana de Mamá Tomasa */
  const [abiertoMamaTomasa, setAbiertoMamaTomasa] = useState(false);

  const handleDondeEstoy = () => {
    setErrorGpsAmable(false);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorGpsAmable(true);
      setAbiertoMamaTomasa(true);
      onDetectGps?.();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setErrorGpsAmable(false);
        onDetectGps?.();
      },
      () => {
        setErrorGpsAmable(true);
        setAbiertoMamaTomasa(true);
        onDetectGps?.();
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
    );
  };

  /* Audio de la tarjeta inferior de la comunidad */
  const handleEscucharComunidad = () => {
    const texto = qu
      ? `${selectedCommunityName || zonaActivaObj.name}. ${perfilActivo.alturaSimpleQu}. ${perfilActivo.riesgoSimpleQu}. ${perfilActivo.sueloSimpleQu}.`
      : `Estás viendo ${selectedCommunityName || zonaActivaObj.name}. ${perfilActivo.alturaSimpleEs}. ${perfilActivo.riesgoSimpleEs}. ${perfilActivo.sueloSimpleEs}.`;

    if (onSpeak) {
      onSpeak(texto, lang, `mapa_zona_${zonaActivaObj.id}`);
    } else if (qu) {
      speakQuechua(texto);
    } else {
      speakSpanish(texto);
    }
  };

  useEffect(() => {
    if (!canUseLeaflet || !containerRef.current) return;
    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [-17.68, -65.95],
        zoom: 8,
        zoomControl: true,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 14,
      }).addTo(map);
      const allPts = ZONE_GEO_CATALOG.flatMap((z) => z.polygon);
      map.fitBounds(L.latLngBounds(allPts), { padding: [44, 54] });
      map.on("click", (e) => {
        pickRef.current?.(e.latlng.lat, e.latlng.lng, "mapa");
      });
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    const layer = layerRef.current;
    if (layer) {
      layer.clearLayers();
      const rootStyles =
        typeof window !== "undefined"
          ? getComputedStyle(document.documentElement)
          : null;
      const tokenVal = (name) => rootStyles?.getPropertyValue(name).trim() || "";

      const colorTinta = tokenVal("--tinta");
      const colorLadrillo = tokenVal("--ladrillo");
      const colorTarjeta = tokenVal("--tarjeta");

      zoneList.forEach((z) => {
        const active = z.id === activeZoneId;
        const perf = PERFIL_VISUAL_ZONA[z.id] || PERFIL_VISUAL_ZONA.punata_valle_alto;
        const colorZona = tokenVal(perf.tokenAcento);

        /* Mismos polígonos existentes con el color de acento de su zona */
        const polygon = L.polygon(z.polygon, {
          color: colorTinta,
          fillColor: colorZona,
          fillOpacity: active ? 0.38 : 0.18,
          weight: active ? 3.5 : 2,
          dashArray: active ? null : "6 6",
        });
        polygon.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          selectRef.current?.(z.id);
        });
        polygon.addTo(layer);

        /* Mismo punto de referencia */
        const pinpoint = L.circleMarker(z.coords, {
          radius: active ? 8 : 6,
          fillColor: colorZona,
          color: colorTinta,
          weight: 2.5,
          fillOpacity: 1,
        });
        pinpoint.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          selectRef.current?.(z.id);
        });
        pinpoint.addTo(layer);

        /* 2. Pin ilustrado grande y distinto por zona con su nombre en letra grande */
        const labelMarker = L.marker(z.coords, {
          zIndexOffset: active ? 600 : 150,
          icon: L.divIcon({
            className: "tarpuy-map-pin-wrapper",
            html: construirPinSvgZona(z.id, z.name, active),
            iconSize: null,
          }),
        });
        labelMarker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          selectRef.current?.(z.id);
        });
        labelMarker.addTo(layer);
      });

      /* Pin "Estás aquí" en --ladrillo cuando el usuario tocó o usó GPS */
      if (
        userPoint &&
        Number.isFinite(userPoint.lat) &&
        Number.isFinite(userPoint.lon)
      ) {
        const pin = L.circleMarker([userPoint.lat, userPoint.lon], {
          radius: 10,
          fillColor: colorLadrillo,
          color: colorTarjeta,
          weight: 3.5,
          fillOpacity: 1,
        });
        pin.bindTooltip(qu ? "Kaypi kachkanki" : "Estás aquí", {
          permanent: true,
          direction: "bottom",
        });
        pin.addTo(layer);
      }
    }
  }, [canUseLeaflet, activeZoneId, zoneList, userPoint, qu]);

  useEffect(() => {
    if (!canUseLeaflet && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      layerRef.current = null;
    }
  }, [canUseLeaflet]);

  return (
    <div className="space-y-6" data-zona={activeZoneId}>
      {/* Patrón fijo de Mapa: Caminos y zig-zag de aguayo */}
      <PatronPantalla tipo="caminos" />

      {/* 4. BARRA SUPERIOR DEL MAPA: Buscador de comunidad */}
      <div className="tarpuy-card-physical p-4 sm:p-5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1">
            <CommunitySearchCombobox
              selectedZoneId={activeZoneId}
              selectedCommunityName={selectedCommunityName}
              onSelectCommunity={onSelectCommunity}
              variant="light"
            />
          </div>

          <div className="hidden md:block">
            <BotonGrande
              variante="primario"
              ilustracionId="pin_ubicacion"
              texto={qu ? "¿Maypitaq kachkani? (GPS)" : "¿Dónde estoy?"}
              onClick={handleDondeEstoy}
              className="text-xl px-7"
            />
          </div>
        </div>
      </div>

      {/* 1. MAPA BASE CÁLIDO (45% a 60% de la altura en celular, con controles +/- de 58 px) */}
      <div className="tarpuy-card-physical overflow-hidden">
        <div
          className={`tarpuy-warm-map ${
            tall
              ? "h-[52vh] min-h-[300px] max-h-[460px] sm:h-[460px]"
              : "h-[48vh] min-h-[280px] sm:h-96"
          } relative w-full`}
          style={{ backgroundColor: "var(--arena)" }}
        >
          {canUseLeaflet ? (
            <div ref={containerRef} className="w-full h-full z-10" />
          ) : (
            /* Mapa vectorial sin internet con el mismo estilo cálido de papel y arena */
            <div
              className="w-full h-full relative flex items-center justify-center p-4 select-none"
              style={{ backgroundColor: "var(--papel)" }}
            >
              <svg viewBox="0 0 360 220" className="w-full h-full">
                {/* Contorno cálido de Cochabamba */}
                <path
                  d="M 24 66 Q 98 22 195 34 T 330 88 Q 315 186 215 202 T 44 156 Z"
                  fill="var(--arena)"
                  stroke="var(--tinta)"
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
                {/* Camino dibujado entre las zonas */}
                <path
                  d="M 75 90 Q 135 95 190 110 T 285 155"
                  stroke="var(--ladrillo)"
                  strokeWidth="3"
                  strokeDasharray="5 5"
                  fill="none"
                />
                {zoneList.map((z) => {
                  const active = z.id === activeZoneId;
                  const perf =
                    PERFIL_VISUAL_ZONA[z.id] || PERFIL_VISUAL_ZONA.punata_valle_alto;
                  return (
                    <g
                      key={z.id}
                      onClick={() => onSelectZone(z.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={z.svgPos.x + 12}
                        cy={z.svgPos.y + 8}
                        r={active ? 26 : 20}
                        fill={`var(${perf.tokenAcento})`}
                        stroke="var(--tinta)"
                        strokeWidth={active ? "3.5" : "2.5"}
                      />
                      <rect
                        x={z.svgPos.x - 32}
                        y={z.svgPos.y + 38}
                        width="88"
                        height="24"
                        rx="12"
                        fill={active ? "var(--dorado)" : "var(--tarjeta)"}
                        stroke="var(--tinta)"
                        strokeWidth="2"
                      />
                      <text
                        x={z.svgPos.x + 12}
                        y={z.svgPos.y + 54}
                        textAnchor="middle"
                        fill="var(--tinta)"
                        fontSize="13"
                        fontWeight="800"
                      >
                        {z.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <span
                className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-extrabold"
                style={{
                  backgroundColor: "var(--hoja-suave)",
                  color: "var(--tinta)",
                  border: "var(--border-width-medium) solid var(--tinta)",
                }}
              >
                {qu ? "Saywiti mana internetwan" : "Mapa guardado sin internet"}
              </span>
            </div>
          )}
        </div>

        {/* En celular: Botón gigante "¿Dónde estoy?" justo debajo del mapa (zona del pulgar) */}
        <div
          className="md:hidden p-3.5"
          style={{
            backgroundColor: "var(--tarjeta)",
            borderTop: "1.5px solid var(--tinta)",
          }}
        >
          <BotonGrande
            variante="primario"
            ilustracionId="pin_ubicacion"
            texto={qu ? "¿Maypitaq kachkani? (GPS)" : "¿Dónde estoy?"}
            onClick={handleDondeEstoy}
            className="w-full text-xl justify-center"
          />
        </div>

        {/* 5. LEYENDA CON BOTONES GRANDES (>= 64 px) PARA ELEGIR ZONA DIRECTO */}
        <div
          className="p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-base font-bold"
          style={{
            backgroundColor: "var(--arena)",
            borderTop: "1.5px solid var(--tinta)",
          }}
        >
          <button
            type="button"
            onClick={() => onSelectZone("tapacari_zona_andina")}
            className="min-h-[64px] inline-flex items-center justify-center gap-2.5 px-3.5 py-2 rounded-2xl cursor-pointer"
            style={{
              backgroundColor:
                activeZoneId === "tapacari_zona_andina"
                  ? "var(--piedra-suave)"
                  : "var(--tarjeta)",
              border: "2px solid var(--tinta)",
              boxShadow:
                activeZoneId === "tapacari_zona_andina" ? "none" : "0 3px 0 var(--tinta)",
            }}
          >
            <span
              className="w-4 h-4 rounded-full inline-block shrink-0"
              style={{ backgroundColor: "var(--piedra)", border: "1.5px solid var(--tinta)" }}
            />
            <IlustracionTarpuy id="helada" size={28} />
            <span>Tapacarí (Altura y frío)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectZone("punata_valle_alto")}
            className="min-h-[64px] inline-flex items-center justify-center gap-2.5 px-3.5 py-2 rounded-2xl cursor-pointer"
            style={{
              backgroundColor:
                activeZoneId === "punata_valle_alto"
                  ? "var(--dorado-suave)"
                  : "var(--tarjeta)",
              border: "2px solid var(--tinta)",
              boxShadow:
                activeZoneId === "punata_valle_alto" ? "none" : "0 3px 0 var(--tinta)",
            }}
          >
            <span
              className="w-4 h-4 rounded-full inline-block shrink-0"
              style={{ backgroundColor: "var(--dorado)", border: "1.5px solid var(--tinta)" }}
            />
            <IlustracionTarpuy id="riego_gravedad" size={28} />
            <span>Punata (Valle y acequia)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectZone("mizque_cono_sur")}
            className="min-h-[64px] inline-flex items-center justify-center gap-2.5 px-3.5 py-2 rounded-2xl cursor-pointer"
            style={{
              backgroundColor:
                activeZoneId === "mizque_cono_sur"
                  ? "var(--hoja-suave)"
                  : "var(--tarjeta)",
              border: "2px solid var(--tinta)",
              boxShadow:
                activeZoneId === "mizque_cono_sur" ? "none" : "0 3px 0 var(--tinta)",
            }}
          >
            <span
              className="w-4 h-4 rounded-full inline-block shrink-0"
              style={{ backgroundColor: "var(--hoja)", border: "1.5px solid var(--tinta)" }}
            />
            <IlustracionTarpuy id="planta_crecida" size={28} />
            <span>Mizque / Trópico</span>
          </button>
        </div>
      </div>

      {/* 3. AL TOCAR UNA COMUNIDAD: TARJETA INFERIOR GRANDE CON PAISAJE, 3 DATOS CON DIBUJO,
             BOTÓN ENORME "USAR ESTA COMUNIDAD" Y ALTAVOZ */}
      {zonaActivaObj && (
        <section
          aria-label={`Comunidad seleccionada: ${zonaActivaObj.name}`}
          data-zona={zonaActivaObj.id}
          className="tarpuy-card-physical overflow-hidden"
          style={{ backgroundColor: "var(--tarjeta)" }}
        >
          {/* Franja de acento suave de la zona */}
          <div
            className="px-6 py-4 flex flex-wrap items-center justify-between gap-3"
            style={{ backgroundColor: "var(--acento-zona-suave)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="w-4 h-4 rounded-full inline-block"
                style={{ backgroundColor: "var(--acento-zona)" }}
              />
              <h3 className="tarpuy-title">
                {selectedCommunityName || zonaActivaObj.name} · {zonaActivaObj.sub}
              </h3>
            </div>

            <SelloCartilla
              texto={qu ? "Llaqta akllasqa" : "Chacra ubicada"}
              subtitulo={zonaActivaObj.name}
              color="ladrillo"
            />
          </div>

          <div className="p-6 sm:p-7 space-y-6">
            {/* Dibujo del paisaje de la zona */}
            <PaisajePorHora momento="amanecer" zona={perfilActivo.paisajeKey} />

            {/* Los 3 datos con dibujo (sin bordes gruesos ni cajas dentro de cajas) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div
                className="p-5 rounded-3xl flex flex-col items-center text-center gap-2.5"
                style={{ backgroundColor: "var(--arena)" }}
              >
                <div
                  className="w-18 h-18 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--cielo-suave)" }}
                >
                  <IlustracionTarpuy id={perfilActivo.dibujoAltura} size={50} />
                </div>
                <p className="font-bold text-xl leading-snug">
                  {qu ? perfilActivo.alturaSimpleQu : perfilActivo.alturaSimpleEs}
                </p>
                <span className="text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
                  {zonaActivaObj.elevation}
                </span>
              </div>

              <div
                className="p-5 rounded-3xl flex flex-col items-center text-center gap-2.5"
                style={{ backgroundColor: "var(--arena)" }}
              >
                <div
                  className="w-18 h-18 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--alerta-cuidado-suave)" }}
                >
                  <IlustracionTarpuy id={perfilActivo.dibujoRiesgo} size={50} />
                </div>
                <p className="font-bold text-xl leading-snug">
                  {qu ? perfilActivo.riesgoSimpleQu : perfilActivo.riesgoSimpleEs}
                </p>
                <span className="text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
                  {zonaActivaObj.risk}
                </span>
              </div>

              <div
                className="p-5 rounded-3xl flex flex-col items-center text-center gap-2.5"
                style={{ backgroundColor: "var(--arena)" }}
              >
                <div
                  className="w-18 h-18 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "var(--tierra-suave)" }}
                >
                  <IlustracionTarpuy id={perfilActivo.dibujoSuelo} size={50} />
                </div>
                <p className="font-bold text-xl leading-snug">
                  {qu ? perfilActivo.sueloSimpleQu : perfilActivo.sueloSimpleEs}
                </p>
                <span className="text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
                  {zonaActivaObj.zoneData?.soil_context?.texture_class ||
                    zonaActivaObj.sub}
                </span>
              </div>
            </div>

            {/* Botón enorme "Usar esta comunidad" + Botón de Altavoz */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <BotonGrande
                variante="primario"
                ilustracionId="casa"
                texto={
                  qu
                    ? `Kay llaqtata akllay (${zonaActivaObj.name})`
                    : `Usar esta comunidad (${zonaActivaObj.name})`
                }
                onClick={() => onSelectZone(zonaActivaObj.id)}
                className="flex-1 text-2xl py-4 justify-center"
              />

              <BotonAltavoz
                sonando={activeAudioKey === `mapa_zona_${zonaActivaObj.id}`}
                mostrarTexto={true}
                etiqueta={qu ? "Uyariy" : "Escuchar zona"}
                onClick={handleEscucharComunidad}
              />
            </div>

            {/* 6. MODO FÁCIL vs AVANZADO: Capas técnicas plegadas sin eliminarlas */}
            <div className="pt-2 space-y-3">
              <BotonGrande
                variante="secundario"
                ilustracionId="lupa"
                estado={mostrarCapasTecnicas ? "presionado" : "normal"}
                texto={
                  mostrarCapasTecnicas
                    ? qu
                      ? "Allpa yupaykunata pakay"
                      : "Ocultar capas técnicas del terreno"
                    : qu
                    ? "Allpa yupaykunata qhaway"
                    : "Ver capas técnicas (altura exacta, pendiente y suelo)"
                }
                onClick={() => setMostrarCapasTecnicas((v) => !v)}
              />

              {mostrarCapasTecnicas && (
                <div
                  className="p-5 rounded-3xl space-y-4"
                  style={{
                    backgroundColor: "var(--arena)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        backgroundColor: "var(--tarjeta)",
                        border: "1.5px solid var(--tinta)",
                      }}
                    >
                      <span
                        className="text-sm font-bold block"
                        style={{ color: "var(--tinta-suave)" }}
                      >
                        Altura sobre el nivel del mar
                      </span>
                      <strong className="text-xl font-extrabold">
                        {zonaActivaObj.zoneData?.elevation_msnm || zonaActivaObj.elevation}
                      </strong>
                    </div>

                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        backgroundColor: "var(--tarjeta)",
                        border: "1.5px solid var(--tinta)",
                      }}
                    >
                      <span
                        className="text-sm font-bold block"
                        style={{ color: "var(--tinta-suave)" }}
                      >
                        Pendiente del terreno
                      </span>
                      <strong className="text-xl font-extrabold">
                        {zonaActivaObj.zoneData?.slope_category || zonaActivaObj.risk}
                      </strong>
                    </div>

                    <div
                      className="p-4 rounded-2xl"
                      style={{
                        backgroundColor: "var(--tarjeta)",
                        border: "1.5px solid var(--tinta)",
                      }}
                    >
                      <span
                        className="text-sm font-bold block"
                        style={{ color: "var(--tinta-suave)" }}
                      >
                        Textura del suelo
                      </span>
                      <strong className="text-xl font-extrabold">
                        {zonaActivaObj.zoneData?.soil_context?.texture_class ||
                          "Franco andino"}
                      </strong>
                    </div>
                  </div>

                  <p className="text-base font-bold" style={{ color: "var(--tinta)" }}>
                    <strong>Comunidades y pueblos en esta zona:</strong> {zonaActivaObj.towns}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Ventana emergente de Mamá Tomasa en la pantalla de Mapa */}
      <MamaTomasaAyuda
        titulo={
          qu
            ? `Saywiti · ${selectedCommunityName || zonaActivaObj?.name || ""}`
            : `Tu comunidad: ${selectedCommunityName || zonaActivaObj?.name || ""}`
        }
        pose={errorGpsAmable ? "alerta" : "mapa"}
        semaforoPrincipal={errorGpsAmable ? "amarillo" : "verde"}
        mensaje={
          errorGpsAmable
            ? qu
              ? "Mana GPS tarirparisunkichu. Saywitipi llaqtaykita ñit'iy."
              : "No pude ubicarte con el GPS. Toca tu comunidad en el mapa."
            : qu
            ? `${selectedCommunityName || zonaActivaObj?.name} llaqtaq pachanta qhaway:`
            : `Semáforo del terreno en ${selectedCommunityName || zonaActivaObj?.name}:`
        }
        tarjetas={[
          {
            id: "riesgo_zona",
            dibujoId: perfilActivo.dibujoRiesgo,
            pose: "alerta",
            semaforo:
              zonaActivaObj?.id === "tapacari_zona_andina" ? "rojo" : "amarillo",
            titulo: qu ? perfilActivo.riesgoSimpleQu : perfilActivo.riesgoSimpleEs,
            frase: zonaActivaObj?.risk || "Cuidar los cultivos según la temporada.",
          },
          {
            id: "suelo_zona",
            dibujoId: perfilActivo.dibujoSuelo,
            pose: "siembra",
            semaforo: "verde",
            titulo: qu ? perfilActivo.sueloSimpleQu : perfilActivo.sueloSimpleEs,
            frase: `${qu ? perfilActivo.alturaSimpleQu : perfilActivo.alturaSimpleEs} (${
              zonaActivaObj?.elevation || ""
            }).`,
          },
          {
            id: "ayuda_gps",
            dibujoId: "pin_ubicacion",
            pose: "mapa",
            semaforo: errorGpsAmable ? "amarillo" : "verde",
            titulo: qu ? "Kay suyupi llaqtakuna" : "Pueblos de esta zona",
            frase: zonaActivaObj?.towns || "Toca el mapa para cambiar de comunidad.",
          },
        ]}
        onListen={handleEscucharComunidad}
        isSpeaking={activeAudioKey === `mapa_zona_${zonaActivaObj?.id}`}
        badgeCount={3}
        tonoAvisoPrincipal={errorGpsAmable ? "cuidado" : "normal"}
        lang={lang}
        abiertoControlado={abiertoMamaTomasa}
        onCambiarAbierto={setAbiertoMamaTomasa}
      />
    </div>
  );
}
