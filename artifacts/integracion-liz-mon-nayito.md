# Integración Liz → branch_Mon → nayito

Rama de trabajo: `codex/integracion-liz-mon-nayito`.
Base: `main` (`89ae12c`). Integración mediante tres merges, sin eliminar los archivos conservados en main.

- Liz `86c7313`: sidebar, cabecera, componentes, dibujos y tipografía actuales. Se mantienen los carruseles de pronóstico diario y detalle técnico.
- branch_Mon `55baebd`: mapa distrital GAMC, selector de distritos con estilo Liz, contexto periurbano, drenaje, acciones de agua y avisos municipales.
- nayito `f685c75`: distribución del panel de riego y fecha del boletín, conservando los datos de 14 días y avisos municipales de Mon. Colores base vinculados a los tokens de Liz.

## Verificación

| Escenario | Esperado | Observado |
| --- | --- | --- |
| Backend: zonas, cultivos, recomendaciones, alertas y distritos | Contratos y motor compatibles | 55 pruebas aprobadas |
| Frontend: agua, contexto D9/D13, narración, GPS y audio | Funciones compatibles entre ramas | 29 pruebas aprobadas |
| Frontend de producción | Imports y JSX resolubles | `npm --prefix frontend run build` aprobado |
| Historial de integración | Las tres ramas incluidas como ancestros | Verificado con `git merge-base --is-ancestor` |
| Carruseles de semana y detalles | Conservados en pantalla Clima de Liz | Ambos montados en `EarlyWarningBanner`, con CSS de scroll y controles |
| GPS con lectura imprecisa o atrasada | Mantener búsqueda precisa y descartar respuestas obsoletas | Servicio existente `locateDevice` conectado; cobertura de pruebas del servicio aprobada |

Pendiente de comprobación manual: aspecto final en 320/390 px, navegación visual completa y GPS en un dispositivo real. No se ejecutó validación visual de navegador en esta integración. La compilación advierte que el bundle JS supera 500 kB; no bloquea la compilación.

No se hizo push de esta rama.
