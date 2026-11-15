# Traducción y voz para productores de Cochabamba

## Hallazgos (14 de noviembre de 2026)

- Un hablante consultado por el equipo no comprendió bien los audios. No hay validación de comprensión ni de pronunciación local de los guiones existentes.
- `etl/quechua_tts_client.py` usa MMS `quh`, específico de quechua sudboliviano. Es la misma voz de las muestras nuevas: frasear mejor puede ayudar, pero no demuestra que sea una voz más natural.
- `buildWeatherNarration` no expresa el mismo contenido en ambos idiomas. En español interpreta lluvia, frío, humedad y demanda de agua; en quechua recita días y cifras y termina con una instrucción genérica. Las fechas ISO y cifras sin adaptación oral agravan la lectura.
- Hay mezcla de variantes y términos entre guiones, UI y datos. No uniformar automáticamente `allpa/jallp'a`, ni eliminar apóstrofos o aspiraciones para intentar mejorar TTS.
- El limpiador quechua recortaba a 480 caracteres: podía perder una advertencia final. Ahora conserva el texto y el sintetizador rechaza bloques demasiado largos para que se dividan por frases completas.

## Referencias verificadas

1. [ILC Quechua, IPELC](https://quechua.ipelc.gob.bo/?lang=es): institución de referencia, sede Cliza, Cochabamba; trabaja normalización y variedades locales. Existe escritura normalizada: la variación del habla no significa ausencia de gramática o normas.
2. [Diccionario de la Nación Quechua, ILCQ/CENAQ, 2018](https://www.illaa.org/pirwa/diccionarios/Quechua_ILCNQ_2018_QHICHWA_SIMIPIRWA.pdf): referencia boliviana con identificación de variantes. No es una traducción oficial de los guiones de Tarpuy; el catálogo fue localizado y su contenido indexado consultado, pero el PDF completo no pudo abrirse durante la revisión.
3. [Catálogo ILLA](https://www.illaa.org/index.php/diccionarios/): incluye el diccionario de 2018 y el diccionario de quechua cochabambino de Herrero/Sánchez de Lozada. Útil para contrastar usos; no prueba que una frase generada sea natural.
4. [Google Cloud Translation](https://docs.cloud.google.com/translate/docs/languages): incluye `qu`, quechua. La tabla no ofrece una selección explícita de Cochabamba/quh. Puede producir borradores; no tratar sus resultados como traducciones oficiales bolivianas.
5. [Meta MMS-TTS-quh](https://huggingface.co/facebook/mms-tts-quh): voz específica sudboliviana; el modelo no garantiza comprensión local. La ficha declara licencia CC-BY-NC-4.0; considerar esta condición al elegir una solución comercial.

El catálogo curado de skills de OpenAI consultado no incluye una especialización de quechua boliviano. Se localizaron skills generales de traducción en GitHub; ninguna revisada acredita validación cochabambina. No se instaló una skill genérica como sustituto de conocimiento lingüístico.

## Trabajo realizado

- `data/localization/quh_bo_review.json`: dos fragmentos bilingües de prueba, texto escrito, texto hablado, retrotraducción, intención y preguntas de revisión.
- `python -m etl.build_quechua_review`: genera muestras aisladas y una página de escucha en `artifacts/quechua-review/index.html`; conserva los audios de producción. Reanuda sin regenerar textos sin cambios.
- Las pausas se insertan entre frases sin cambiar velocidad de muestreo, tono ni consonantes. No se aplican sustituciones fonéticas improvisadas.
- Los guiones son borradores del asistente, no textos oficiales ni aprobados por el IPELC. Las retrotraducciones son una ayuda de revisión del autor, no una evaluación independiente.

## Revisión de los dos audios principales

1. Capturar el texto español que corresponde al estado visible y conservarlo como referencia.
2. Expresar las mismas condiciones, negaciones, incertidumbre, acciones, cantidades y fechas en quechua oral sencillo. Una condición como «si está seca» no puede convertirse en una orden de regar.
3. Separar frase para pantalla de preparación oral de fechas, cifras y préstamos. Un diccionario valida términos, no frases enteras.
4. Comparar texto escrito con lectura en voz alta de un hablante de la zona: si el texto se entiende y el TTS no, el problema es la voz; si ninguno se entiende, corregir la traducción primero.
5. Sin mostrar el español, preguntar a dos o más hablantes: «¿qué entendiste?», «¿qué harías?» y «¿qué no debes hacer?». Registrar localidad, palabras confusas y correcciones; evaluar por separado traducción y voz. Esto es una propuesta de prueba, no una validación ya realizada.
6. Usar una grabación de hablante local, con su autorización, como referencia o locución de mensajes estables. No clonar voces sin autorización. Para fechas y consejos variables, evaluar TTS con ese mismo guion antes de publicar.

## Pendiente

Validar las muestras con hablantes, corregir los dos guiones completos con equivalencia semántica y elegir voz con una comparación audible. Después conectar frases aprobadas al contenido dinámico y regenerar el paquete offline con hashes nuevos. No se ha sustituido aún la traducción global ni la voz de producción, y no se afirma haber resuelto su naturalidad.
