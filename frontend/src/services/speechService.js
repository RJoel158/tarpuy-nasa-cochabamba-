export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function stopSpeaking() {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function speakText(text, options = {}) {
  if (!isSpeechSupported() || !text) return false;
  stopSpeaking();

  const { lang = "es-BO", rate = 0.88, pitch = 1.0, onStart, onSubtitle, onEnd, onError } = options;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  if (typeof window !== "undefined" && window.speechSynthesis.getVoices) {
    const voices = window.speechSynthesis.getVoices();
    const prefix = lang.split("-")[0];
    const match =
      voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("es"));
    if (match) utterance.voice = match;
  }

  if (onStart) utterance.onstart = onStart;
  if (onSubtitle) onSubtitle(text);
  if (onEnd) utterance.onend = onEnd;

  utterance.onerror = (e) => {
    if (e.error !== "canceled" && e.error !== "interrupted") {
      if (onError) onError(e);
    }
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    if (onEnd) onEnd();
    return false;
  }
}

export function speakQuechua(text, callbacks = {}) {
  return speakText(text, { lang: "es-BO", rate: 0.85, pitch: 0.95, ...callbacks });
}

export function speakSpanish(text, callbacks = {}) {
  return speakText(text, { lang: "es-419", rate: 0.88, pitch: 1.0, ...callbacks });
}

export function speakStepByStepGuide(zone, strategies = [], lang = "qu", callbacks = {}) {
  const { onStart, onSubtitle, onEnd, onError } = callbacks;
  if (!isSpeechSupported()) {
    if (onStart) onStart();
    const fallback = lang === "qu" ? "Qhichwa: Guía parcelapaq" : "Guía de parcela iniciada";
    if (onSubtitle) onSubtitle(fallback);
    setTimeout(() => { if (onEnd) onEnd(); }, 1200);
    return false;
  }

  const strat = strategies[0] || {};
  const isQu = lang === "qu";
  const steps = [
    {
      sub: isQu ? `Paso 1: ${zone?.name || "Zona"} - Qhiswa pacha` : `Paso 1: ${zone?.name || "Zona"} - Diagnóstico NASA`,
      spoken: isQu
        ? `Allillanchu, ${zone?.quechua_name || zone?.name || "Cochabamba"}. NASA satélite qhawasqanmanjina jallp'anchikta kallpachasun.`
        : `Diagnóstico satelital para ${zone?.name || "Cochabamba"}. Analizamos el balance hídrico y cobertura.`,
    },
    {
      sub: isQu ? `Paso 2: ${strat.name_qu || strat.name_es || "Tarpuy rotación"}` : `Paso 2: Rotación ${strat.name_es || "Recomendada"}`,
      spoken: isQu
        ? `Tarpuy yuyaychasqa: ${strat.name_qu || strat.name_es || "Kallpachaq rotación"}. ${strat.summary_qu || strat.summary_es || "Allpa mana ch'akinanpaq."}`
        : `Recomendación principal: ${strat.name_es || "Cultivo de cobertura"}. ${strat.summary_es || "Protege el suelo y conserva humedad."}`,
    },
    {
      sub: isQu ? "Paso 3: Allpata jallch'ay" : "Paso 3: Siembra y retención hídrica",
      spoken: isQu
        ? "Siembrata wakichiy paray qallariypi, jallp'ata ama q'ala saqiychu yakuta jallch'ananpaq."
        : "Prepare la siembra al inicio de lluvias y evite dejar el suelo desnudo para retener agua profunda.",
    },
  ];

  stopSpeaking();
  if (onStart) onStart();

  function playStep(idx) {
    if (idx >= steps.length) {
      if (onSubtitle) onSubtitle("");
      if (onEnd) onEnd();
      return;
    }
    const step = steps[idx];
    if (onSubtitle) onSubtitle(step.sub);
    const fn = isQu ? speakQuechua : speakSpanish;
    fn(step.spoken, {
      onEnd: () => playStep(idx + 1),
      onError: (e) => {
        if (e.error !== "canceled" && e.error !== "interrupted" && onError) onError(e);
        if (onEnd) onEnd();
      },
    });
  }

  playStep(0);
  return true;
}
