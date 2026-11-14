import React, { useState } from "react";
import {
  BotonGrande,
  TarjetaGrande,
  BotonAltavoz,
  SeparadorAndino,
  EtiquetaLogo,
} from "./TarpuyBaseComponents.jsx";
import { CATALOGO_ILUSTRACIONES } from "../illustrations/TarpuyIllustrations.jsx";
import {
  CropIllustration,
  WaterIllustration,
  ToolIllustration,
} from "../../features/producer/FarmPictograms.jsx";
import { WeatherIllustration } from "../alerts/WeatherPictograms.jsx";

/**
 * PÁGINA TEMPORAL DE PRUEBA — FASE 1: SISTEMA VISUAL
 * ===================================================
 * Sirve únicamente para revisar juntos los tokens, los componentes base
 * (BotonGrande, TarjetaGrande, BotonAltavoz, SeparadorAndino) y las 24
 * ilustraciones hechas a mano antes de pasar a las siguientes fases.
 * Cero colores hexadecimales sueltos en este archivo.
 */

export default function PaginaTemporalFase1({ onClosePreview }) {
  const [altavozSonando, setAltavozSonando] = useState(true);
  const [contadorToques, setContadorToques] = useState(0);

  return (
    <div className="tarpuy-page-surface min-h-screen px-4 sm:px-8 py-8 space-y-10 max-w-5xl mx-auto">
      {/* Encabezado de la página temporal + Logos en etiqueta de papel claro */}
      <header className="tarpuy-card-physical p-6 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <span
            className="inline-block px-3.5 py-1 font-extrabold uppercase tracking-wider"
            style={{
              backgroundColor: "var(--color-bg-card-alt)",
              border: "var(--border-width-medium) solid var(--color-border-strong)",
              borderRadius: "var(--radius-pill)",
            }}
          >
            Página temporal de prueba · Fase 1
          </span>
          <h1 className="tarpuy-title">Sistema Visual Tarpuy</h1>
          <p className="tarpuy-body" style={{ color: "var(--color-text-secondary)" }}>
            Almanaque campesino andino: papel cálido, bordes gruesos, botones físicos y dibujos hechos a mano.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Logos originales sin recolorear sobre etiqueta de papel claro */}
          <EtiquetaLogo>
            <img
              src="/logos/nasa-space-apps.png"
              alt="NASA International Space Apps Challenge"
              className="h-11 w-auto object-contain"
            />
            <span
              className="h-8 w-0.5"
              style={{ backgroundColor: "var(--color-border-subtle)" }}
              aria-hidden="true"
            />
            <img
              src="/logos/alcaldia-cochabamba-escudo.jpg"
              alt="Alcaldía de Cochabamba"
              className="h-11 w-auto object-contain"
            />
          </EtiquetaLogo>

          {onClosePreview && (
            <BotonGrande
              variante="secundario"
              ilustracionId="casa"
              texto="Ver app actual"
              onClick={onClosePreview}
            />
          )}
        </div>
      </header>

      <SeparadorAndino />

      {/* SECCIÓN 1: ESCALA TIPOGRÁFICA Y LENGUAJE SIN JERGA */}
      <section className="tarpuy-card-physical p-6 sm:p-8 space-y-4">
        <h2 className="tarpuy-subtitle">1. Tipografía Redondeada y Legible (WCAG AAA)</h2>
        <div
          className="p-5 rounded-2xl space-y-3"
          style={{
            backgroundColor: "var(--color-bg-card-alt)",
            border: "var(--border-width-medium) solid var(--color-border-subtle)",
          }}
        >
          <p className="tarpuy-title">Título: ¿Qué debo hacer hoy? (30–36 px)</p>
          <p className="tarpuy-subtitle">Subtítulo: La tierra está húmeda para sembrar (24 px)</p>
          <p className="tarpuy-body">
            Texto principal (18–20 px): Hoy es un buen día para sembrar maíz o papa en tu chacra. Números claros: 0 1 2 3 4 5 6 7 8 9.
          </p>
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 2: BOTÓN GRANDE (3 estados: normal, presionado, deshabilitado) */}
      <section className="tarpuy-card-physical p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="tarpuy-subtitle">
            2. Componente: BotonGrande (mínimo 64 px, físico, máx. 3 palabras)
          </h2>
          <p className="tarpuy-body" style={{ color: "var(--color-text-secondary)" }}>
            Tócalos para sentir cómo se hunden físicamente ({contadorToques} toques de prueba).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <span className="font-bold block">Estado 1: Normal</span>
            <BotonGrande
              variante="primario"
              ilustracionId="semilla"
              texto="Sembrar hoy"
              estado="normal"
              className="w-full"
              onClick={() => setContadorToques((n) => n + 1)}
            />
          </div>

          <div className="space-y-2">
            <span className="font-bold block">Estado 2: Presionado</span>
            <BotonGrande
              variante="primario"
              ilustracionId="mano_toca"
              texto="Ya tocado"
              estado="presionado"
              className="w-full"
              onClick={() => setContadorToques((n) => n + 1)}
            />
          </div>

          <div className="space-y-2">
            <span className="font-bold block">Estado 3: Deshabilitado</span>
            <BotonGrande
              variante="primario"
              ilustracionId="lluvia"
              texto="Sin señal"
              estado="deshabilitado"
              className="w-full"
            />
          </div>
        </div>

        {/* Variantes de salida clara ("Volver / Inicio" con dibujo de casa) */}
        <div className="pt-2 flex flex-wrap items-center gap-5">
          <BotonGrande
            variante="secundario"
            ilustracionId="casa"
            texto="Volver al inicio"
            onClick={() => setContadorToques((n) => n + 1)}
          />
          <BotonGrande
            variante="agua"
            ilustracionId="gota_agua"
            texto="Regar chacra"
            onClick={() => setContadorToques((n) => n + 1)}
          />
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 3: BOTÓN DE ALTAVOZ GRANDE Y ANIMADO */}
      <section className="tarpuy-card-physical p-6 sm:p-8 space-y-5">
        <h2 className="tarpuy-subtitle">
          3. Componente: BotonAltavoz (redondo, grande y con ondas animadas)
        </h2>
        <p className="tarpuy-body" style={{ color: "var(--color-text-secondary)" }}>
          Toca cualquiera de los botones de altavoz para encender o apagar la animación de voz.
        </p>

        <div className="flex flex-wrap items-center gap-8 pt-2">
          <div className="flex flex-col items-center gap-2">
            <BotonAltavoz
              sonando={altavozSonando}
              onClick={() => setAltavozSonando((s) => !s)}
            />
            <span className="font-bold">
              {altavozSonando ? "Sonando (ondas activas)" : "En silencio"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <BotonAltavoz
              sonando={altavozSonando}
              mostrarTexto={true}
              etiqueta="Escuchar consejo"
              onClick={() => setAltavozSonando((s) => !s)}
            />
            <span className="font-bold">Con texto corto</span>
          </div>
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 4: TARJETA GRANDE Y SEMÁFORO DE CLIMA (Dibujo + Palabra + Color) */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="tarpuy-subtitle">
            4. Componente: TarjetaGrande (ilustración arriba, texto abajo, semáforo con dibujo y palabra)
          </h2>
          <p className="tarpuy-body" style={{ color: "var(--color-text-secondary)" }}>
            Ámbar / Naranja / Rojo se usan exclusivamente para avisos de clima y siempre llevan dibujo y palabra.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TarjetaGrande
            semaforo="favorable"
            etiquetaSemaforo="Buen tiempo"
            ilustracionId="tierra_humeda"
            titulo="Buen día para sembrar"
            texto="La tierra está húmeda y templada. Puedes sembrar maíz o haba con tranquilidad."
            accion={
              <BotonGrande
                variante="primario"
                ilustracionId="semilla"
                texto="Ver siembra"
                onClick={() => setContadorToques((n) => n + 1)}
              />
            }
          />

          <TarjetaGrande
            semaforo="aviso"
            etiquetaSemaforo="Cuidado hoy"
            ilustracionId="tierra_seca"
            titulo="La tierra está seca"
            texto="Hará sol fuerte y poca lluvia esta semana. Tapa el suelo con paja o chala."
            accion={
              <BotonGrande
                variante="secundario"
                ilustracionId="riego_goteo"
                texto="Cuidar agua"
                onClick={() => setContadorToques((n) => n + 1)}
              />
            }
          />

          <TarjetaGrande
            semaforo="peligro"
            etiquetaSemaforo="Peligro esta noche"
            ilustracionId="helada"
            titulo="Va a helar esta noche"
            texto="El frío bajará mucho en la madrugada. Cubre tus plantas tiernas con paja."
            accion={
              <BotonAltavoz
                sonando={altavozSonando}
                mostrarTexto={true}
                etiqueta="Oír aviso"
                onClick={() => setAltavozSonando((s) => !s)}
              />
            }
          />
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 5: CATÁLOGO DE LAS 24 ILUSTRACIONES PROPIAS HECHAS A MANO */}
      <section className="tarpuy-card-physical p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h2 className="tarpuy-subtitle">
            5. Set Completo de 24 Ilustraciones Hechas a Mano (SVG con trazo irregular)
          </h2>
          <p className="tarpuy-body" style={{ color: "var(--color-text-secondary)" }}>
            Cada dibujo usa exclusivamente variables CSS de tokens.css y contornos tipo grabado campesino.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {CATALOGO_ILUSTRACIONES.map(({ id, nombre, Component }, idx) => (
            <div
              key={id}
              className="p-4 rounded-2xl flex flex-col items-center text-center gap-2"
              style={{
                backgroundColor: "var(--color-bg-card-alt)",
                border: "var(--border-width-medium) solid var(--color-border-strong)",
              }}
            >
              <Component size={68} animated={id === "altavoz" && altavozSonando} />
              <span className="font-extrabold leading-tight">
                {idx + 1}. {nombre}
              </span>
            </div>
          ))}
        </div>
      </section>

      <SeparadorAndino />

      {/* SECCIÓN 6: COMPATIBILIDAD CON FARMPICTOGRAMS Y WEATHERPICTOGRAMS */}
      <section className="tarpuy-card-physical p-6 sm:p-8 space-y-4">
        <h2 className="tarpuy-subtitle">
          6. Compatibilidad con FarmPictograms y WeatherPictograms existentes
        </h2>
        <p className="tarpuy-body" style={{ color: "var(--color-text-secondary)" }}>
          Los componentes actuales ya usan automáticamente los nuevos dibujos sin romper ninguna pantalla existente:
        </p>
        <div className="flex flex-wrap items-center gap-6 pt-2">
          <CropIllustration cropId="papa_huaycha" className="w-16 h-16" />
          <CropIllustration cropId="maiz_valle" className="w-16 h-16" />
          <CropIllustration cropId="haba" className="w-16 h-16" />
          <CropIllustration cropId="quinua" className="w-16 h-16" />
          <CropIllustration cropId="avena_vicia" className="w-16 h-16" />
          <WaterIllustration id="full_canal_well" className="w-16 h-16" />
          <WaterIllustration id="deficit_auxiliary" className="w-16 h-16" />
          <ToolIllustration id="manual_yunta" className="w-16 h-16" />
          <ToolIllustration id="mechanized" className="w-16 h-16" />
          <WeatherIllustration kind="frost" animated={true} className="w-16 h-16" />
          <WeatherIllustration kind="rain_good" animated={true} className="w-16 h-16" />
        </div>
      </section>
    </div>
  );
}
