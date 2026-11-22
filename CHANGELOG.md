# Changelog / Cambios

## 0.1.10 · 2026-11-22

- Simplify every card: collapse repeated source warnings, explanatory notes, timing-color legends and detailed timestamps behind the information icon. Keep the session state, sporting readings and unavailable-data messages visible.
- Preserve expanded information panels during refreshes, alongside table scroll and focus.
- Show the position road only for a fresh live Race or Sprint with published positions. Hide it during practice, qualifying, waiting, finished sessions or stale readings, and restore it automatically when eligible live data arrives. Keep the existing road-card configuration.
- Preserve dashboard cards, entity identities, favorite and upcoming-GP highlighting. No simulation included.

## 0.1.9 · 2026-11-22

- Clean the header: remove the redundant update badge and collapse source/status details behind the same information SVG used by MotoGP Paddock. Retain an unobtrusive status dot, accessible label and keyboard operation.
- Show “Abandono” / “Retired” on the favorite-driver card when the published result says Retired, or a finished race timing feed explicitly confirms retirement while the result is unavailable. Do not infer retirement from missing results, a sprint or a lap deficit.
- Keep the event and date with the retirement reading and remove the redundant provider-warning footer from the driver card. Preserve existing cards, entities, favorite and the upcoming-GP highlight.

## 0.1.8 · 2026-11-22

- Make the upcoming Grand Prix clearly visible in the calendar with a tinted row, accent border and contrasting checkered-flag badge.
- Localize the badge as “PRÓXIMO GP” / “NEXT GP” and mark the current event accessibly. Calendar data, dashboard cards and favorite selection remain unchanged.

## 0.1.7 · 2026-11-22

- Recover the calendar from FastF1's published schedule when Jolpica is unreachable; validate season, rounds and timezones, identify the backup and retain verified driver identities without inventing standings or results.
- Identify Jolpica requests correctly, distinguish network/HTTP failures and register the frontend before the first provider fetch.
- Add an independent position road and include it in the dashboard: official reference images for all 11 teams of 2026, two staggered rows on one road, leader on the right, published gaps and selectable driver details outside the asphalt.
- Move cars using actual published order and intervals only during fresh active sessions. Preserve driver nodes, focus and scroll; keep finished or stale sessions still. No GPS or proportional spacing is claimed.
- Preserve favorite highlighting and driver-specific number/tyre details separately from team reference photographs. Unknown teams, other years or failed images use neutral placeholders.
- Remove all in-app simulation modes, generators and controls. Legacy test-card configurations fall back to actual session timing. Existing dashboards and favorite selections are preserved.

## 0.1.6

- Normalize the ZIP creator-system header as well as ordering and compression. Verify release uploads against a draft before publication. Previous release assets remain untouched.

## 0.1.5

- Make release archives byte-identical across Windows and Linux using explicit path ordering and ZIP stored entries. Avoid zlib implementation differences when validating existing immutable assets.
- Retain 0.1.4 assets and download counters unchanged; this is a separate corrective release.

## 0.1.4

- Marketplace installations and updates now use the stable `f1_paddock.zip` release asset; GitHub records download requests, not unique users.
- Keep the separate versioned manual installer; validate both archive layouts and checksums.
- Separate English (Max Verstappen, British GP) and Spanish (Fernando Alonso, Spanish GP) README screenshots, captured from a private historical preview.
- No integration settings, favorites or household dashboards are changed.

## 0.1.3 · 2026-11-20

- One configuration now serves current and historical seasons from 2023 through a shared Season selector. Current season follows the calendar year. Prevent additional entries; migrate existing entries without changing IDs, favorites or cards.
- Changing season clears the previous GP choice and prevents old-year readings or current live timing from appearing as historical results.

- Automatically select the Dashboard sensor when exactly one is available, including new-card previews and sensors that appear after the editor loads. Keep explicit choices and require a choice when several dashboards exist.

- Constrain the table-height number field to a compact width and keep editor controls within the available column.

- Independent cards now honor the content selected in the visual editor; existing cards keep their original default. The editor also displays that default correctly before an explicit choice is saved.

## 0.1.2 · 2026-11-19

- Keep editor dropdowns mounted and ignore unrelated HA/state updates, preventing the sensor selector from closing while choosing a card source.

- Per-card Automatic / Español / English selector in the visual editor. Automatic follows Home Assistant language, with English fallback.
- Localized cards, table headings, session/result states, warnings, accessible labels, simulation, dates and data-age messages.
- Language changes preserve shared favorite, provider readings, DOM nodes and table scroll; explicit choices remain independent across cards.

## 0.1.1 · 2026-11-19

- Abort the options flow with a translated message when the entry is not loaded, instead of accessing missing runtime data after a startup failure. Also protects submissions received after unload; saved favorite and other preferences remain unchanged.

## 0.1.0 · 2026-11-17

- First normal (non-prerelease) GitHub release for installation with default Marketplace/HACS settings, as requested in catalogue review.
- Version identifiers and installation instructions updated from 0.1.0b7. No sporting runtime behavior changes.
- Existing integration identity, entities, favorite selection and dashboard configuration are preserved.
- Real live-session validation and third-party permissions remain documented as pending.

## 0.1.0b7 · 2026-11-13

- English-first README with Spanish documentation and MotoGP-style navigation and structure.
- Original FP logo banner in the README and manual installer.
- Marketplace installation button, contribution guide and bug/feature issue templates.
- Updated publication status, validation evidence and third-party notices.
- Documentation and packaging release; sporting behavior is unchanged. Real live-session validation remains pending.

## 0.1.0b6 · 2026-11-13

- Repositorio público y preparación de la solicitud al catálogo de Marketplace.
- Validación HACS completa sin omitir comprobaciones y guía de instalación actualizada.
- Atribución de datos y revisión de permisos de terceros incluidas en el instalador; los permisos pendientes siguen documentados.
- Conserva las funciones de beta 5. La verificación durante una sesión real sigue pendiente.


## 0.1.0b5 · 2026-11-13

- Formato de repositorio HACS, versión mínima de HA y enlaces de documentación/incidencias en el manifiesto.
- Empaquetado de releases sin dependencias de HA, con versión de etiqueta comprobada y ZIP/SHA256 reproducibles.
- Flujos de comprobación y adjuntos automáticos para releases futuras; instrucciones para migrar desde instalación manual.
- Buy Me a Coffee en el README y botón de patrocinio de GitHub.
- Logo propio FP con iconos locales de 256 y 512 px para Home Assistant y HACS.
- El repositorio se mantiene privado: HACS requiere hacerlo público antes de utilizarlo. No se modifica la instalación de HA ni la release 0.1.0b4.


## 0.1.0b4 · 2026-11-12

- Piloto favorito destacado con etiqueta, fondo y señal accesible en todas las tablas.
- Colores de sectores y última vuelta según las marcas explícitas del flujo F1; mejor vuelta de sesión calculada entre mejores vueltas publicadas. Sin marca, sin color de rendimiento.
- Hora y antigüedad del dato F1 separadas de su recepción de tiempos en Home Assistant; los latidos no rejuvenecen los tiempos.
- Fuente F1 registrada en el documento para compatibilidad con Chromium y Paddock en negrita cursiva.


## 0.1.0b3 · 2026-11-12

- Simulación local de diez pasos con tiempos, sectores, neumáticos, paradas, adelantamiento, pérdida de señal y reconexión; nunca escribe sensores ni resultados.
- Controles para iniciar, pausar, avanzar y reiniciar; parada automática al salir de la vista.
- Retratos de tabla ampliados y encuadrados en la cara a partir de las fotografías oficiales.


## 0.1.0b2 · 2026-11-12

- Corregido el salto al principio: actualización incremental del contenido y filtrado de cambios de entidades ajenas.
- Fuente pública F1 SignalR para tiempos, sectores, vueltas, neumáticos, tandas y contador de paradas.
- Historial de boxes OpenF1 después de la sesión, separando tiempo detenido y tiempo en pit lane.
- Tres tarjetas nuevas: tiempos, neumáticos y paradas.
- Etiquetas de directo, sesión finalizada y lectura antigua; aislamiento de sesión y reconexión con espera.

## 0.1.0b1 · 2026-11-12

- Primera beta privada de F1 Paddock, con integración de HA y tarjetas propias.
- Fuentes comprobadas con peticiones reales y muestras fechadas.
- Calendario, próxima sesión, programa, circuito, piloto, último podio, campeonatos y resultados por GP.
- Logotipo oficial F1 en la cabecera.
- F1 Bold; 23 mapas detallados; 22 fotos actuales y 22 gráficos oficiales de dorsales.
- Selección persistente de piloto y GP, caché compartida, espera ante límites y mensajes de datos ausentes.
- Ejemplos de instalación y vista de prueba con datos reales capturados.
- Directo, libres, estrategia e histórico de evolución todavía pendientes.
