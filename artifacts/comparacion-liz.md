# Comparación de UI

Origen Liz: `5b5e98b` (`origin/Liz`, 14 de noviembre de 2026).

Nuestro mapa permanece como única pantalla de ubicación. No se incorporó el mapa de Liz.

Los 20 archivos necesarios de la propuesta original se conservan sin cambios en `frontend/src/variants/liz`. `SOURCE.json` registra sus rutas y commit. Los estilos de comparación se generaron aparte, con alcance limitado a `.liz-preview`.

| Pantalla | Nuestro recorrido | Liz |
|---|---|---|
| Clima | Semáforo compacto, métricas breves y pronóstico horizontal | Mensaje del día ilustrado, personaje guía, clima y detalles desplegables |
| Qué sembrar | Cultivo anterior → agua → plan; calendario plegado | Cuatro preguntas con dibujos, tres alternativas y calendario detallado |
| Ubicación | Mapa a pantalla completa, GPS y distritos | No se utiliza su mapa |

En cada pantalla se puede alternar entre versiones y guardar una elección con «Usar esta versión». Las preferencias se guardan en este navegador; no crean commits ni publican cambios. Ambas reciben el mismo estado de zona, clima, cultivos y controles actuales de audio.

Antes de incorporar bloques originales de Liz al producto final, revisar las afirmaciones sobre ganancia/rendimiento, los meses interpretados como riego o cosecha y la correspondencia de narración con el calendario. La copia original se mantiene intacta para facilitar esa revisión.
