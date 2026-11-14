let activeAudio = null;
let activeBlobUrl = null;
const manifestPromises = new Map();

function cleanTextForKey(t = "", isSpanish = false) {
  let s = String(t);
  if (isSpanish) s = s.replace(/\([^)]*\)/g, "");
  return s
    .replace(/->/g, isSpanish ? ", luego " : ", chanta ")
    .replace(/\+/g, isSpanish ? " y " : "+")
    .replace(/—/g, ", ")
    .replace(/[¡!¿?]/g, isSpanish ? "" : ".")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

async function loadAudioManifest(url) {
  if (!manifestPromises.has(url)) {
    manifestPromises.set(
      url,
      fetch(url)
        .then((r) => (r.ok ? r.json() : { clips: {} }))
        .catch(() => ({ clips: {} }))
    );
  }
  return manifestPromises.get(url);
}

export function isSpeechSupported() {
  return typeof Audio !== "undefined" || (typeof window !== "undefined" && "speechSynthesis" in window);
}

export function stopSpeaking() {
  if (activeAudio) {
    try { activeAudio.pause(); activeAudio.currentTime = 0; } catch {}
    activeAudio = null;
  }
  if (activeBlobUrl) {
    try { URL.revokeObjectURL(activeBlobUrl); } catch {}
    activeBlobUrl = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try { window.speechSynthesis.cancel(); } catch {}
  }
}

function playAudioUrl(url, callbacks = {}, isBlob = false) {
  return new Promise((resolve) => {
    const audio = new Audio(url);
    activeAudio = audio;
    if (isBlob) activeBlobUrl = url;
    audio.onplay = () => callbacks.onStart?.();
    audio.onended = () => {
      if (isBlob && activeBlobUrl === url) { URL.revokeObjectURL(url); activeBlobUrl = null; }
      if (activeAudio === audio) activeAudio = null;
      callbacks.onEnd?.();
      resolve(true);
    };
    audio.onerror = () => {
      if (activeAudio === audio) activeAudio = null;
      resolve(false);
    };
    audio.play().catch(() => resolve(false));
  });
}

export function speakText(text, options = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
    options.onEnd?.();
    return false;
  }
  stopSpeaking();
  const { lang = "es-BO", rate = 0.98, pitch = 1.0, onStart, onSubtitle, onEnd, onError } = options;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  const voices = window.speechSynthesis.getVoices?.() || [];
  const prefix = lang.split("-")[0];
  const match = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase())
    || voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
    || voices.find((v) => v.lang.toLowerCase().startsWith("es"));
  if (match) utterance.voice = match;

  if (onStart) utterance.onstart = onStart;
  onSubtitle?.(text);
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = (e) => {
    if (e.error !== "canceled" && e.error !== "interrupted") onError?.(e);
    onEnd?.();
  };
  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    onEnd?.();
    return false;
  }
}

async function speakNeuralVoice(text, cfg, callbacks = {}) {
  stopSpeaking();
  const { clipKey, onSubtitle, onEngine, onEnd } = callbacks;
  if (onSubtitle && text) onSubtitle(text);

  try {
    const manifest = await loadAudioManifest(cfg.manifestUrl);
    const clips = manifest?.clips || {};
    const targetNorm = cleanTextForKey(text, cfg.isSpanish);
    const clip = (clipKey && clips[clipKey])
      || Object.values(clips).find((c) => cleanTextForKey(c.text, cfg.isSpanish) === targetNorm);

    if (clip?.url) {
      onEngine?.(cfg.offlineEngine);
      const ok = await playAudioUrl(clip.url, callbacks, false);
      if (ok) return true;
    }

    if (typeof navigator === "undefined" || navigator.onLine) {
      const resp = await fetch(cfg.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: String(text).slice(0, 480) }),
      });
      if (resp.ok) {
        const blobUrl = URL.createObjectURL(await resp.blob());
        onEngine?.(cfg.liveEngine);
        const ok = await playAudioUrl(blobUrl, callbacks, true);
        if (ok) return true;
      }
    }
  } catch {}

  onEngine?.("browser_fallback");
  return speakText(text, { lang: "es-BO", rate: cfg.fallbackRate, pitch: cfg.fallbackPitch, ...callbacks, onEnd });
}

export async function speakQuechua(text, callbacks = {}) {
  return speakNeuralVoice(text, {
    manifestUrl: "/audio/quh/manifest.json",
    endpoint: "/api/tts/quechua",
    offlineEngine: "native_quh_offline",
    liveEngine: "native_quh_live",
    isSpanish: false,
    fallbackRate: 0.82,
    fallbackPitch: 0.96,
  }, callbacks);
}

export async function speakSpanish(text, callbacks = {}) {
  return speakNeuralVoice(text, {
    manifestUrl: "/audio/es/manifest.json",
    endpoint: "/api/tts/spanish",
    offlineEngine: "native_es_offline",
    liveEngine: "native_es_live",
    isSpanish: true,
    fallbackRate: 0.98,
    fallbackPitch: 1.0,
  }, callbacks);
}

export function speakStepByStepGuide(zone, strategies = [], lang = "qu", callbacks = {}) {
  const { onStart, onSubtitle, onEnd } = callbacks;
  const zId = zone?.zone_id || "punata_valle_alto";
  const zName = zone?.quechua_name || zone?.name || "Cochabamba";
  const alt = strategies.find((s) => s.strategy_type !== "current_baseline") || strategies[0] || {};

  if (lang === "qu") {
    const sub = `Qhichwa (${zName}): ${alt.title_qu || "Jallp'a muyuy"} — ${alt.quechua_summary || ""}`;
    onStart?.();
    speakQuechua(alt.quechua_summary || zName, { ...callbacks, clipKey: `guide_${zId}`, onSubtitle: () => onSubtitle?.(sub) });
    return true;
  }

  const spokenEs = `Hola compañero productor de ${zone?.name || "Cochabamba"}. Recomendación principal: ${alt.title_es || "Rotación de descanso"}. ${alt.spanish_summary || ""}`;
  onStart?.();
  speakSpanish(spokenEs, { ...callbacks, clipKey: `guide_${zId}`, onSubtitle, onEnd });
  return true;
}
