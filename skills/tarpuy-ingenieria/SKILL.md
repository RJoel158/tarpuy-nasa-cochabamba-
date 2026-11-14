---
name: tarpuy-ingenieria
description: Implementar funcionalidades, diseñar contratos y verificar la resiliencia de ETL, motor, FastAPI y PWA en Tarpuy.
---

# Ingeniería y desarrollo

1. Escribir un escenario con zona, cultivo, prioridad, conectividad y resultado observable. Seguir la petición desde frontend/src/services/apiClient.js hasta backend/main.py y engine/recommender.py. Comparar los campos con contracts/api_contract.json antes de cambiar el contrato.

2. Probar la ruta normal y el fallo relevante. Para cambios de sincronización, alternar entre dos zonas mientras se descarga el paquete, simular interrupción y verificar qué zona y fecha persisten al recargar. Comprobar también la lectura de un paquete anterior.

3. Entregar el cambio mínimo y una matriz escenario, resultado esperado y resultado observado. Ejecutar las pruebas existentes que cubran el cambio y la compilación del frontend si corresponde. Registrar qué quedó pendiente.
