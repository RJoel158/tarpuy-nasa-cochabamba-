import React from "react";
import { PROPUESTAS_NOMBRE_PERSONAJE } from "../../data/guiaVozYTono.js";

/**
 * TARPUY NASA COCHABAMBA — PERSONAJE GUÍA Y GLOBO DE HABLA (FASE 1C)
 * ==================================================================
 * 1. PersonajeGuía: Campesina mayor cochabambina ilustrada con trazo a mano
 *    irregular, rostro amable y digno, sombrero valluno de copa alta y manta
 *    (llijlla) en colores de la paleta aprobada (--ladrillo, --dorado, --hoja,
 *    --tierra, --arena, --tarjeta, --tinta).
 *    Entregado en 8 poses reutilizables:
 *    - 'saludo'
 *    - 'alerta'
 *    - 'siembra'
 *    - 'riego'
 *    - 'cosecha'
 *    - 'mapa'
 *    - 'pensando'
 *    - 'despedida'
 *
 * 2. GloboHabla: Globo de texto corto con borde grueso (--tinta), esquinas
 *    redondeadas y cola orientada hacia el personaje.
 *
 * Cero códigos hexadecimales sueltos: usa únicamente variables CSS de tokens.css.
 */

export const POSES_PERSONAJE_GUIA = [
  {
    id: "saludo",
    nombre: "1. Saludo",
    funcion: "Recibir al agricultor y señalar la acción principal del día",
    fraseEjemplo: "Buen día. Miremos cómo amaneció tu chacra hoy.",
  },
  {
    id: "alerta",
    nombre: "2. Alerta",
    funcion: "Avisar con calma y firmeza cuando viene helada, viento o sequía",
    fraseEjemplo: "Atención hoy: esta noche hará mucho frío. Tapa tus brotes.",
  },
  {
    id: "siembra",
    nombre: "3. Siembra",
    funcion: "Señalar la fecha recomendada y acompañar la elección de semilla",
    fraseEjemplo: "La tierra está húmeda. Es buena semana para sembrar.",
  },
  {
    id: "riego",
    nombre: "4. Riego",
    funcion: "Orientar cuándo regar y cuándo ahorrar agua",
    fraseEjemplo: "Hoy no hace falta regar; la lluvia de ayer alcanzó bien.",
  },
  {
    id: "cosecha",
    nombre: "5. Cosecha",
    funcion: "Acompañar la etapa final del cultivo y el resumen de temporada",
    fraseEjemplo: "Tu cultivo ya está listo. Aprovecha las mañanas secas.",
  },
  {
    id: "mapa",
    nombre: "6. Mapa",
    funcion: "Ayudar a ubicar la comunidad o tocar la parcela en el mapa",
    fraseEjemplo: "Toca aquí tu zona para ver el clima de tu terreno.",
  },
  {
    id: "pensando",
    nombre: "7. Pensando",
    funcion: "Explicar una comparación o un consejo del Saber del Día",
    fraseEjemplo: "Si sembramos haba después de la papa, el suelo descansa.",
  },
  {
    id: "despedida",
    nombre: "8. Despedida",
    funcion: "Confirmar que todo quedó guardado al cerrar o imprimir cartilla",
    fraseEjemplo: "Tu plan quedó listo. Que tengas buen día en la chacra.",
  },
];

/* Base común del personaje: sombrero tradicional cochabambino, trenzas, rostro sabio y manta */
function RostroYMantaBase({ expresion = "amable" }) {
  return (
    <g>
      {/* Fondo circular suave de respaldo para dar contraste limpio */}
      <circle
        cx="60"
        cy="62"
        r="52"
        fill="var(--arena)"
        stroke="var(--tinta)"
        strokeWidth="2.6"
      />

      {/* Copa y ala del sombrero tradicional cochabambino (hecho a mano) */}
      <path
        d="M35 28C36 15 44 10 60 10C76 10 84 15 85 28Z"
        fill="var(--tarjeta)"
        stroke="var(--tinta)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cinta tejida del sombrero en ladrillo y dorado */}
      <path
        d="M35 24C48 26 72 26 85 24L86 29C72 31 48 31 34 29Z"
        fill="var(--ladrillo)"
        stroke="var(--tinta)"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="26.5" r="2.3" fill="var(--dorado)" />
      <circle cx="49" cy="26.5" r="1.8" fill="var(--dorado)" />
      <circle cx="71" cy="26.5" r="1.8" fill="var(--dorado)" />

      {/* Ala ancha del sombrero */}
      <path
        d="M18 31C32 27 88 27 102 31C96 36 24 36 18 31Z"
        fill="var(--tarjeta)"
        stroke="var(--tinta)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Trenzas laterales con tullmas (borlas tradicionales) */}
      <path
        d="M36 42C31 54 29 68 31 82"
        stroke="var(--tinta)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <path
        d="M84 42C89 54 91 68 89 82"
        stroke="var(--tinta)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <circle
        cx="31"
        cy="84"
        r="3.8"
        fill="var(--ladrillo)"
        stroke="var(--tinta)"
        strokeWidth="2"
      />
      <circle
        cx="89"
        cy="84"
        r="3.8"
        fill="var(--ladrillo)"
        stroke="var(--tinta)"
        strokeWidth="2"
      />

      {/* Rostro cálido de mujer mayor sabia */}
      <path
        d="M39 34C38 52 45 64 60 64C75 64 82 52 81 34Z"
        fill="var(--tierra-suave)"
        stroke="var(--tinta)"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      {/* Mejillas cálidas */}
      <circle cx="46" cy="50" r="3.8" fill="var(--tierra)" opacity="0.45" />
      <circle cx="74" cy="50" r="3.8" fill="var(--tierra)" opacity="0.45" />

      {/* Líneas suaves de sabiduría (experiencia, sin caricaturizar) */}
      <path
        d="M42 44C43 43 44 43 45 44M75 44C76 43 77 43 78 44"
        stroke="var(--tinta-suave)"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      {/* Cejas y ojos expresivos */}
      {expresion === "alerta" ? (
        <>
          <path
            d="M45 39L54 41M75 39L66 41"
            stroke="var(--tinta)"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <circle cx="50" cy="45" r="2.4" fill="var(--tinta)" />
          <circle cx="70" cy="45" r="2.4" fill="var(--tinta)" />
        </>
      ) : expresion === "pensando" ? (
        <>
          <path
            d="M45 39C48 37 52 38 54 40M66 40C68 38 72 38 75 40"
            stroke="var(--tinta)"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <circle cx="50" cy="45" r="2.2" fill="var(--tinta)" />
          <circle cx="70" cy="44" r="2.2" fill="var(--tinta)" />
        </>
      ) : (
        <>
          <path
            d="M45 40C48 38 52 38 54 40M66 40C68 38 72 38 75 40"
            stroke="var(--tinta)"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <circle cx="50" cy="45" r="2.3" fill="var(--tinta)" />
          <circle cx="70" cy="45" r="2.3" fill="var(--tinta)" />
        </>
      )}

      {/* Nariz sencilla */}
      <path
        d="M60 44V50L57 51"
        stroke="var(--tinta)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sonrisa / gesto */}
      {expresion === "alerta" ? (
        <path
          d="M54 56C58 54.5 62 54.5 66 56"
          stroke="var(--tinta)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      ) : expresion === "pensando" ? (
        <path
          d="M55 56C58 56.5 63 55.5 66 54.5"
          stroke="var(--tinta)"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M52 54.5C56 58.5 64 58.5 68 54.5"
          stroke="var(--tinta)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}

      {/* Blusa clara y manta andina (llijlla) con franja de aguayo */}
      <path
        d="M28 104C31 78 42 67 60 67C78 67 89 78 92 104Z"
        fill="var(--ladrillo)"
        stroke="var(--tinta)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Cuello de blusa */}
      <path
        d="M49 67L60 81L71 67Z"
        fill="var(--tarjeta)"
        stroke="var(--tinta)"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Franjas tejidas de la manta (--dorado y --hoja) */}
      <path
        d="M34 92H86"
        stroke="var(--dorado)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M32 97H88"
        stroke="var(--hoja)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Prendedor (tupu) tradicional en el pecho */}
      <circle
        cx="60"
        cy="83"
        r="3.8"
        fill="var(--dorado)"
        stroke="var(--tinta)"
        strokeWidth="2"
      />
    </g>
  );
}

/* Brazos y elementos que señalan según cada una de las 8 poses */
function DetallePose({ pose }) {
  switch (pose) {
    case "alerta":
      return (
        <g>
          {/* Mano izquierda levantada advirtiendo y señalando la alerta */}
          <path
            d="M32 82C22 74 16 62 18 48"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle
            cx="18"
            cy="45"
            r="6"
            fill="var(--tierra-suave)"
            stroke="var(--tinta)"
            strokeWidth="2.5"
          />
          {/* Mano derecha señalando hacia el aviso */}
          <path
            d="M86 80L106 68"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle
            cx="108"
            cy="67"
            r="5.5"
            fill="var(--tierra-suave)"
            stroke="var(--tinta)"
            strokeWidth="2.4"
          />
          {/* Símbolo de atención junto a la mano */}
          <polygon
            points="18,16 28,34 8,34"
            fill="var(--alerta-cuidado)"
            stroke="var(--tinta)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path d="M18 22V27" stroke="var(--tinta)" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="18" cy="30.5" r="1.3" fill="var(--tinta)" />
        </g>
      );

    case "siembra":
      return (
        <g>
          {/* Mano sosteniendo semillas doradas */}
          <path
            d="M34 84C24 84 18 78 16 70"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <ellipse
            cx="18"
            cy="68"
            rx="8"
            ry="5"
            fill="var(--tierra-suave)"
            stroke="var(--tinta)"
            strokeWidth="2.4"
          />
          <circle cx="16" cy="64" r="2.6" fill="var(--dorado)" stroke="var(--tinta)" strokeWidth="1.5" />
          <circle cx="21" cy="63" r="2.6" fill="var(--dorado)" stroke="var(--tinta)" strokeWidth="1.5" />
          {/* Mano derecha con brote verde señalando la siembra */}
          <path
            d="M86 82L104 72"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M104 72V56"
            stroke="var(--hoja-oscura)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M104 62C97 59 95 52 102 51C105 51 106 57 104 62Z"
            fill="var(--hoja)"
            stroke="var(--tinta)"
            strokeWidth="2.2"
          />
          <path
            d="M104 60C111 57 113 50 106 49C103 49 102 55 104 60Z"
            fill="var(--hoja)"
            stroke="var(--tinta)"
            strokeWidth="2.2"
          />
        </g>
      );

    case "riego":
      return (
        <g>
          {/* Mano sosteniendo cántaro / vasija con agua (--cielo) */}
          <path
            d="M84 82L100 72"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle
            cx="101"
            cy="66"
            r="9"
            fill="var(--tierra)"
            stroke="var(--tinta)"
            strokeWidth="2.5"
          />
          {/* Gota grande de agua en --cielo */}
          <path
            d="M18 46C18 46 10 57 10 63C10 67.5 13.6 71 18 71C22.4 71 26 67.5 26 63C26 57 18 46 18 46Z"
            fill="var(--cielo)"
            stroke="var(--tinta)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Mano izquierda señalando la gota de agua */}
          <path
            d="M35 82L22 74"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>
      );

    case "cosecha":
      return (
        <g>
          {/* Mano izquierda sosteniendo mazorca de maíz (--dorado y --hoja) */}
          <path
            d="M34 84L20 72"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <ellipse
            cx="17"
            cy="60"
            rx="6"
            ry="11"
            fill="var(--dorado)"
            stroke="var(--tinta)"
            strokeWidth="2.4"
          />
          <path
            d="M11 63C10 70 15 73 17 73C19 73 24 70 23 63"
            fill="var(--hoja)"
            stroke="var(--tinta)"
            strokeWidth="2.2"
          />
          {/* Mano derecha señalando el logro */}
          <path
            d="M86 82L106 66"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle
            cx="107"
            cy="65"
            r="5.5"
            fill="var(--tierra-suave)"
            stroke="var(--tinta)"
            strokeWidth="2.4"
          />
        </g>
      );

    case "mapa":
      return (
        <g>
          {/* Croquis de parcela con pin --ladrillo ("estás aquí") */}
          <rect
            x="90"
            y="48"
            width="24"
            height="24"
            rx="5"
            fill="var(--tarjeta)"
            stroke="var(--tinta)"
            strokeWidth="2.5"
          />
          <path d="M92 60H112M102 50V70" stroke="var(--piedra)" strokeWidth="2" />
          <circle
            cx="102"
            cy="58"
            r="4.5"
            fill="var(--ladrillo)"
            stroke="var(--tinta)"
            strokeWidth="2"
          />
          {/* Mano señalando el mapa */}
          <path
            d="M84 82L98 72"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
        </g>
      );

    case "pensando":
      return (
        <g>
          {/* Mano apoyada cerca del mentón */}
          <path
            d="M42 84C38 74 44 66 51 61"
            stroke="var(--tinta)"
            strokeWidth="4.2"
            strokeLinecap="round"
          />
          <circle
            cx="52"
            cy="60"
            r="4.8"
            fill="var(--tierra-suave)"
            stroke="var(--tinta)"
            strokeWidth="2.2"
          />
          {/* Mano derecha indicando hacia el consejo */}
          <path
            d="M85 82L105 72"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle
            cx="106"
            cy="71"
            r="5"
            fill="var(--tierra-suave)"
            stroke="var(--tinta)"
            strokeWidth="2.4"
          />
        </g>
      );

    case "despedida":
      return (
        <g>
          {/* Mano levantada despidiéndose con cariño y sol dorado */}
          <path
            d="M86 80C96 72 102 60 102 48"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle
            cx="102"
            cy="45"
            r="6"
            fill="var(--tierra-suave)"
            stroke="var(--tinta)"
            strokeWidth="2.5"
          />
          <circle
            cx="18"
            cy="50"
            r="7"
            fill="var(--dorado)"
            stroke="var(--tinta)"
            strokeWidth="2.3"
          />
        </g>
      );

    case "saludo":
    default:
      return (
        <g>
          {/* Mano izquierda saludando */}
          <path
            d="M34 80C24 72 18 60 20 48"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle
            cx="20"
            cy="45"
            r="6"
            fill="var(--tierra-suave)"
            stroke="var(--tinta)"
            strokeWidth="2.5"
          />
          {/* Mano derecha señalando hacia lo importante de la pantalla */}
          <path
            d="M86 80L106 70"
            stroke="var(--tinta)"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle
            cx="108"
            cy="69"
            r="5.5"
            fill="var(--tierra-suave)"
            stroke="var(--tinta)"
            strokeWidth="2.4"
          />
        </g>
      );
  }
}

export function PersonajeGuia({
  pose = "saludo",
  size = 112,
  nombre = PROPUESTAS_NOMBRE_PERSONAJE[0].nombre,
  mostrarEtiquetaNombre = false,
  className = "",
}) {
  const expresion =
    pose === "alerta" ? "alerta" : pose === "pensando" ? "pensando" : "amable";

  return (
    <div className={`inline-flex flex-col items-center gap-1.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        role="img"
        aria-label={`${nombre} (${pose})`}
        className="shrink-0"
      >
        <RostroYMantaBase expresion={expresion} />
        <DetallePose pose={pose} />
      </svg>

      {mostrarEtiquetaNombre && (
        <span
          className="px-3 py-0.5 text-sm font-extrabold"
          style={{
            backgroundColor: "var(--tarjeta)",
            color: "var(--tinta)",
            border: "var(--border-width-medium) solid var(--tinta)",
            borderRadius: "var(--radius-pill)",
          }}
        >
          {nombre}
        </span>
      )}
    </div>
  );
}

/**
 * 2. GLOBO DE HABLA (Borde grueso, esquinas redondeadas, cola hacia el personaje)
 */
export function GloboHabla({
  texto,
  children,
  direccionCola = "izquierda", // 'izquierda' | 'derecha' | 'arriba' | 'abajo'
  tono = "normal",             // 'normal' | 'tranquilo' | 'cuidado' | 'peligro' | 'critico' | 'recomendado'
  etiquetaSuperior = null,
  className = "",
}) {
  const mapaTonos = {
    normal: {
      bg: "var(--tarjeta)",
      fg: "var(--tinta)",
    },
    tranquilo: {
      bg: "var(--alerta-tranquilo-suave)",
      fg: "var(--tinta)",
    },
    cuidado: {
      bg: "var(--alerta-cuidado-suave)",
      fg: "var(--tinta)",
    },
    peligro: {
      bg: "var(--alerta-peligro-suave)",
      fg: "var(--tinta)",
    },
    critico: {
      bg: "var(--alerta-critico-suave)",
      fg: "var(--tinta)",
    },
    recomendado: {
      bg: "var(--dorado-suave)",
      fg: "var(--tinta)",
    },
  };

  const estiloTono = mapaTonos[tono] || mapaTonos.normal;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Cola hacia la izquierda (cuando el personaje está a la izquierda) */}
      {direccionCola === "izquierda" && (
        <svg
          width="20"
          height="28"
          viewBox="0 0 20 28"
          className="shrink-0 -mr-1 z-10"
          aria-hidden="true"
        >
          <path
            d="M20 4L3 14L20 24Z"
            fill={estiloTono.bg}
            stroke="var(--tinta)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M19 6V22" stroke={estiloTono.bg} strokeWidth="4" />
        </svg>
      )}

      <div
        className="px-5 py-4 flex-1"
        style={{
          backgroundColor: estiloTono.bg,
          color: estiloTono.fg,
          border: "var(--border-width-thick) solid var(--tinta)",
          borderRadius: "var(--radius-card)",
          boxShadow: "0 4px 0 var(--tinta)",
        }}
      >
        {etiquetaSuperior && (
          <span
            className="block text-sm font-extrabold uppercase tracking-wide mb-1"
            style={{ color: "var(--tinta-suave)" }}
          >
            {etiquetaSuperior}
          </span>
        )}
        <p className="tarpuy-body font-bold">{texto || children}</p>
      </div>

      {/* Cola hacia la derecha (cuando el personaje está a la derecha) */}
      {direccionCola === "derecha" && (
        <svg
          width="20"
          height="28"
          viewBox="0 0 20 28"
          className="shrink-0 -ml-1 z-10"
          aria-hidden="true"
        >
          <path
            d="M0 4L17 14L0 24Z"
            fill={estiloTono.bg}
            stroke="var(--tinta)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M1 6V22" stroke={estiloTono.bg} strokeWidth="4" />
        </svg>
      )}
    </div>
  );
}

/**
 * Componente combinado listo para usar: Personaje Guía + Globo de Habla
 */
export function GuiaConGlobo({
  pose = "saludo",
  nombre = PROPUESTAS_NOMBRE_PERSONAJE[0].nombre,
  texto,
  tono = "normal",
  className = "",
}) {
  return (
    <div className={`flex flex-col sm:flex-row items-center gap-3 sm:gap-4 ${className}`}>
      <PersonajeGuia pose={pose} nombre={nombre} mostrarEtiquetaNombre={true} size={104} />
      <GloboHabla
        texto={texto}
        tono={tono}
        etiquetaSuperior={`${nombre} te dice:`}
        direccionCola="izquierda"
        className="w-full"
      />
    </div>
  );
}
