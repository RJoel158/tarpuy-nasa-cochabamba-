export function isSpeechSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function stopSpeaking() {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      console.warn("Error stopping speech synthesis:", err);
    }
  }
}

export function speakText(text, options = {}) {
  if (!isSpeechSupported() || !text) return false;

  stopSpeaking();

  const { lang = "es-BO", rate = 0.88, pitch = 1.0, onStart, onEnd, onError } = options;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;

  if (typeof window !== "undefined" && window.speechSynthesis.getVoices) {
    const voices = window.speechSynthesis.getVoices();
    const targetPrefix = lang.split("-")[0];
    const match =
      voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ||
      voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix)) ||
      voices.find((v) => v.lang.toLowerCase().startsWith("es"));
    if (match) utterance.voice = match;
  }

  if (onStart) utterance.onstart = onStart;
  if (onEnd) utterance.onend = onEnd;
  utterance.onerror = (e) => {
    console.warn("Speech error:", e);
    if (onError) onError(e);
    if (onEnd) onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.error("SpeechSynthesis execution error:", err);
    return false;
  }
}

export function speakQuechua(text, callbacks = {}) {
  return speakText(text, {
    lang: "es-BO",
    rate: 0.85,
    pitch: 0.95,
    ...callbacks,
  });
}

export function speakSpanish(text, callbacks = {}) {
  return speakText(text, {
    lang: "es-419",
    rate: 0.88,
    pitch: 1.0,
    ...callbacks,
  });
}
