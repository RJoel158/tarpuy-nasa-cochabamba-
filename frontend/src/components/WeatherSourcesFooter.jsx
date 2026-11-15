import React from "react";
const date = value => {
  if (!value) return "no disponible";
  const normalized = /Z$|[+-]\d{2}:\d{2}$/.test(value) ? value : value + "-04:00";
  const time = new Date(normalized);
  return Number.isFinite(time.getTime()) ? time.toLocaleString("es-BO", {timeZone:"America/La_Paz"}) : "no disponible";
};
export default function WeatherSourcesFooter({ bulletin }) {
  const point = bulletin?.weather_scope === "selected_point_model";
  return <section className="py-4 text-sm text-[var(--tinta-suave)] border-t border-[var(--color-border-subtle)]" aria-label="Fuentes y actualización del clima">
    <p className="font-bold">Fuentes y actualización</p>
    {bulletin?.primary_provider_status === "unavailable_using_open_meteo" && <p>Se está utilizando un pronóstico de respaldo.</p>}
    <p>{point ? "Pronóstico del modelo para el punto elegido." : "Pronóstico de referencia zonal; no es el punto exacto de tu parcela."} No es una medición en campo.</p>
    <p>Descarga del proveedor: {date(bulletin?.fetched_at_utc)} · Hora de las condiciones del modelo: {date(bulletin?.current_conditions?.observed_at)}.</p>
    <p>Se comprueban actualizaciones cada minuto con conexión y la página visible; el servidor consulta al proveedor como máximo cada cinco minutos por ubicación.</p>
    {bulletin?.weather_refresh_error && <p>No se pudo actualizar el proveedor. Se mantiene el último dato disponible con su fecha original.</p>}
    <details className="mt-2"><summary className="cursor-pointer">Procedencia de los datos</summary><p>{bulletin?.weather_provider === "WeatherAPI" ? `WeatherAPI: condiciones actuales y ${bulletin.provider_forecast_days} días. Open-Meteo: referencia para análisis agronómico, ET0 y humedad superficial estimada; no amplía el pronóstico WeatherAPI visible.` : "Open-Meteo: pronóstico y referencia agronómica."} NASA POWER: contexto histórico zonal. GAMC: distrito, periurbanos y drenaje; estas capas no miden lluvia actual.</p><p>Coordenadas de referencia: {bulletin?.weather_location?.lat ?? "—"}, {bulletin?.weather_location?.lon ?? "—"}.</p></details>
  </section>;
}
