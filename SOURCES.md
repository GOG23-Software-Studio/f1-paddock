# Fuentes comprobadas · 12 de noviembre de 2026

## Datos deportivos

- Jolpica: https://api.jolpi.ca/ergast/f1/ — calendario, clasificación de pilotos y equipos, carrera, clasificación y sprint. Se comprobó la temporada 2026 mediante peticiones reales. La documentación del proyecto está en https://github.com/jolpica/jolpica-f1.
- OpenF1: https://openf1.org/docs/ — se comprobó el catálogo histórico de sesiones y de pilotos. Sus URLs de fotos sirvieron en la exploración inicial. La versión final de este catálogo prefiere fotos actuales descubiertas en las páginas oficiales de los pilotos. OpenF1 no es dependencia de ejecución de esta beta. El directo requiere autenticación y una suscripción según https://openf1.org/auth.html.
- F1 timing: https://livetiming.formula1.com/static/2026/Index.json — respuesta HTTP 401. No implementado como proveedor en esta beta.
- Referencia para estudiar el directo público: https://nicxe.github.io/f1_sensor/. F1 Paddock no incluye ni depende del código de F1 Sensor.

Los informes `source-audit.json`, `asset-audit.json` y `official-drivers-audit.json` registran direcciones, fechas y resultados. Un HTTP 200 confirma la disponibilidad del recurso, no una garantía contractual del proveedor ni la exactitud permanente de sus datos.

## Tipografía, planos, fotos y dorsales

- La tarjeta actual https://github.com/marcokreeft87/formulaone-card identifica la fuente original F1 Bold y la estructura de URLs de mapas detallados. Se consultaron sus archivos `src/fonts.ts`, `src/lib/constants.ts` y `src/api/image-client.ts`; no se ha incorporado su código de tarjetas.
- La respuesta de la fuente se verificó con HTTP 200 pero sin cabecera CORS. La integración descarga una copia privada a su caché local de HA y la sirve desde el mismo origen. No incluye el archivo en el ZIP. Fuente: https://www.formula1.com/etc/designs/fom-website/fonts/F1Bold/Formula1-Bold.woff
- Directorio oficial: https://www.formula1.com/en/drivers. Se han seguido las páginas individuales enlazadas allí, sin adivinar nombres de recursos. Por ejemplo https://www.formula1.com/en/drivers/fernando-alonso contiene tanto la foto 2026 como su `numberwhite.webp`.
- Los 22 gráficos de dorsales se han inspeccionado en una hoja de contacto para comprobar la correspondencia con el número. Se conservan como imágenes originales, sin redibujarlos con una tipografía aproximada. El gráfico solo se utiliza si coinciden piloto, temporada y número.
- Los planos mantienen las zonas del gráfico original: no se añaden sectores, puntos de detección o posiciones de coches estimados. La correspondencia usa el identificador concreto del circuito, no el país; Barcelona/Madrid y Miami/Austin/Las Vegas son distintos.
- Cada recurso tiene su URL y fecha de verificación en `custom_components/f1_paddock/assets.json`. Fotos y números solo se asignan tras verificar identidad; se normalizan diferencias ortográficas controladas, como tildes y el nombre completo de Kimi Antonelli.

## Siguiente etapa

Validar la instalación real, verificar visualmente todos los mapas, integrar un proveedor de directo con tiempos, neumáticos y Race Control, y ampliar el archivo de temporada. No se debe activar un rótulo «en directo» solo porque una consulta haya tenido éxito.

## Beta 2: fuente de sesión comprobada

Se verificó el servicio público `https://livetiming.formula1.com/signalrcore`: negociación HTTP 200 y suscripción WebSocket JSON. Flujos: SessionInfo, SessionStatus, TimingData, TimingAppData, DriverList, LapCount, TrackStatus y Heartbeat. La consulta devolvió la sesión 11412 (carrera de São Paulo, 8 de noviembre de 2026), ya finalizada, con 22 pilotos. No se empleó autenticación ni se solicitaron flujos reservados.

OpenF1 `/v1/pit?session_key=11412` devolvió 58 registros de boxes. `stop_duration` y `lane_duration` se conservan como medidas distintas; la ausencia de una duración no se convierte en cero. En esta beta estos detalles se solicitan solo para sesiones finalizadas. Durante el directo, el contador proviene de `TimingData.NumberOfPitStops`.

El protocolo público se contrastó con la documentación y las constantes de F1 Sensor (https://nicxe.github.io/f1_sensor/entities/live-data y https://github.com/Nicxe/f1_sensor). El cliente y la normalización de F1 Paddock están implementados de forma independiente. La prueba real del transporte verificó el cierre limpio del socket. El comportamiento durante una carrera activa queda pendiente de la próxima sesión.
