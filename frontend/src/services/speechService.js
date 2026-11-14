import { buildStrategyNarration } from "./narration.js";
let activeAudio = null;
let activeBlobUrl = null;
let playbackSession = 0;
let finishPlayback = null;
let activeUtterance = null;
let neuralPlayer = null;
let activeRequestController = null;

// Keep the element authorized by the user's click across asynchronous downloads.
function prepareNeuralPlayer(session) {
  neuralPlayer ||= new Audio();
  const player = neuralPlayer;
  player.src = "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==";
  player.volume = 1;
  player.muted = false;
  activeAudio = player;
  return player.play().then(() => {
    if (session === playbackSession) player.pause();
  }).catch(() => {});
}

function speechChunks(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  const chunks = [];
  let remaining = clean;
  while (remaining.length > 240) {
    const window = remaining.slice(0, 240);
    const boundaries = [...window.matchAll(/[.!?;](?=\s)/gu)];
    const sentenceEnd = boundaries.at(-1);
    const cut = sentenceEnd ? sentenceEnd.index + 1 : window.lastIndexOf(" ") > 0 ? window.lastIndexOf(" ") : 240;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
const manifestPromises = new Map();
const generatedAudio = new Map();

async function requestGeneratedAudio(endpoint, text, signal) {
  const key = JSON.stringify([endpoint, text]);
  if (generatedAudio.has(key)) return generatedAudio.get(key);
  const response = await fetch(endpoint, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });
  if (!response.ok) throw new Error("Audio unavailable");
  const blob = await response.blob();
  generatedAudio.set(key, blob);
  if (generatedAudio.size > 32) generatedAudio.delete(generatedAudio.keys().next().value);
  return blob;
}

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
  activeRequestController?.abort();
  activeRequestController = null;
  activeUtterance = null;
  if (activeAudio) {
    try { activeAudio.pause(); activeAudio.currentTime = 0; } catch {}
    activeAudio = null;
  }
  finishPlayback?.(false);
  finishPlayback = null;
  if (neuralPlayer) {
    neuralPlayer.pause();
    neuralPlayer.removeAttribute?.("src");
    neuralPlayer.load?.();
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
  const session = playbackSession;
  return new Promise((resolve) => {
    const audio = neuralPlayer || new Audio();
    audio.src = url;
    activeAudio = audio;
    if (isBlob) activeBlobUrl = url;
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      if (finishPlayback === finish) audio.onplay = audio.onended = audio.onerror = null;
      if (activeAudio === audio) activeAudio = null;
      if (finishPlayback === finish) finishPlayback = null;
      if (isBlob && activeBlobUrl === url) {
        URL.revokeObjectURL(url);
        activeBlobUrl = null;
      }
      resolve(ok);
    };
    finishPlayback = finish;
    audio.onplay = () => { if (session === playbackSession) callbacks.onStart?.(); };
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
  const match = voices.find((v) => v.localService && v.lang.toLowerCase().startsWith(prefix))
    || voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase())
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
    try {
      if (window.speechSynthesis.paused) window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    }
    catch (error) { utterance.onerror(error); }
  };
  speakNext();
  return true;
}

async function speakNeuralVoice(text, cfg, callbacks = {}) {
  stopSpeaking();
  const session = playbackSession;
  const { clipKey, onSubtitle, onEngine } = callbacks;
  const controller = new AbortController();
  activeRequestController = controller;
  if (!String(text || "").trim()) { callbacks.onEnd?.(); return false; }
  callbacks.onLoading?.(true);
  onSubtitle?.(text);
  try {
    await prepareNeuralPlayer(session);
    if (session !== playbackSession) return false;
    const manifest = cfg.manifestUrl ? await loadAudioManifest(cfg.manifestUrl) : { clips: {} };
    if (session !== playbackSession) return false;
    const clips = manifest?.clips || {};
    const targetNorm = cleanTextForKey(text, cfg.isSpanish);
    const exact = (clip) => clip?.url && cleanTextForKey(clip.text, cfg.isSpanish) === targetNorm;
    const clip = exact(clips[clipKey]) ? clips[clipKey] : Object.values(clips).find(exact);
    if (clip) {
      onEngine?.(cfg.offlineEngine);
      const response = await fetch(clip.url, { signal: controller.signal });
      if (!response.ok) throw new Error("Audio unavailable");
      const blob = await response.blob();
      if (session !== playbackSession) return false;
      callbacks.onLoading?.(false);
      const ok = await playAudioUrl(URL.createObjectURL(blob), callbacks, true);
      if (session !== playbackSession) return false;
      if (ok) { callbacks.onEnd?.(); return true; }
    }
    if (typeof navigator === "undefined" || navigator.onLine) {
      onEngine?.(cfg.liveEngine);
      callbacks.onLoading?.(true);
      const chunks = speechChunks(text);
      const request = (chunk) => requestGeneratedAudio(cfg.endpoint, chunk, controller.signal).catch(() => null);
      const audio = [];
      for (let index = 0; index < chunks.length; index++) {
        const blob = await request(chunks[index]);
        if (session !== playbackSession) return false;
        if (!blob) throw new Error("Audio unavailable");
        audio.push(blob);
      }
      callbacks.onLoading?.(false);
      for (const blob of audio) {
        const ok = await playAudioUrl(URL.createObjectURL(blob), callbacks, true);
        if (session !== playbackSession) return false;
        if (!ok) throw new Error("Audio playback failed");
      }
      callbacks.onEnd?.();
      return true;
    }
  } catch {}
  if (session !== playbackSession) return false;
  callbacks.onLoading?.(false);
  if (callbacks.neuralOnly) {
    callbacks.onError?.(new Error("Native audio unavailable"));
    callbacks.onEnd?.();
    return false;
  }
  if (!cfg.isSpanish) {
    callbacks.onError?.(new Error("South Bolivian Quechua voice unavailable"));
    callbacks.onEnd?.();
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
    endpoint: "/api/tts/spanish-natural",
    liveEngine: "spanish_natural",
    isSpanish: true,
    fallbackRate: 0.92,
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
    speakQuechua(buildStrategyNarration(alt, "qu", zone?.monthly_harmonized_indicators || []), { ...callbacks, clipKey: `guide_${zId}`, onSubtitle: () => onSubtitle?.(sub) });
    return true;
  }

  const spokenEs = `Para ${zone?.name || "Cochabamba"}. ${buildStrategyNarration(alt, "es", zone?.monthly_harmonized_indicators || [])}`;
  speakSpanish(spokenEs, { ...callbacks, clipKey: `guide_${zId}`, onSubtitle, onEnd });
  return true;
}
