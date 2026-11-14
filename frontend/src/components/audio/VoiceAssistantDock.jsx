import React from "react";
import { Volume2, Square, Languages } from "lucide-react";

export default function VoiceAssistantDock({
  voiceLang = "qu",
  onChangeVoiceLang,
  isSpeaking = false,
  subtitle = "",
  onSpeakGuide,
  onStop,
}) {
  const defaultSubtitle =
    voiceLang === "qu"
      ? "Uyariyta munaspa ñit'iy: Guía paso a paso parcelaykipaq."
      : "Toca un botón de audio para escuchar en Quechua o Castellano.";

  const activeSubtitle = subtitle && subtitle.trim().length > 0 ? subtitle : defaultSubtitle;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm p-4 sm:p-5 space-y-3.5">
      {/* Header with Title and Language Toggle Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-200">
            <Languages className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 leading-tight">
              Asistente de Voz Andino
            </h3>
            <p className="text-[11px] text-stone-500">
              Instrucciones orales adaptadas para campo y baja conectividad
            </p>
          </div>
        </div>

        {/* Language Pills */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
          <button
            type="button"
            onClick={() => onChangeVoiceLang("qu")}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              voiceLang === "qu"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Qhichwa (Quechua)
          </button>
          <button
            type="button"
            onClick={() => onChangeVoiceLang("es")}
            className={`px-3 py-1 rounded-lg font-bold transition ${
              voiceLang === "es"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Castellano (Español)
          </button>
        </div>
      </div>

      {/* Prominent Audio Action Row */}
      <div className="flex items-center gap-3">
        {isSpeaking ? (
          <button
            type="button"
            onClick={onStop}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Square className="w-4 h-4 fill-current" />
            <span>Detener Audio</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onSpeakGuide}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Volume2 className="w-5 h-5 text-emerald-100" />
            <span>Escuchar Guía Paso a Paso de esta Parcela</span>
          </button>
        )}

        {/* 5-bar Equalizer Visualizer */}
        <div
          className="flex items-end justify-center gap-1 h-10 px-3 bg-stone-100 rounded-xl border border-stone-200 shrink-0"
          title={isSpeaking ? "Reproduciendo audio" : "Audio en pausa"}
        >
          {[0, 150, 300, 450, 200].map((delayMs, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full transition-all ${
                isSpeaking
                  ? "bg-emerald-600 voice-bar"
                  : "bg-stone-300 h-2"
              }`}
              style={{
                height: isSpeaking ? `${14 + (idx % 3) * 8}px` : "8px",
                animationDelay: `${delayMs}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Live High-Contrast Subtitle Strip */}
      <div className="bg-stone-900 text-stone-100 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium border border-stone-800 min-h-[44px] flex items-center gap-2.5 shadow-inner">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            isSpeaking ? "bg-emerald-400 animate-pulse" : "bg-stone-500"
          }`}
        />
        <p className="leading-snug">{activeSubtitle}</p>
      </div>
    </div>
  );
}
