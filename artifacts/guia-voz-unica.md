# Un único botón de voz

Las pantallas activas ofrecen voz únicamente en el plan seleccionado de Siembra. Se retiraron los controles del sidebar, clima, detalle diario, modal de riesgos, riego y ayuda de Mamá Tomasa, incluida la vista técnica.

Se usa un botón Escuchar / Detener / Cancelar preparación con la estética compartida de BotonGrande. El idioma se toma del selector general de la web. Se retiraron la tarjeta de reproductor, el selector de idioma duplicado y el texto desplegable.

La guía se construye con `buildStrategyNarration(strategy, language, indicators)`, usando el plan y los indicadores del calendario. Cambiar idioma, cambiar de plan o abandonar la tarjeta cancela preparación y reproducción. La carga se conecta al servicio real, sin porcentaje inventado.

La traducción y pronunciación quechuas siguen pendientes de validación local. No se ha evaluado su calidad lingüística ni escuchado una reproducción completa en esta entrega.

Verificación final: compilación del frontend, 40 pruebas frontend y 79 pruebas backend. En navegador se comprobó la pantalla de Clima sin controles de voz y el renderizado de sus tarjetas interpretativas en estado de datos por confirmar. El recorrido de Siembra se comprobó antes de reducir el reproductor al botón actual; queda pendiente la comprobación visual de este último ajuste en móvil.
