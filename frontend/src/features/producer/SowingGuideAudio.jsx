import React, { useEffect, useRef } from "react";
import { Loader2, Square } from "lucide-react";
import { buildStrategyNarration } from "../../services/narration.js";
import { BotonGrande } from "../../components/ui/TarpuyBaseComponents.jsx";
import { DibujoAltavoz } from "../../components/illustrations/TarpuyIllustrations.jsx";

export default function SowingGuideAudio({strategy, indicators, lang, onSpeak, onStopAudio, activeAudioKey, loading}) {
  const audioLang = lang === "qu" ? "qu" : "es";
  const stopRef = useRef(onStopAudio);
  stopRef.current = onStopAudio;
  const text = buildStrategyNarration(strategy, audioLang, indicators);
  const key = `sowing_guide_${strategy.strategy_id}_${audioLang}`;
  const active = activeAudioKey === key;
  useEffect(() => () => stopRef.current?.(), [text, key]);
  const label = active ? (loading ? "Cancelar preparación" : "Detener guía") : "Escuchar guía";
  return <>
    <BotonGrande
      variante={active ? "agua" : "secundario"}
      estado={active ? "presionado" : "normal"}
      texto={label}
      dibujo={loading && active
        ? <Loader2 size={40} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        : active ? <Square size={32} aria-hidden="true" /> : <DibujoAltavoz size={40} animated={false} />}
      className="w-full sm:w-auto max-w-full"
      onClick={() => active ? onStopAudio?.() : onSpeak?.(text, audioLang, key)}
    />
    <span role="status" aria-live="polite" className="sr-only">
      {active ? (loading ? "Preparando el audio completo…" : "Reproduciendo el plan seleccionado.") : ""}
    </span>
  </>;
}
