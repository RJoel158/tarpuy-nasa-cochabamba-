/**
 * TARPUY NASA COCHABAMBA — ARCHIVO EDITABLE DE "SABER DEL DÍA" (FASE 1C)
 * ======================================================================
 * Contiene consejos prácticos y verificables para el productor.
 * Los saberes tradicionales y su versión en quechua llevan la marca explícita
 * `pendienteValidacionComunidad: true` y `requiereValidacionHablanteNativo: true`
 * para que sean revisados y aprobados junto a agricultores mayores de
 * Tapacarí, Punata y Chapare antes de mostrarse como definitivos.
 *
 * TODO-FUNCIONALIDAD: origen y rotación de las frases (el equipo debe conectar
 * la selección diaria según fecha, zona agroecológica activa y cultivo elegido).
 */

export const SABERES_DEL_DIA_EJEMPLO = [
  {
    id: "saber_riego_temprano",
    zonaSugerida: "punata",
    cultivoSugerido: "maiz",
    dibujoId: "gota_agua",
    tituloEs: "Regar temprano aprovecha mejor el agua",
    textoEs:
      "Si riegas al amanecer, el agua entra profundo a las raíces antes de que el sol del mediodía la seque.",
    textoQu:
      "Paqarin qarpanki chayqa, yakuqa saphikama yaykun manaraq inti ch'akichichkaptin.",
    tipo: "practico_verificable",
    pendienteValidacionComunidad: false,
    requiereValidacionHablanteNativo: true,
  },
  {
    id: "saber_cobertura_rastrojo",
    zonaSugerida: "punata",
    cultivoSugerido: "haba",
    dibujoId: "tierra_humeda",
    tituloEs: "Cubre el suelo con paja o chala seca",
    textoEs:
      "Una capa de paja sobre el surco guarda la humedad varios días más y protege la tierra del viento.",
    textoQu:
      "Ch'aki ichhuwan jallp'ata qhataykuy, jinamanta juq'u unayta qhipakun.",
    tipo: "practico_verificable",
    pendienteValidacionComunidad: true,
    requiereValidacionHablanteNativo: true,
  },
  {
    id: "saber_cielo_despejado_helada",
    zonaSugerida: "tapacari",
    cultivoSugerido: "papa",
    dibujoId: "helada",
    tituloEs: "Noche sin nubes en invierno trae helada",
    textoEs:
      "En la altura, cuando el cielo queda totalmente despejado y sin viento al atardecer, la tierra se enfría rápido en la madrugada.",
    textoQu:
      "Chiri killapi mana phuyu kaptinqa, paqarinman sinchita qasamun.",
    tipo: "saber_local_y_fisico",
    pendienteValidacionComunidad: true,
    requiereValidacionHablanteNativo: true,
  },
  {
    id: "saber_rotacion_haba_papa",
    zonaSugerida: "tapacari",
    cultivoSugerido: "haba",
    dibujoId: "haba",
    tituloEs: "Sembrar haba alimenta la tierra cansada",
    textoEs:
      "Las raíces del haba dejan abono natural en el suelo para que la siguiente siembra de papa o maíz crezca con más fuerza.",
    textoQu:
      "Jawasta tarpuyqa jallp'ata kallpachan qhipa tarpuypaq.",
    tipo: "practico_verificable",
    pendienteValidacionComunidad: true,
    requiereValidacionHablanteNativo: true,
  },
  {
    id: "saber_drenaje_lluvia_fuerte",
    zonaSugerida: "chapare",
    cultivoSugerido: "planta_crecida",
    dibujoId: "lluvia",
    tituloEs: "Limpia los canales antes de las lluvias fuertes",
    textoEs:
      "Cuando el agua no se estanca al pie del tallo, las raíces respiran bien y evitamos que la planta se pudra.",
    textoQu:
      "Manaraq sinchi para chayamuchkaptin, yaku purina yarqhakunata pichay.",
    tipo: "practico_verificable",
    pendienteValidacionComunidad: false,
    requiereValidacionHablanteNativo: true,
  },
];
