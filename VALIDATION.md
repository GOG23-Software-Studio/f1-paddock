## 0.1.10 · simplified cards and live-only road · 2026-11-22

- Verified all visible F1 cards in HA: explanatory text and provider warnings are inside closed information panels, the finished-session road is hidden and Alonso remains selected. Dashboard configuration is retained.
- 31 frontend checks cover card rendering, localization, retirement, stable table nodes/scroll, preserved information-panel expansion and road eligibility for fresh live races/sprints versus practice, qualifying, stale and finished sessions.
- JavaScript syntax and three deterministic packaging checks are repeated before publication. GitHub packaging, HACS and hassfest validate the exact release commit. Real active-session end-to-end validation remains pending.

## 0.1.9 · clean header and explicit retirement · 2026-11-22

- Verified in the existing HA dashboard: collapsed header details, the exact MotoGP information SVG, Alonso retained and explicit “Abandono” with Las Vegas/date. No dashboard card configuration changes.
- 29 frontend tests cover existing cards and a retirement regression: explicit finished-race retirement is translated, missing retirement flags and sprint data cannot generate a retirement, and the driver footer is removed.
- Syntax and deterministic packaging checks are repeated before publication. GitHub packaging, HACS and hassfest validate the release commit.

## 0.1.8 · visible upcoming GP · 2026-11-22

The calendar highlight was visually verified in the existing Home Assistant dashboard: Qatar shows a tinted row, accent border and contrasting “PRÓXIMO GP” badge. The change preserves the existing card configuration and Alonso as favorite. Frontend and packaging checks are repeated before publication; HACS and hassfest validate the exact release commit.

## 0.1.7 · calendar recovery and real-data road · 2026-11-22

- 56 backend tests, 28 frontend tests and three deterministic packaging checks passed; Ruff and JavaScript syntax checks passed.
- Calendar fallback validates published year, rounds and session timezones; tests cover primary failures and missing data without generating sporting results.
- Road checks cover actual-feed reordering, shrinking intervals, stable nodes/scroll, favorite selection, stale/finished states and all 11 verified 2026 team images. No in-app simulation generators or controls ship in this version.
- Local HA checks during development confirmed the recovered 23-round 2026 calendar and finished-session road with Fernando Alonso retained. Real active-session end-to-end validation remains pending.
- No Home Assistant configuration changes are made by publishing this release. Existing entities, cards and favorites are kept on upgrade.

## 0.1.6 · normalized ZIP system headers · 2026-11-20

A second platform-dependent ZIP field (`create_system`) remained in 0.1.5. Both archive writers now set it explicitly to Unix (3), alongside fixed timestamps, modes, ordering, normalized text and stored entries. Packaging checks enforce all entry creator-system fields. The new release is validated as a draft before publication; previous assets are preserved.

## 0.1.5 · cross-platform release reproducibility · 2026-11-20

The 0.1.4 published assets matched their local checksums, but the Linux release workflow correctly refused to overwrite them because Windows Path ordering and zlib compression differed. No existing assets were replaced. This corrective version sorts archive paths explicitly and uses stored ZIP entries, ensuring the same bytes on both systems. The three package checks include ordering/compression invariants and preservation of download counters. README images show the 0.1.4 preview; sporting content and language selection are unchanged in 0.1.5.

## 0.1.4 · Marketplace release assets and bilingual screenshots · 2026-11-20

- 25 frontend tests and three offline packaging checks passed, including flat runtime extraction, repeated update preserving external HA settings, deterministic output and manual/runtime layout separation.
- The stable `f1_paddock.zip` asset contains runtime files at its root, matching the Marketplace extraction contract. The versioned manual ZIP retains `custom_components/f1_paddock/`. Both include SHA256 checksums.
- Release uploads preserve existing identical assets instead of replacing them and resetting download counts; mismatched assets fail closed.
- English preview: Max Verstappen, 2026 British GP (Silverstone). Spanish preview: Fernando Alonso, 2026 Spanish GP (Madrid). Results and round-specific standings retrieved from Jolpica on 2026-11-20. Four separate screenshots were visually reviewed; timing screenshots are explicitly fictional simulations.
- No HA settings, favorites or dashboards changed. Real-session validation remains pending; Las Vegas monitoring is scheduled separately.
- GitHub packaging, HACS and hassfest validate the exact release commit before publication.

## 0.1.3 · single entry and shared seasons · 2026-11-20

- 47 backend tests, 24 frontend tests and two package checks passed; Ruff passed.
- UI in the existing HA installation: selected 2023, checked historical calendar/standings/results, returned to automatic current season (2026). Alonso and the entry ID remain unchanged; the original result GP (R21 Las Vegas) was restored after testing.
- F1 view configuration matches the previously verified baseline exactly (SHA256 `1532d665701938760aa773b2172ae28a5997b1662d3974fe041c43cc7032cdab`). No dashboard writes were made.
- Integration page shows one configuration, eight entities (including the new Season selector), and no Add service control. Existing entry migrated to schema version 2 without changing entity identities.
- Default current season, migration, singleton guard, explicit historical requests, concurrent season change, failed historical recovery and automatic year rollover have regression coverage. Actual January rollover remains a clock-controlled test.
- Historical photos/maps are only shown when their assets match the year; current media is not substituted for historical media. Historical timing replay is not provided.

# Release 0.1.2

- Per-card Automatic / Español / English selection, with Home Assistant language changes reflected without losing table nodes or scroll.
- Cards, editor, states, warnings, simulation and date/freshness formatting translated. Original sporting names and shared favorite remain intact.
- Editor sensor dropdown retains its DOM node, focus and pending selection while unrelated HA states and sporting readings change.
- 21 frontend tests cover localization, editor updates and existing timing/scroll behavior. Local browser checks covered the language selector and 30 simulated editor updates.
- Exact release commit must pass HACS, hassfest and packaging before publication; the release notes link that validation run.

## Historical validation

# Release 0.1.1

Options now abort with a translated message if the entry is not loaded, before reading runtime data. Regression coverage includes startup failure, unload and stale form submissions, plus the loaded form and preservation of other preferences.

42 Python tests, Ruff and two packaging checks passed for the correction. HACS, hassfest and packaging will validate the exact release commit before publication; the release notes link that run. This release also updates README catalogue status following the merged submission. No household configuration or dashboard is changed by publishing.

## Historical validation

# Release 0.1.0

Prepared on 17 November 2026 following the maintainer request for a non-prerelease in catalogue PR #14100. This changes version metadata and documentation from beta 7, not sporting runtime behavior. Existing domain, entity identity and dashboard configuration are retained.

HACS, hassfest and packaging must pass on the exact release commit before publishing. Passing run links will be recorded in the release and catalogue request. Publishing a normal release does not claim real live-session validation or resolve third-party permissions.

## Historical validation records

The following entries describe their original versions and review state at the time.

# Release 0.1.0b7 preparation

This release updates documentation and packaging, including the bilingual README, project banner, contribution guide and issue templates. Runtime behavior is unchanged apart from the version identifier. The installer now includes only the project-owned `docs/studio-banner.png` from `docs/`; third-party screenshots and local/private media remain excluded. Packaging tests check that boundary and deterministic output.

HACS, hassfest and packaging must pass on the release commit before publication. Validation-run links are recorded in the GitHub release and catalogue request after completion. The historical beta 6 evidence below remains attributed to beta 6.

# Current validation — 0.1.0b6

Reviewed on 13 November 2026 for Marketplace submission.

- Public repository with a single `custom_components/f1_paddock` integration, root `hacs.json`, MIT license, description, topics and Issues enabled.
- HACS, hassfest and manual-package checks passed without ignored checks before the beta 6 release: [validation run](https://github.com/GOG23-Software-Studio/f1-paddock/actions/runs/43470052377).
- The [beta 6 release](https://github.com/GOG23-Software-Studio/f1-paddock/releases/tag/0.1.0b6) was published after validation, with the manual ZIP and SHA256. Its installer workflow passed.
- Subsequent README/banner commits also passed repository validation. They do not change the immutable beta 6 installer.
- [Catalogue request #14100](https://github.com/hacs/default/pull/14100) is open. Initial catalogue checks passed; additional checks shown as skipped are not claimed as passed. No maintainer review or acceptance is claimed.
- HA installation evidence below refers to earlier installed betas. It does not claim beta 6 was installed in the household instance.
- Real live-session validation and third-party permissions remain pending. Technical validation is not legal clearance; see [publication review](PUBLICATION_REVIEW.md).

## Historical evidence

The following entries describe their original versions and publication status at the time. Statements about private-repository checks are historical, not the current status.

# Validación de 0.1.0b5

- 27 pruebas Python y 14 pruebas JavaScript correctas; dos comprobaciones adicionales de empaquetado con unittest (solo biblioteca estándar).
- Se comprueba etiqueta/versión, presencia de traducciones y tarjeta, exclusión de datos privados y cachés y paquetes idénticos al repetir la construcción o cambiar finales de línea.
- Iconos de marca propios incluidos en el componente, a 256 y 512 px con canal alfa.
- HACS usa la estructura fuente estándar `custom_components/f1_paddock`, no el ZIP adjunto para instalación manual. Manifiesto con documentación y seguimiento de incidencias; mínimo declarado HA 2026.11.1.
- Preparación para repositorio personalizado. HACS no soporta repositorios privados; la comprobación HACS remota se omite expresamente mientras siga privado. La instalación desde HACS queda pendiente de autorización para hacer público el repositorio y de validación posterior. No se ha modificado la instancia HA.

## Validación anterior

# Validación de 0.1.0b4

- 27 pruebas Python y 14 pruebas JavaScript correctas; Ruff sin errores.
- Marcas explícitas de rendimiento conservadas en sectores y última vuelta. Sectores incompletos mantienen sus posiciones S1/S2/S3. Se comprueban ausencia de marcas, prioridad del récord global y tiempos nulos.
- El favorito incorpora etiqueta y señal accesible. Las horas de fuente y recepción permanecen separadas: una lectura antigua recién descargada no se presenta como reciente. Los latidos no renuevan la hora de recepción de tiempos.
- Se mantienen las pruebas de identidad de nodos, desplazamiento, aislamiento de datos y simulación.
- Copia previa de la integración: `/config/f1_paddock_before_b4_20261112_2149`. Configuración HA comprobada. Hashes de paneles y MotoGP idénticos antes del reinicio.

- Instalación real: 22 pilotos con marcas de tiempos; fecha F1 del 8 de noviembre separada de recepción en HA del 12 de noviembre. Favorito Alonso y MotoGP conservados, sin errores propios en el registro.

## Validación anterior

# Validación de 0.1.0b3

- 26 pruebas Python y 12 pruebas JavaScript correctas.
- La simulación recorre diez pasos y comprueba cambios de tiempos, neumáticos, paradas, orden de pilotos y estado de conexión. Se verifica que no modifica las entidades originales ni llama servicios HA; conserva nodos y desplazamiento horizontal y vertical de las tablas. El temporizador se limpia al desmontar la tarjeta.
- Navegador local: desplazamiento vertical de 827 px conservado durante la reproducción automática, incluidos cambios de compuesto y reordenación de filas. Inspección visual de los retratos oficiales encuadrados en la cara.
- Instalación real: nueva pestaña «F1 · simulación»; las 36 vistas previas permanecen idénticas. Reproducción completa hasta paso 10: desplazamiento de página 1193 px y tabla de neumáticos 40 px vertical / 40 px horizontal conservados durante 50 segundos. Tiempos y sectores cambiaron, neumáticos medios pasaron a duros/blandos y los contadores de parada a 1. Sensores reales, favorito Alonso y MotoGP permanecieron sin cambios.
- Se comprueba también que al perder señal se congelan los datos hasta recuperar la conexión y que las diferencias mantienen el orden tras el adelantamiento.
- Este ensayo comprueba las tarjetas con datos sintéticos, no acredita latencia ni continuidad de la conexión deportiva real durante un GP.

## Validación anterior

# Validación de 0.1.0b2

Comprobada el 12 de noviembre de 2026 sobre Home Assistant OS, Core 2026.11.1.

- 26 pruebas Python y 10 pruebas JavaScript correctas; Ruff sin errores.
- Conexión real al directo público F1: sesión 11412 finalizada, 22 pilotos; 58 pasos por boxes publicados por OpenF1. Cierre y cancelación del cliente comprobados.
- Pruebas de frescura, temporada y conexión: una sesión antigua o terminada nunca se anuncia como directo. Se comprueban deltas, cambio de sesión y datos ausentes.
- Actualización instalada con copia de seguridad en `/config/f1_paddock_before_b2_20261112_2004`; comprobación de configuración satisfactoria y reinicio completado. Sin entradas propias en el registro de errores/advertencias después de instalar.
- Añadidas tres tarjetas: tiempos de sesión, neumáticos/tandas y paradas. Las otras 35 vistas permanecen semánticamente idénticas y en el mismo orden; MotoGP continúa disponible.
- El renderizado conserva los nodos e ignora cambios de entidades ajenas. Comprobación en HA: desplazamiento vertical 1471 px conservado durante 31 segundos, incluyendo ciclos del reloj y una actualización explícita de la entidad.
- Captura real: `docs/session-b2-ha.jpg`.

El funcionamiento durante una sesión deportiva activa sigue pendiente de comprobar. El contador de paradas procede del directo público; los tiempos detallados de parada y tránsito por boxes se consultan tras la sesión. No se solicitan credenciales ni se accede a datos restringidos.

## Validación anterior

# Validación de 0.1.0b1

Realizada el 12 de noviembre de 2026, con Python 3.14, Home Assistant 2026.11.1 y Node.

## Resultados

- 20 pruebas Python correctas: normalización, fechas, identidad de GP/temporada, gráficos de número, caché, límite de peticiones, respuestas incompletas, fallos con datos conservados, registro de recursos y descarga/caché de la fuente.
- 7 pruebas de tarjetas correctas: nueve tarjetas y panel completo, favorito, podio 2–1–3, tablas completas, Q1/Q2/Q3, sprint no publicado, cambio de GP pendiente, contenido escapado, URLs seguras y conservación del desplazamiento.
- Ruff sin errores; sintaxis JavaScript comprobada.
- Cliente de ejecución comprobado contra Jolpica: siete peticiones reales, 23 GPs, 25 pilotos clasificados, 22 gráficos oficiales de dorsales, última carrera R20, sin errores ni advertencias. Informe: `live-validation.json`.
- Recursos: 23 URLs de mapas con imagen válida; 22 fotos actuales y 22 dorsales descubiertos en las páginas oficiales de los pilotos. Conjunto de dorsales inspeccionado visualmente y plano de Las Vegas inspeccionado; quedan otros mapas por revisar visualmente uno por uno.
- Tipografía original: HTTP 200; se detectó que no tiene cabecera CORS. Se añadió descarga y caché local de HA, con comprobación de firma WOFF, tamaño máximo, URL fija y reutilización offline.
- Vista en navegador a 1600 × 1050 y 390 × 844. Sin desbordamiento horizontal de página en móvil (375 px útiles tras la barra de desplazamiento).
- Cambio Alonso → Sainz → Alonso: cambian retrato, dorsal oficial, puntos y resultado.
- Plano ampliable: se mantiene abierto durante las actualizaciones del reloj y se cierra correctamente.
- Selección de clasificación: se muestran Q1/Q2/Q3. Selección de sprint sin datos: mensaje explícito, sin reutilizar resultados de carrera.

## Alcance

La vista usa una captura real fechada y copias privadas de las imágenes para probar el diseño. No es una sesión en directo y no acredita funcionamiento en carrera.

Se instaló posteriormente en Home Assistant OS con Core 2026.11.1, después de guardar una copia de los paneles y pasar la comprobación de configuración. La integración quedó cargada con siete entidades y sin errores propios en el registro. Se añadió una vista de prueba después de MotoGP y se comprobó que las 35 vistas anteriores permanecen idénticas, con el mismo orden relativo. MotoGP permanece cargado. Se verificaron cambios de piloto, fotografías y dorsales, fuente local, mapa ampliable y resultados de Miami (22 filas en carrera, clasificación y sprint). La comprobación de una sesión deportiva en curso sigue pendiente.

Las pruebas de registro de recursos ejercitan las interfaces de Home Assistant con dobles controlados; no equivalen a una instalación de extremo a extremo. Las advertencias de deprecación emitidas por dependencias de HA durante pytest no produjeron fallos.

Capturas privadas: `docs/desktop.jpg` y `docs/mobile.jpg`. Se excluyen del ZIP instalable porque contienen recursos gráficos de terceros.

Captura de la instalación real: `docs/installed-ha.jpg`. El informe privado con el respaldo y las comprobaciones se conserva fuera del ZIP en `.local/deploy/installation-report.json`.
