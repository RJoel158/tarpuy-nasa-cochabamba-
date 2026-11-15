import { decideFarmerWaterAction } from "./farmerWaterAction.js";
export function weatherAlertPolicy(bulletin, now = Date.now()) {
  const timestamp = Date.parse(bulletin?.fetched_at_utc || "");
  const age = now - timestamp;
  const point = bulletin?.weather_scope === "selected_point_model";
  const usable = point && !bulletin?.weather_refresh_error && Number.isFinite(age) && age >= -300000 && age <= 7200000;
  if (!usable) return {
    usable: false,
    alerts: [{ id: "data_review", severity: "warning", title_es: "Falta confirmar el clima de tu parcela", title_qu: "Chakraykipa pachanta qhaway", category: "Calidad de datos", message_es: "Los datos disponibles son zonales, antiguos o no pudieron actualizarse. No confirman un peligro actual en tu parcela.", action_es: "Confirma tu punto en el mapa y revisa la hora del pronóstico. Si está lloviendo, comprueba el escurrimiento antes de regar." }],
  };
  const guidance = decideFarmerWaterAction(bulletin, null, now);
  const presentation = guidance.presentation;
  return { usable: true, alerts: (bulletin.active_alerts || []).map(alert => alert.id === "water_deficit" ? {
    ...alert, id: "water_guidance", presentation_kind: guidance.reason === "current_rain" || guidance.reason === "rain_forecast" ? "rain_good" : "soil_moisture", severity: "warning", title_es: presentation.title,
    message_es: presentation.message,
    action_es: presentation.instruction,
  } : alert).sort((a,b) => ({critical:0,warning:1,info:2}[a.severity] ?? 3) - ({critical:0,warning:1,info:2}[b.severity] ?? 3)) };
}
