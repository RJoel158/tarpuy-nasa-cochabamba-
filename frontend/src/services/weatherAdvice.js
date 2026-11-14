// Screening rules for regional forecasts, not a calibrated irrigation prescription.
const number = value => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
const nonnegative = value => { const n=number(value); return n !== null && n >= 0 ? n : null; };
const fmt = n => n.toLocaleString("es-BO", { maximumFractionDigits: 1 });

export function buildDayInterpretation(day = {}, dv = {}, lang = "es", now = new Date()) {
  const min=number(day.temp_min_c), max=number(day.temp_max_c), rain=nonnegative(day.precip_mm), wind=nonnegative(day.wind_kmh), et0=nonnegative(day.et0_mm);
  const probability=number(day.precip_prob_pct);
  const actions=[];
  const add=(id,reason,action,severity="info")=>actions.push({id,reason,action,severity});
  const today=now.toLocaleDateString("en-CA",{timeZone:"America/La_Paz"});
  const expired=/^\d{4}-\d{2}-\d{2}$/.test(day.date||"") && day.date<today;
  if (expired) add("expired",`El pronóstico corresponde al ${day.date}, un día pasado.`,"Actualiza el pronóstico antes de tomar decisiones para hoy.","warning");
  else {
    if(min!==null && min<=2) add("cold",`La mínima prevista es ${fmt(min)} °C. Puede haber frío intenso o helada local.`,"Revisa primero la protección de plantas sensibles y posterga la siembra de plántulas sensibles si no puedes protegerlas.","warning");
    if(rain!==null && rain>=20) add("rain_accumulation",`Se prevén ${fmt(rain)} mm acumulados en el día; el dato no informa la intensidad por hora.`,"Revisa salidas de agua y zonas donde se acumula. Si hay encharcamiento, evita añadir riego y espera a que drene antes de trabajar el suelo.","warning");
    else if(rain!==null && rain>=3) add("rain",`Se prevén ${fmt(rain)} mm de lluvia${probability!==null&&probability>=0&&probability<=100?` y ${fmt(probability)} % de probabilidad`:""}.`,"Antes de añadir riego, comprueba si la lluvia prevista realmente ocurrió y humedeció la zona de raíces. Si el suelo quedó húmedo, reevalúa el turno de riego.");
    if(wind!==null && wind>=18) add("wind",`El viento previsto alcanza ${fmt(wind)} km/h.`,"Revisa soportes de plantas y sujeta las coberturas que puedan levantarse con el viento.","warning");
    if(rain!==null && et0!==null && rain<et0) add("reference_deficit",`Lluvia: ${fmt(rain)} mm. ET₀: ${fmt(et0)} mm. La diferencia de referencia es ${fmt(rain-et0)} mm.`,"Conserva la cobertura del suelo y revisa la humedad a la profundidad de las raíces. Si está seca, revisa el riego disponible con la etapa del cultivo; esa diferencia no es una dosis de riego.");
    else if(rain!==null && rain<3 && et0===null) add("little_rain",`Se prevén solo ${fmt(rain)} mm de lluvia y falta la demanda de referencia.`,"No cuentes con esa lluvia para reponer toda el agua del cultivo. Revisa la humedad antes de programar el riego.");
    if(max!==null && max>=30) add("heat",`La máxima prevista es ${fmt(max)} °C; la sensibilidad depende del cultivo y su etapa.`,"Revisa plantas jóvenes y señales de marchitez, y conserva la cobertura de la tierra.","warning");
    if(!actions.length) add("check",rain===null ? "Falta la estimación de lluvia." : "No se activaron los umbrales orientativos de frío, viento o lluvia acumulada.",rain===null ? "Consulta un pronóstico actualizado antes de decidir el riego. Comprueba mientras tanto la humedad del suelo." : "Revisa el estado del cultivo y aprovecha para comprobar coberturas y drenajes; no se deduce un turno de riego con estos datos solos.");
  }
  const dayText=max===null?"Falta la temperatura máxima.":`Máxima prevista: ${fmt(max)} °C.`;
  const nightText=min===null?"Falta la temperatura mínima.":`Mínima prevista: ${fmt(min)} °C.`;
  const rainText=rain===null?"Falta la estimación de lluvia.":`Lluvia del día: ${fmt(rain)} mm.${et0!==null?` Demanda de referencia ET₀: ${fmt(et0)} mm.`:""}`;
  const adviceText=actions.map(a=>`${a.action} Motivo: ${a.reason}`).join(" ");
  const limitation="Orientación regional. Para calcular el riego faltan humedad en raíces, tipo de suelo, cultivo y etapa. Umbrales de revisión sin calibración local.";
  if(lang==="qu") return {dayText:max===null?"Mana yachay kanchu.":`P'unchawpi ${fmt(max)} grados kanman.`,nightText:min===null?"Mana chiri yachay kanchu.":`Tuta ${fmt(min)} grados kanman.`,rainText:rain===null?"Mana para yachay kanchu.":`Para ${fmt(rain)} milímetros kanman.`,adviceText:"Allpata yakuta qhaway. Yachaqwan tapurikuy.",actions,expired,translationPending:true,limitation,spokenSummary:`${max===null?"":`P'unchawpi ${fmt(max)} grados.`} ${min===null?"":`Tuta ${fmt(min)} grados.`} ${rain===null?"":`Para ${fmt(rain)} milímetros.`} Allpata yakuta qhaway. Yachaqwan tapurikuy.`};
  return {dayText,nightText,rainText,adviceText,actions,expired,limitation,spokenSummary:`Pronóstico para ${day.date||"el día seleccionado"}. ${dayText} ${nightText} ${rainText} ${adviceText} ${limitation}`};
}
