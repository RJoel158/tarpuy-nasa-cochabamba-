---
name: tarpuy-motion
description: Implementar o auditar animaciones CSS, microinteracciones, estados de sincronización y reproducción de audio en Tarpuy con movimiento reducido.
---

# Comunicar cambios de estado

1. Rastrear el evento real en App.jsx y el componente que lo representa. Para sincronización usar inicio, validación, persistencia y fallo. Para voz usar reproducción, pausa, fin y error. Si el proveedor no entrega progreso cuantificable, mostrar una espera indeterminada.
2. Mantener visible la misma etiqueta de estado con o sin animación. Separar el gesto de la confirmación de guardado. Si el usuario cambia de zona durante una petición, impedir que una respuesta anterior confirme la nueva zona.
3. Reutilizar index.css y las clases del componente. Para cambios breves preferir opacity y transform. Reservar bucles para actividad vigente y detenerlos al terminar. Evitar desplazar el contenido que el agricultor está leyendo o reiniciar el foco.
4. Incorporar prefers-reduced-motion para cada nuevo efecto, incluidas transiciones de Tailwind. Mantener una señal estática comprensible para voz activa, carga y alertas. Anunciar a lectores de pantalla el cambio significativo una vez.
5. Probar clics rápidos, cambio de zona, reproducción interrumpida, fallo de red y movimiento reducido. Registrar si hubo parpadeos, estados duplicados o confirmaciones antes de completar la operación. Evitar agregar un paquete de animación cuando CSS y eventos existentes resuelvan el caso.
