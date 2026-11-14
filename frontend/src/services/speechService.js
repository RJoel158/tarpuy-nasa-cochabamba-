import { buildStrategyNarration } from "./narration.js";
let activeAudio = null;
let activeBlobUrl = null;
let playbackSession = 0;
let finishPlayback = null;
let activeUtterance = null;

function speechChunks(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  return clean.match(/.{1,240}(?:\s|$)|\S{1,240}/gu)?.map((part) => part.trim()) || [];
}
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
  playbackSession += 1;
  activeUtterance = null;
  if (activeAudio) {
    try { activeAudio.pause(); activeAudio.currentTime = 0; } catch {}
    activeAudio = null;
  }
  finishPlayback?.(false);
  finishPlayback = null;
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
    const finish = (ok) => {
      audio.onplay = audio.onended = audio.onerror = null;
      if (activeAudio === audio) activeAudio = null;
      if (finishPlayback === finish) finishPlayback = null;
      if (isBlob && activeBlobUrl === url) {
        URL.revokeObjectURL(url);
        activeBlobUrl = null;
      }
      resolve(ok);
    };
    finishPlayback = finish;
    audio.onplay = () => callbacks.onStart?.();
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    audio.play().catch(() => finish(false));
  });
}

export function speakText(text, options = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window) || !text) {
    options.onEnd?.();
    return false;
  }
  stopSpeaking();
  const { lang = "es-BO", rate = 0.98, pitch = 1.0, onStart, onSubtitle, onEnd, onError } = options;
  const session = playbackSession;
  const chunks = speechChunks(text);
  const voices = window.speechSynthesis.getVoices?.() || [];
  const prefix = lang.split("-")[0];
  const match = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase())
    || voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
    || voices.find((v) => v.lang.toLowerCase().startsWith("es"));
  onSubtitle?.(text);
  let index = 0;
  const speakNext = () => {
    if (session !== playbackSession) return;
    if (index === chunks.length) {
      activeUtterance = null;
      onEnd?.();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(chunks[index++]);
    activeUtterance = utterance;
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    if (match) utterance.voice = match;
    utterance.onstart = () => {
      if (session === playbackSession && index === 1) onStart?.();
    };
    utterance.onend = speakNext;
    utterance.onerror = (event) => {
      if (session !== playbackSession) return;
      activeUtterance = null;
      onError?.(event);
      onEnd?.();
    };
    try { window.speechSynthesis.speak(utterance); }
    catch (error) { utterance.onerror(error); }
  };
  speakNext();
  return true;
}

async function speakNeuralVoice(text, cfg, callbacks = {}) {
  stopSpeaking();
  const session = playbackSession;
  const { clipKey, onSubtitle, onEngine } = callbacks;
  if (!String(text || "").trim()) { callbacks.onEnd?.(); return false; }
  onSubtitle?.(text);
  try {
    const manifest = await loadAudioManifest(cfg.manifestUrl);
    if (session !== playbackSession) return false;
    const clips = manifest?.clips || {};
    const targetNorm = cleanTextForKey(text, cfg.isSpanish);
    const exact = (clip) => clip?.url && cleanTextForKey(clip.text, cfg.isSpanish) === targetNorm;
    const clip = exact(clips[clipKey]) ? clips[clipKey] : Object.values(clips).find(exact);
    if (clip) {
      onEngine?.(cfg.offlineEngine);
      const ok = await playAudioUrl(clip.url, callbacks);
      if (session !== playbackSession) return false;
      if (ok) { callbacks.onEnd?.(); return true; }
    }
    if (typeof navigator === "undefined" || navigator.onLine) {
      onEngine?.(cfg.liveEngine);
      for (const chunk of speechChunks(text)) {
        const resp = await fetch(cfg.endpoint, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: chunk }),
        });
        if (session !== playbackSession) return false;
        if (!resp.ok) throw new Error("Audio unavailable");
        const blob = await resp.blob();
        if (session !== playbackSession) return false;
        const ok = await playAudioUrl(URL.createObjectURL(blob), callbacks, true);
        if (session !== playbackSession) return false;
        if (!ok) throw new Error("Audio playback failed");
      }
      callbacks.onEnd?.();
      return true;
    }
  } catch {}
  if (session !== playbackSession) return false;
  if (callbacks.neuralOnly) {
    callbacks.onError?.(new Error("Native audio unavailable"));
    return false;
  }
  onEngine?.("browser_fallback");
  return speakText(text, { lang: cfg.isSpanish ? "es-BO" : "qu-BO",
    rate: cfg.fallbackRate, pitch: cfg.fallbackPitch, ...callbacks });

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
  const { onSubtitle, onEnd } = callbacks;
  const zId = zone?.zone_id || "punata_valle_alto";
  const zName = zone?.quechua_name || zone?.name || "Cochabamba";
  const alt = strategies.find((s) => s.strategy_type !== "current_baseline") || strategies[0] || {};

  if (!alt.crop_sequence?.length) {
    callbacks.onError?.(new Error("No recommendation explanation available"));
    onEnd?.();
    return false;
  }
  if (lang === "qu") {
    const sub = `Qhichwa (${zName}): ${alt.title_qu || "Jallp'a muyuy"} — ${alt.quechua_summary || ""}`;
    speakQuechua(buildStrategyNarration(alt, "qu"), { ...callbacks, clipKey: `guide_${zId}`, onSubtitle: () => onSubtitle?.(sub) });
    return true;
  }

  const spokenEs = `Recomendación para la zona de ${zone?.name || "Cochabamba"}. ${buildStrategyNarration(alt, "es")}`;
  speakSpanish(spokenEs, { ...callbacks, clipKey: `guide_${zId}`, onSubtitle, onEnd });
  return true;
}
