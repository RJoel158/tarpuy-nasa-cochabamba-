// Daily forecast interpretation, not an observation or a crop-specific diagnosis.
const number = value => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
export function weatherTodayCards(day = {}, usable = true) {
  const unknown = (id, label, icon) => ({ id, etiqueta: label, dibujoId: icon, palabra: "Por confirmar", explicacion: "Revisa una actualización del pronóstico antes de decidir.", tone: "unknown", apoyoNumerico: null });
  const temp = unknown("temperatura", "Temperatura", "termometro_calor");
  const rain = unknown("lluvia", "Lluvia", "lluvia");
  const wind = unknown("viento", "Viento", "viento");
  if (!usable) return [temp, rain, wind];
  const min = number(day.temp_min_c), max = number(day.temp_max_c);
  const mm = number(day.precip_mm), speed = number(day.wind_kmh);
  if (min !== null && max !== null && min <= max) {
    temp.apoyoNumerico = `Mín ${min}°C / Máx ${max}°C`;
    Object.assign(temp, min <= 2 ? {
      palabra: "Posible helada", explicacion: "El frío puede dañar los brotes. Revisa la protección de los cultivos sensibles.", dibujoId: "termometro_frio", tone: "warning",
    } : min <= 6 ? {
      palabra: "Madrugada fría", explicacion: "Los brotes sensibles pueden resentir el frío. Revisa los sectores bajos de tu parcela.", dibujoId: "termometro_frio", tone: "warning",
    } : max >= 30 ? {
      palabra: "Tarde calurosa", explicacion: "La tierra puede perder humedad. Conserva su cobertura y revisa las raíces antes de regar.", tone: "warning",
    } : { palabra: "Sin frío ni calor extremos", explicacion: "No se prevén temperaturas extremas; las zonas bajas pueden estar más frías.", tone: "calm" });
  }
  if (mm !== null && mm >= 0) {
    rain.apoyoNumerico = `${mm} mm previstos`;
    Object.assign(rain, mm >= 20 ? {
      palabra: "Lluvia abundante prevista", explicacion: "Puede acumularse agua en sectores bajos. Revisa que las salidas de agua estén despejadas.", tone: "warning",
    } : mm >= 5 ? {
      palabra: "Se espera lluvia", explicacion: "Puede aportar agua a la tierra. Espera a revisar lo que llueva antes de decidir el riego.", tone: "rain",
    } : mm > 0 ? {
      palabra: "Lluvia escasa prevista", explicacion: "Podría no alcanzar para las raíces. Comprueba la humedad antes de decidir el riego.", tone: "rain",
    } : { palabra: "Sin lluvia prevista", explicacion: "El pronóstico no anticipa lluvia, pero puede cambiar. Revisa la tierra antes de regar.", dibujoId: "nube_con_sol", tone: "calm" });
  }
  if (speed !== null && speed >= 0) {
    wind.apoyoNumerico = `${speed} km/h`;
    Object.assign(wind, speed >= 40 ? {
      palabra: "Viento fuerte previsto", explicacion: "Puede afectar plantas altas y coberturas. Revisa sus sujeciones antes de que aumente el viento.", tone: "warning",
    } : speed >= 18 ? {
      palabra: "Viento moderado previsto", explicacion: "Puede acelerar la pérdida de humedad. Mantén la tierra cubierta.", tone: "warning",
    } : { palabra: "Viento suave previsto", explicacion: "No se anticipan vientos fuertes. Mantente atento a cambios durante el día.", tone: "calm" });
  }
  return [temp, rain, wind];
}
