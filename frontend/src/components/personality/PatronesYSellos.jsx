import React from "react";

/**
 * TARPUY NASA COCHABAMBA — PATRONES CON SENTIDO Y SELLOS DE CARTILLA (FASE 1C)
 * ============================================================================
 * 4. PATRONES CON SENTIDO:
 *    Motivos andinos (chakana, terrazas, zig-zag de aguayo, ondas y hojas)
 *    usados SOLO como bordes y separadores (nunca sobre texto), con uso fijo:
 *    - 'terrazas' = Pantalla de SIEMBRA
 *    - 'ondas'    = Pantalla de CLIMA
 *    - 'caminos'  = Pantalla de MAPA
 *    - 'hojas'    = Pantalla de DATOS
 *
 * 5. SELLOS DE CARTILLA:
 *    Sellos dibujados tipo libreta de campo ("Plan de siembra listo",
 *    "Alerta revisada", etc.) en --ladrillo y --dorado.
 *    Sin puntos, niveles ni rankings competitivos.
 *
 * Cero códigos hexadecimales sueltos: usa únicamente variables CSS de tokens.css.
 */

export const CATALOGO_PATRONES_PANTALLA = [
  {
    id: "ondas",
    pantalla: "Clima",
    nombre: "Ondas de agua y viento + Chakana (Uso fijo: CLIMA)",
    descripcion: "Representa el curso de la lluvia, el aire y el ciclo del tiempo.",
  },
  {
    id: "terrazas",
    pantalla: "Siembra",
    nombre: "Terrazas agrícolas andinas (Uso fijo: SIEMBRA)",
    descripcion: "Andenes escalonados de cultivo en tierra, hoja y dorado.",
  },
  {
    id: "caminos",
    pantalla: "Mapa",
    nombre: "Caminos y zig-zag de aguayo (Uso fijo: MAPA)",
    descripcion: "Senderos entre comunidades, linderos de chacra y mojón «estás aquí».",
  },
  {
    id: "hojas",
    pantalla: "Datos",
    nombre: "Hojas y semillas ordenadas (Uso fijo: DATOS)",
    descripcion: "Registro ordenado de observaciones del campo y del satélite.",
  },
];

export function PatronPantalla({
  tipo = "terrazas", // 'terrazas' (Siembra) | 'ondas' (Clima) | 'caminos' (Mapa) | 'hojas' (Datos)
  mostrarEtiquetaUso = false,
  className = "",
}) {
  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`w-full select-none overflow-hidden flex flex-col items-center gap-1 ${className}`}
    >
      <svg
        viewBox="0 0 640 32"
        className="w-full h-8"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Líneas laterales de encuadre */}
        <path d="M4 16H115M525 16H636" stroke="var(--piedra)" strokeWidth="2.2" strokeLinecap="round" />

        {tipo === "ondas" && (
          <g>
            {/* Ondas de agua y viento (--cielo y --dorado) para CLIMA */}
            <path
              d="M125 16C140 6 155 6 170 16C185 26 200 26 215 16C230 6 245 6 260 16"
              stroke="var(--cielo)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M135 22C150 14 165 14 180 22C195 30 210 30 225 22"
              stroke="var(--cielo-oscuro)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Chakana central */}
            <path
              d="M314 6H326V11H331V21H326V26H314V21H309V11H314V6Z"
              fill="var(--dorado)"
              stroke="var(--tinta)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="320" cy="16" r="2.8" fill="var(--tarjeta)" />
            <path
              d="M380 16C395 6 410 6 425 16C440 26 455 26 470 16C485 6 500 6 515 16"
              stroke="var(--cielo)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M415 22C430 14 445 14 460 22C475 30 490 30 505 22"
              stroke="var(--cielo-oscuro)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </g>
        )}

        {tipo === "terrazas" && (
          <g>
            {/* Andenes / terrazas escalonadas (--tierra, --hoja, --dorado) para SIEMBRA */}
            <path
              d="M125 24H160V17H195V10H230V17H265V24H290"
              stroke="var(--tinta)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="160" y="18" width="35" height="6" fill="var(--tierra)" />
            <rect x="195" y="11" width="35" height="6" fill="var(--hoja)" />
            <rect x="230" y="18" width="35" height="6" fill="var(--dorado)" />

            {/* Chakana central en hoja */}
            <path
              d="M314 6H326V11H331V21H326V26H314V21H309V11H314V6Z"
              fill="var(--hoja)"
              stroke="var(--tinta)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="320" cy="16" r="2.8" fill="var(--tarjeta)" />

            <path
              d="M350 24H375V17H410V10H445V17H480V24H515"
              stroke="var(--tinta)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <rect x="375" y="18" width="35" height="6" fill="var(--dorado)" />
            <rect x="410" y="11" width="35" height="6" fill="var(--hoja)" />
            <rect x="445" y="18" width="35" height="6" fill="var(--tierra)" />
          </g>
        )}

        {tipo === "caminos" && (
          <g>
            {/* Zig-zag de aguayo y camino con mojones (--ladrillo, --piedra, --dorado) para MAPA */}
            <path
              d="M125 22L148 9L171 22L194 9L217 22L240 9L263 22L286 9"
              stroke="var(--ladrillo)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="171" cy="22" r="3" fill="var(--dorado)" stroke="var(--tinta)" strokeWidth="1.5" />
            <circle cx="240" cy="9" r="3" fill="var(--dorado)" stroke="var(--tinta)" strokeWidth="1.5" />

            {/* Chakana central en ladrillo ("estás aquí") */}
            <path
              d="M314 6H326V11H331V21H326V26H314V21H309V11H314V6Z"
              fill="var(--ladrillo)"
              stroke="var(--tinta)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="320" cy="16" r="3" fill="var(--tarjeta)" />

            <path
              d="M354 9L377 22L400 9L423 22L446 9L469 22L492 9L515 22"
              stroke="var(--ladrillo)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="400" cy="9" r="3" fill="var(--dorado)" stroke="var(--tinta)" strokeWidth="1.5" />
            <circle cx="469" cy="22" r="3" fill="var(--dorado)" stroke="var(--tinta)" strokeWidth="1.5" />
          </g>
        )}

        {tipo === "hojas" && (
          <g>
            {/* Hojas ordenadas en par a lo largo del tallo (--hoja y --dorado) para DATOS */}
            <path d="M125 16H288M352 16H515" stroke="var(--tinta)" strokeWidth="2.2" strokeLinecap="round" />
            {[155, 205, 255, 385, 435, 485].map((x, idx) => (
              <g key={x}>
                <path
                  d={`M${x} 16C${x - 8} 8 ${x + 4} 5 ${x + 10} 11C${x + 6} 16 ${x} 16 ${x} 16Z`}
                  fill={idx % 2 === 0 ? "var(--hoja)" : "var(--dorado)"}
                  stroke="var(--tinta)"
                  strokeWidth="1.6"
                />
                <path
                  d={`M${x} 16C${x - 8} 24 ${x + 4} 27 ${x + 10} 21C${x + 6} 16 ${x} 16 ${x} 16Z`}
                  fill={idx % 2 === 0 ? "var(--dorado)" : "var(--hoja)"}
                  stroke="var(--tinta)"
                  strokeWidth="1.6"
                />
              </g>
            ))}

            {/* Chakana central */}
            <path
              d="M314 6H326V11H331V21H326V26H314V21H309V11H314V6Z"
              fill="var(--piedra)"
              stroke="var(--tinta)"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <circle cx="320" cy="16" r="2.8" fill="var(--tarjeta)" />
          </g>
        )}
      </svg>
      {mostrarEtiquetaUso && (
        <span className="text-xs font-extrabold uppercase tracking-wider" style={{ color: "var(--tinta-suave)" }}>
          Patrón fijo: {tipo.toUpperCase()}
        </span>
      )}
    </div>
  );
}

/**
 * 5. SELLOS TIPO CARTILLA ("Plan de siembra listo", "Alerta revisada")
 *    En --ladrillo y --dorado. Sin puntos, niveles ni rankings.
 */
export const CATALOGO_SELLOS_CARTILLA = [
  {
    id: "plan_listo",
    texto: "Plan de siembra listo",
    subtitulo: "Guardado en tu cartilla",
    color: "dorado",
  },
  {
    id: "alerta_revisada",
    texto: "Alerta revisada",
    subtitulo: "Aviso leído hoy",
    color: "ladrillo",
  },
  {
    id: "chacra_ubicada",
    texto: "Chacra ubicada",
    subtitulo: "Zona confirmada",
    color: "dorado",
  },
  {
    id: "datos_guardados",
    texto: "Guardado sin internet",
    subtitulo: "Listo para consultar",
    color: "ladrillo",
  },
];

export function SelloCartilla({
  texto = "Plan de siembra listo",
  subtitulo = "Confirmado",
  color = "dorado", // 'dorado' | 'ladrillo'
  className = "",
}) {
  const esLadrillo = color === "ladrillo";
  const bg = esLadrillo ? "var(--ladrillo-suave)" : "var(--dorado-suave)";
  const accent = esLadrillo ? "var(--ladrillo)" : "var(--dorado)";
  const ink = esLadrillo ? "var(--ladrillo-oscuro)" : "var(--dorado-oscuro)";

  return (
    <div
      role="status"
      className={`inline-flex items-center gap-3.5 px-4 py-3 select-none ${className}`}
      style={{
        backgroundColor: bg,
        color: "var(--tinta)",
        border: "var(--border-width-thick) solid var(--tinta)",
        borderRadius: "var(--radius-btn)",
        outline: `2px dashed ${accent}`,
        outlineOffset: "-6px",
      }}
    >
      {/* Escudo circular tipo sello de goma de libreta agrícola */}
      <svg width="46" height="46" viewBox="0 0 48 48" fill="none" className="shrink-0" aria-hidden="true">
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="var(--tarjeta)"
          stroke="var(--tinta)"
          strokeWidth="2.8"
        />
        <circle
          cx="24"
          cy="24"
          r="16.5"
          fill={accent}
          stroke="var(--tinta)"
          strokeWidth="2"
          strokeDasharray="4 2.5"
        />
        {/* Check grueso dibujado a mano */}
        <path
          d="M15.5 24.5L21.5 30.5L33 18.5"
          stroke={esLadrillo ? "var(--tarjeta)" : "var(--tinta)"}
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div className="text-left leading-tight pr-1">
        <span
          className="block text-xs font-extrabold uppercase tracking-wider"
          style={{ color: ink }}
        >
          {subtitulo}
        </span>
        <span className="block font-extrabold" style={{ fontSize: "var(--font-size-body-min)" }}>
          {texto}
        </span>
      </div>
    </div>
  );
}
