---
name: tarpuy-mobile-ux
description: Diseñar y revisar pantallas mobile-first, jerarquía visual, accesibilidad y flujos español/quechua en la PWA agrícola Tarpuy.
---

# Diseñar para decidir en campo

1. Identificar la decisión de la pantalla y seguir su implementación desde App.jsx hasta el componente, el servicio y el dato de origen. En Clima, priorizar qué sucede, dónde, cuándo y qué hacer. En Siembra, mostrar primero la opción sugerida y el motivo. Reservar comparativas y procedencia detallada para la vista avanzada.
2. Componer primero en una columna. Usar el sistema visual existente de Primitives, las tarjetas, Tailwind y Lucide. Reunir en tokens compartidos los estilos repetidos al tocar componentes relacionados. Diferenciar alerta, selección y acción principal mediante texto, forma y contraste además del color.
3. Probar ancho de 320 y 390 px con un nombre largo de comunidad, zoom de texto y controles táctiles cómodos. Verificar que el reproductor fijo no tape el último control y que mapa y gráficos tengan una alternativa textual legible.
4. Conservar pares de pictograma y texto, nombres de cultivos locales y control explícito de reproducir/detener. Consultar quechuaI18n, speechService y manifiestos de audio antes de introducir texto. Señalar traducciones pendientes de validación local.
5. Revisar primera visita sin señal, zona guardada y regreso de la red. Mostrar zona y fecha del dato almacenado, distinguir pronóstico, climatología y recomendación. Describir el alcance zonal al elegir un punto GPS.
6. Recorrer la tarea en ambos idiomas con teclado y tacto. Comprobar foco al cerrar diálogos, visibilidad de errores y disponibilidad real de audio. Informar tamaños, estados y recorridos efectivamente probados.
