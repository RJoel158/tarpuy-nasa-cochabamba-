/**
 * TARPUY NASA COCHABAMBA — GUÍA DE VOZ Y TONO DE LA INTERFAZ (FASE 1C)
 * =====================================================================
 * La app habla como una vecina mayor de confianza en la chacra:
 * frases cortas, cálidas, directas y prácticas. Nunca lenguaje de sistema.
 *
 * NOTA IMPORTANTE SOBRE QUECHUA (COCHABAMBA / QULLASUYU):
 * Todos los textos y nombres en quechua deben sonar naturales como se habla
 * cotidianamente en las provincias de Cochabamba (Tapacarí, Punata, Chapare),
 * no como traducciones literales de diccionario.
 * Están marcados con `requiereValidacionHablanteNativo: true` para revisión
 * por un hablante nativo antes de producción.
 */

export const PROPUESTAS_NOMBRE_PERSONAJE = [
  {
    id: "mama_tomasa",
    nombre: "Mama Tomasa",
    origen: "Castellano andino tradicional de los valles de Cochabamba",
    explicacion:
      "En las comunidades de Cochabamba, «Mama» es el trato de respeto y cariño hacia una mujer mayor sabia de la comunidad. Suena cercano, familiar y respetuoso.",
    requiereValidacionHablanteNativo: false,
    requiereValidacionComunidad: true,
  },
  {
    id: "dona_justina",
    nombre: "Doña Justina",
    origen: "Castellano cotidiano de ferias y valles cochabambinos",
    explicacion:
      "Nombre muy común y querido entre productoras mayores de Punata, Cliza y los valles. Transmite confianza inmediata de vecina de parcela.",
    requiereValidacionHablanteNativo: false,
    requiereValidacionComunidad: true,
  },
  {
    id: "mama_sumaq",
    nombre: "Mama Sumaq",
    origen: "Quechua cochabambino («Sumaq» = buena, amable, de buen corazón)",
    explicacion:
      "Une el trato afectuoso «Mama» con «Sumaq» en quechua. Debe validarse con hablantes nativos de Tapacarí y Punata para confirmar que se sienta como nombre propio natural.",
    requiereValidacionHablanteNativo: true,
    requiereValidacionComunidad: true,
  },
];

export const REGLAS_VOZ_Y_TONO = [
  {
    regla: "1. Habla como una vecina en la chacra, nunca como una máquina",
    mal: "Parámetro de precipitación insuficiente. Déficit hídrico detectado.",
    bienEs: "Buen día. Hoy no va a llover; cuida la humedad de tu tierra.",
    bienQu: "Allin p'unchay. Kunanqa mana parankuchu; jallp'aykita qhawariy.",
    requiereValidacionHablanteNativo: true,
  },
  {
    regla: "2. Primero qué hacer hoy, en una sola frase corta",
    mal: "Alerta meteorológica: descenso térmico inferior a 0 °C en madrugada.",
    bienEs: "Esta noche va a helar fuerte. Tapa tus plantas antes de que oscurezca.",
    bienQu: "Ch'isiqa sinchita qasanqa. Sach'aykikunata qhataykuy.",
    requiereValidacionHablanteNativo: true,
  },
  {
    regla: "3. Cuando todo está bien, da tranquilidad sin rodeos",
    mal: "Estado del sistema: nominal. Sin alertas activas para el polígono.",
    bienEs: "Buen día. Hoy no hace falta regar; la tierra sigue húmeda.",
    bienQu: "Allin p'unchay. Kunanqa mana qarpana tiyanchu; jallp'aqa juq'ullaraq.",
    requiereValidacionHablanteNativo: true,
  },
  {
    regla: "4. Si falta internet o un dato, explica con calma y sin culpar",
    mal: "Error 503: fallo de sincronización con API NASA POWER.",
    bienEs: "Ahora no hay señal, pero te muestro los datos guardados de tu zona.",
    bienQu: "Mana señal kanchu, chaywanpis waqaychasqa willaykunata rikuchisqayki.",
    requiereValidacionHablanteNativo: true,
  },
  {
    regla: "5. Botones de 1 a 3 palabras con verbo claro",
    mal: "Ejecutar simulación fenológica / Exportar reporte técnico",
    bienEs: "Ver mi siembra / Guardar cartilla",
    bienQu: "Tarpuyniyta qhaway / Raphita waqaychay",
    requiereValidacionHablanteNativo: true,
  },
];
