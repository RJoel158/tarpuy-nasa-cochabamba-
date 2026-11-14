import React, { useState } from "react";
import {
  BotonGrande,
  TarjetaGrande,
  BotonAltavoz,
  SeparadorAndino,
  EtiquetaLogo,
} from "./TarpuyBaseComponents.jsx";
import {
  CATALOGO_ILUSTRACIONES,
  IlustracionTarpuy,
} from "../illustrations/TarpuyIllustrations.jsx";

/**
 * PÁGINA TEMPORAL DE PRUEBA — FASE 1 + FASE 1B (SISTEMA VISUAL Y PALETA COMPLETA)
 * ===============================================================================
 * Muestra la paleta completa con su rol semántico, sus variantes (suave, fuerte,
 * oscura), los 4 avisos del clima, los acentos por zona (Tapacarí, Punata,
 * Chapare), botones físicos, tarjetas, leyendas de gráficos y las 24 ilustraciones.
 * Cero colores hexadecimales sueltos en este componente.
 */

const GRUPOS_PALETA = [
  {
    familia: "Papel, Tarjeta, Arena y Tinta (Base)",
    significado: "Fondos grandes siempre en papel, tarjeta o arena. Tinta para texto y todos los bordes gruesos.",
    dibujo: "casa",
    muestras: [
      { token: "--papel", bg: "var(--papel)", fg: "var(--tinta)", rol: "Fondo general crema cálido", ratio: "14.76:1 AAA" },
      { token: "--tarjeta", bg: "var(--tarjeta)", fg: "var(--tinta)", rol: "Superficie de tarjetas y etiqueta de logos", ratio: "15.97:1 AAA" },
      { token: "--arena", bg: "var(--arena)", fg: "var(--tinta)", rol: "Paneles y zonas secundarias", ratio: "13.48:1 AAA" },
      { token: "--tinta", bg: "var(--tinta)", fg: "var(--tarjeta)", rol: "Texto principal y bordes gruesos", ratio: "15.97:1 AAA" },
      { token: "--tinta-suave", bg: "var(--tinta-suave)", fg: "var(--tarjeta)", rol: "Texto secundario sobre papel/tarjeta", ratio: "7.90:1 AAA" },
    ],
  },
  {
    familia: "Hoja = Cultivo, «Sí», Acción Principal",
    significado: "Botones de continuar y confirmar, plantas sanas, evapotranspiración y acento de Chapare.",
    dibujo: "brote",
    muestras: [
      { token: "--hoja-suave", bg: "var(--hoja-suave)", fg: "var(--hoja-oscura)", rol: "Fondo suave de cultivo", ratio: "5.67:1 AA" },
      { token: "--hoja", bg: "var(--hoja)", fg: "var(--tarjeta)", rol: "Relleno de hojas, separador y Chapare", ratio: "4.70:1 AA" },
      { token: "--hoja-oscura", bg: "var(--hoja-oscura)", fg: "var(--tarjeta)", rol: "Botón principal y texto verde sobre crema", ratio: "7.11:1 AAA" },
    ],
  },
  {
    familia: "Dorado = Lo Recomendado, Lo Importante, El Sol",
    significado: "Sol, maíz, cosecha, opción recomendada y acento de Punata (nunca texto sobre crema).",
    dibujo: "sol",
    muestras: [
      { token: "--dorado-suave", bg: "var(--dorado-suave)", fg: "var(--dorado-oscuro)", rol: "Fondo suave de opción recomendada", ratio: "5.90:1 AA" },
      { token: "--dorado", bg: "var(--dorado)", fg: "var(--tinta)", rol: "Relleno de sol, sello e íconos", ratio: "7.75:1 AAA" },
      { token: "--dorado-oscuro", bg: "var(--dorado-oscuro)", fg: "var(--tarjeta)", rol: "Texto oscuro y borde sobre dorado suave", ratio: "7.45:1 AAA" },
    ],
  },
  {
    familia: "Cielo = Agua, Lluvia y Riego (Único Azul)",
    significado: "Exclusivo para agua, lluvia, riego, voz y temperatura mínima.",
    dibujo: "gota_agua",
    muestras: [
      { token: "--cielo-suave", bg: "var(--cielo-suave)", fg: "var(--cielo-oscuro)", rol: "Fondo suave de zona de agua", ratio: "6.49:1 AA" },
      { token: "--cielo", bg: "var(--cielo)", fg: "var(--tinta)", rol: "Gotas, barras de lluvia e íconos", ratio: "4.83:1 AA" },
      { token: "--cielo-oscuro", bg: "var(--cielo-oscuro)", fg: "var(--tarjeta)", rol: "Botón de agua/altavoz y texto sobre crema", ratio: "7.90:1 AAA" },
    ],
  },
  {
    familia: "Tierra = Suelo, Adobe y Chacra",
    significado: "Suelo, parcela, tubérculos, herramientas y línea de temperatura máxima.",
    dibujo: "tierra_humeda",
    muestras: [
      { token: "--tierra-suave", bg: "var(--tierra-suave)", fg: "var(--tierra-oscura)", rol: "Fondo suave de suelo / parcela", ratio: "6.93:1 AA" },
      { token: "--tierra", bg: "var(--tierra)", fg: "var(--tinta)", rol: "Terracota de suelo y adobe", ratio: "4.52:1 AA" },
      { token: "--tierra-oscura", bg: "var(--tierra-oscura)", fg: "var(--tarjeta)", rol: "Tierra húmeda, texto y estado presionado", ratio: "8.89:1 AAA" },
    ],
  },
  {
    familia: "Ladrillo y Piedra = Textil Andino, «Estás aquí» y Zona Tapacarí",
    significado: "Ladrillo para detalles decorativos de chakana y marcador «estás aquí» (nunca aviso). Piedra para Tapacarí.",
    dibujo: "quinua",
    muestras: [
      { token: "--ladrillo-suave", bg: "var(--ladrillo-suave)", fg: "var(--ladrillo-oscuro)", rol: "Fondo suave de marcador actual", ratio: "9.54:1 AAA" },
      { token: "--ladrillo", bg: "var(--ladrillo)", fg: "var(--tarjeta)", rol: "Chakana, teja y pin «estás aquí»", ratio: "8.69:1 AAA" },
      { token: "--piedra-suave", bg: "var(--piedra-suave)", fg: "var(--piedra-oscura)", rol: "Fondo suave de zona Tapacarí", ratio: "6.93:1 AA" },
      { token: "--piedra", bg: "var(--piedra)", fg: "var(--tinta)", rol: "Acento de zona Tapacarí y divisores", ratio: "5.58:1 AA" },
      { token: "--piedra-oscura", bg: "var(--piedra-oscura)", fg: "var(--tarjeta)", rol: "Texto y borde de zona Tapacarí", ratio: "8.87:1 AAA" },
    ],
  },
];

export default function PaginaTemporalFase1({ onClosePreview }) {
  const [altavozSonando, setAltavozSonando] = useState(true);
  const [modoVista, setModoVista] = useState("facil"); // 'facil' | 'avanzado'
  const [contadorToques, setContadorToques] = useState(0);

  return (
    <div
      data-modo={modoVista}
      className="tarpuy-page-surface min-h-screen px-4 sm:px-8 py-8 space-y-10 max-w-5xl mx-auto"
    >
      {/* ENCABEZADO + LOGOS EN ETIQUETA DE PAPEL CLARO (sobre claro y sobre oscuro) */}
      <header className="tarpuy-card-physical overflow-hidden">
        {/* Franja oscura para comprobar que la etiqueta de logos convive en cualquier fondo */}
        <div
          className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
          style={{
            backgroundColor: "var(--tinta)",
            color: "var(--tarjeta)",
            borderBottom: "var(--border-width-thick) solid var(--tinta)",
          }}
        >
          <div className="space-y-0.5">
            <span className="font-extrabold uppercase tracking-wider text-sm">
              Fase 1 + Fase 1B · Identidad y Reglas de Color
            </span>
            <p className="text-base" style={{ color: "var(--arena)" }}>
              Logos conservados tal cual sobre etiqueta crema con borde de tinta:
            </p>
          </div>

          <EtiquetaLogo>
            <img
              src="/logos/nasa-space-apps.png"
              alt="NASA International Space Apps Challenge"
              className="h-10 w-auto object-contain"
            />
            <span
              className="h-7 w-0.5"
              style={{ backgroundColor: "var(--piedra)" }}
              aria-hidden="true"
            />
            <img
              src="/logos/alcaldia-cochabamba-escudo.jpg"
              alt="Alcaldía de Cochabamba"
              className="h-10 w-auto object-contain"
            />
          </EtiquetaLogo>
        </div>

        <div className="p-6 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="tarpuy-title">Paleta Campesina Andina y Sistema Visual</h1>
            <p className="tarpuy-body" style={{ color: "var(--tinta-suave)" }}>
              Cero azul espacial frío. Colores cálidos de mercado, aguayo y chacra en cosecha, con significado fijo en toda la aplicación.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <BotonGrande
              variante="secundario"
              ilustracionId="mano_toca"
              texto={modoVista === "facil" ? "Modo Fácil" : "Modo Avanzado"}
              onClick={() => setModoVista((m) => (m === "facil" ? "avanzado" : "facil"))}
            />
            {onClosePreview && (
              <BotonGrande
                variante="secundario"
                ilustracionId="casa"
                texto="Ver app actual"
                onClick={onClosePreview}
              />
            )}
          </div>
        </div>
      </header>

      <SeparadorAndino />

      {/* SECCIÓN 1: PALETA COMPLETA Y QUÉ SIGNIFICA CADA COLOR */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="tarpuy-subtitle">
            1. Paleta Completa, Variantes (Suave / Fuerte / Oscura) y Significado Fijo
          </h2>
          <p className="tarpuy-body" style={{ color: "var(--tinta-suave)" }}>
            Cada color enseña sin necesidad de leer: Hoja = acción y cultivo, Dorado = recomendado y sol, Cielo = agua, Tierra = suelo, Ladrillo = detalle y ubicación.
          </p>
        </div>

        <div className="space-y-6">
          {GRUPOS_PALETA.map((grupo) => (
            <div key={grupo.familia} className="tarpuy-card-physical p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--arena)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <IlustracionTarpuy id={grupo.dibujo} size={44} />
                </div>
                <div>
                  <h3 className="tarpuy-subtitle">{grupo.familia}</h3>
                  <p className="tarpuy-body" style={{ color: "var(--tinta-suave)" }}>
                    {grupo.significado}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {grupo.muestras.map((m) => (
                  <div
                    key={m.token}
                    className="p-4 rounded-2xl flex flex-col justify-between gap-2"
                    style={{
                      backgroundColor: m.bg,
                      color: m.fg,
                      border: "var(--border-width-medium) solid var(--tinta)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <code className="font-extrabold text-base">{m.token}</code>
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-extrabold"
                        style={{
                          backgroundColor: "var(--tarjeta)",
                          color: "var(--tinta)",
                          border: "1.5px solid var(--tinta)",
                        }}
                      >
                        {m.ratio}
                      </span>
                    </div>
                    <p className="font-bold text-base leading-snug">{m.rol}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 2: LOS 4 AVISOS DEL CLIMA (Únicos colores intensos de la app) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="tarpuy-subtitle">
            2. Los 4 Avisos del Clima (Tranquilo, Cuidado, Peligro Cercano y Helada/Sequía Crítica)
          </h2>
          <p className="tarpuy-body" style={{ color: "var(--tinta-suave)" }}>
            Ámbar, naranja y rojo nunca se usan para decorar: son exclusivos de alertas y siempre van con dibujo + palabra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TarjetaGrande
            semaforo="tranquilo"
            etiquetaSemaforo="1. Tranquilo · Buen tiempo"
            ilustracionId="tierra_humeda"
            titulo="Buen día para sembrar"
            texto="La tierra está húmeda y templada. Puedes sembrar con calma hoy."
          />

          <TarjetaGrande
            semaforo="cuidado"
            etiquetaSemaforo="2. Cuidado · Atención"
            ilustracionId="viento"
            titulo="Viento fuerte en la tarde"
            texto="El viento puede secar los surcos. Riega temprano por la mañana."
          />

          <TarjetaGrande
            semaforo="peligro_cercano"
            etiquetaSemaforo="3. Peligro cercano"
            ilustracionId="tierra_seca"
            titulo="La tierra se está secando"
            texto="Pasarán varios días sin lluvia. Cubre el suelo con paja o chala."
          />

          <TarjetaGrande
            semaforo="critico"
            etiquetaSemaforo="4. Helada o sequía crítica"
            ilustracionId="helada"
            titulo="Va a helar esta noche"
            texto="El frío quemará los brotes tiernos al amanecer. Tapa tus plantas hoy."
          />
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 3: ACENTOS POR ZONA (--acento-zona: Tapacarí, Punata, Chapare) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="tarpuy-subtitle">
            3. Acentos Suaves por Zona (Tapacarí = Piedra, Punata = Dorado, Chapare = Hoja)
          </h2>
          <p className="tarpuy-body" style={{ color: "var(--tinta-suave)" }}>
            El token <code>--acento-zona</code> pinta la franja superior de identificación sin saturar el fondo de la tarjeta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TarjetaGrande
            zona="tapacari"
            nombreZona="Tapacarí · Cordillera"
            ilustracionId="papa"
            titulo="Zona Alta (--piedra)"
            texto="Laderas de altura con cultivo de papa, quinua y cuidado contra heladas."
          />

          <TarjetaGrande
            zona="punata"
            nombreZona="Punata · Valle Alto"
            ilustracionId="maiz"
            titulo="Valle Alto (--dorado)"
            texto="Valles maiceros y forrajeros donde cuidar cada riego es lo principal."
          />

          <TarjetaGrande
            zona="chapare"
            nombreZona="Chapare · Trópico"
            ilustracionId="planta_crecida"
            titulo="Trópico (--hoja)"
            texto="Mucha lluvia y vegetación; prioridad en drenaje y cobertura del suelo."
          />
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 4: BOTONES FÍSICOS, RECOMENDADO Y VOZ */}
      <section className="tarpuy-card-physical p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="tarpuy-subtitle">
            4. Botones Físicos, Tarjeta «Recomendado» (--dorado) y Altavoz
          </h2>
          <p className="tarpuy-body" style={{ color: "var(--tinta-suave)" }}>
            Máximo 3 colores con significado por vista; un solo protagonista indica qué tocar ({contadorToques} toques).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <BotonGrande
            variante="primario"
            ilustracionId="semilla"
            texto="Continuar hoy"
            onClick={() => setContadorToques((n) => n + 1)}
          />
          <BotonGrande
            variante="agua"
            ilustracionId="gota_agua"
            texto="Ver el agua"
            onClick={() => setContadorToques((n) => n + 1)}
          />
          <BotonGrande
            variante="secundario"
            ilustracionId="casa"
            texto="Volver a inicio"
            onClick={() => setContadorToques((n) => n + 1)}
          />
          <BotonGrande
            variante="primario"
            ilustracionId="lluvia"
            texto="Deshabilitado"
            estado="deshabilitado"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 items-center">
          <TarjetaGrande
            recomendado={true}
            ilustracionId="haba"
            titulo="Sembrar haba después del maíz"
            texto="El fondo --dorado-suave y el sello --dorado destacan la mejor opción sin cansar la vista."
          />

          <div
            className="p-6 rounded-3xl flex flex-col items-center text-center gap-4"
            style={{
              backgroundColor: "var(--arena)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            <p className="tarpuy-subtitle">Botón de Altavoz Grande</p>
            <BotonAltavoz
              sonando={altavozSonando}
              mostrarTexto={true}
              etiqueta="Escuchar pantalla"
              onClick={() => setAltavozSonando((s) => !s)}
            />
          </div>
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 5: LEYENDA ACCESIBLE PARA GRÁFICOS Y MAPA (Dibujo + Texto + Color) */}
      <section className="tarpuy-card-physical p-6 sm:p-8 space-y-5">
        <div className="space-y-1">
          <h2 className="tarpuy-subtitle">
            5. Reglas de Color para Gráficos y Mapa (Siempre con dibujo y palabra)
          </h2>
          <p className="tarpuy-body" style={{ color: "var(--tinta-suave)" }}>
            Preparado para Modo Avanzado y Mapa: nunca se usa solo color para diferenciar series.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{
              backgroundColor: "var(--tierra-suave)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            <IlustracionTarpuy id="sol" size={40} />
            <div>
              <span className="font-extrabold block">Calor del día (Temp. máx.)</span>
              <code className="text-sm font-bold">--tierra</code>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{
              backgroundColor: "var(--cielo-suave)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            <IlustracionTarpuy id="lluvia" size={40} />
            <div>
              <span className="font-extrabold block">Lluvia y Temp. mínima</span>
              <code className="text-sm font-bold">--cielo</code>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{
              backgroundColor: "var(--hoja-suave)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            <IlustracionTarpuy id="planta_crecida" size={40} />
            <div>
              <span className="font-extrabold block">Consumo de planta (ET0)</span>
              <code className="text-sm font-bold">--hoja</code>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{
              backgroundColor: "var(--alerta-critico-suave)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            <IlustracionTarpuy id="helada" size={40} />
            <div>
              <span className="font-extrabold block">Días con helada</span>
              <code className="text-sm font-bold">--alerta-critico</code>
            </div>
          </div>

          <div
            className="p-4 rounded-2xl flex items-center gap-3"
            style={{
              backgroundColor: "var(--ladrillo-suave)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            <IlustracionTarpuy id="casa" size={40} />
            <div>
              <span className="font-extrabold block">«Estás aquí» en el mapa</span>
              <code className="text-sm font-bold">--ladrillo</code>
            </div>
          </div>
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 6: LAS 24 ILUSTRACIONES CON LA PALETA DEFINITIVA */}
      <section className="tarpuy-card-physical p-6 sm:p-8 space-y-5">
        <h2 className="tarpuy-subtitle">
          6. Las 24 Ilustraciones Hechas a Mano con la Paleta Fase 1B
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {CATALOGO_ILUSTRACIONES.map(({ id, nombre, Component }, idx) => (
            <div
              key={id}
              className="p-4 rounded-2xl flex flex-col items-center text-center gap-2"
              style={{
                backgroundColor: "var(--arena)",
                border: "var(--border-width-medium) solid var(--tinta)",
              }}
            >
              <Component size={64} animated={id === "altavoz" && altavozSonando} />
              <span className="font-extrabold leading-tight">
                {idx + 1}. {nombre}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
