<p><img src="custom_components/f1_paddock/brand/icon@2x.png" alt="Logo de F1 Paddock" width="128" height="128"></p>

# F1 Paddock · 0.1.0b5

Beta funcional de GOG23 Software Studio. Una integración propia de Home Assistant y doce tarjetas independientes, más un panel completo, con el estilo de MotoGP Paddock.

Incluye la tipografía F1 Bold, fotografías actuales, gráficos oficiales de dorsales y planos detallados originales con sus zonas. Son recursos de terceros servidos por Formula1.com; el proyecto no es una integración oficial de Formula 1.

> **Publicación pública en espera:** la revisión ha identificado recursos oficiales y permisos de datos pendientes. Consulta [la revisión previa](PUBLICATION_REVIEW.md). El logo FP propio ya está incluido; esto no autoriza los recursos de terceros.

## Descarga y estado

[Descargar la release 0.1.0b5](https://github.com/GOG23-Software-Studio/f1-paddock/releases/tag/0.1.0b5). Utiliza el archivo **f1-paddock-0.1.0b5.zip** de los adjuntos; los archivos «Source code» son el repositorio completo.

Es una integración instalable, con configuración, entidades y tarjetas incluidas. Se distribuye como **pre-release**: la instalación, los datos publicados y la simulación están comprobados; falta validar el flujo durante una sesión deportiva real. Los tiempos detallados de boxes llegan después de la sesión. El formato está preparado para HACS como repositorio personalizado. Mientras el repositorio sea privado, la instalación y actualización deben seguir siendo manuales: HACS solo admite repositorios públicos.

## Capturas

Vista general con una muestra deportiva capturada; no es una sesión en directo. El aviso de antigüedad corresponde a esa muestra. No se muestra el panel ni información doméstica de ninguna instalación.

![Vista general de F1 Paddock](docs/screenshots/overview.png)

Tiempos, sectores y piloto favorito en una **simulación con datos inventados**. Sirve para mostrar los colores y el diseño; no acredita funcionamiento en carrera.

![Colores y piloto favorito en la simulación](docs/screenshots/timing-simulation.png)

## Qué funciona

- Calendario y programa completo del GP, con horarios locales y cuenta atrás de la próxima sesión.
- Plano ampliable: conserva curvas, sectores y zonas presentes en el gráfico original de la temporada.
- Selector persistente de cualquier piloto publicado en el campeonato.
- Foto, dorsal gráfico verificado, equipo, posición del Mundial, puntos y última carrera del piloto.
- Podio fotográfico 2–1–3 de la última carrera publicada, independiente del GP elegido en resultados.
- Mundial completo de pilotos y constructores.
- Resultados por GP: carrera, clasificación con Q1/Q2/Q3 y sprint cuando la fuente lo publique.
- Tablas con desplazamiento, ampliación de columnas y acceso a la fila del favorito.
- Panel completo adaptable a móvil; las doce tarjetas también pueden colocarse individualmente con el editor visual de HA.
- Un coordinador y una caché compartida: añadir tarjetas no multiplica las consultas.
- Registro automático del recurso de las tarjetas. No necesita button-card, card-mod ni ayudantes domésticos.

## Límites de esta primera beta

Incluye tiempos de sesión, sectores, vueltas, neumáticos y tandas, y el contador de paradas mediante el flujo público F1 SignalR. Los tiempos detallados de boxes se consultan en OpenF1 después de la sesión y se separan en tiempo detenido y tiempo de paso por el pit lane. No incluye tiempos detallados de paradas en directo, posiciones animadas, Race Control, evolución del Mundial ni puntos por GP. El indicador de directo exige una sesión activa y datos recientes; una lectura de una sesión finalizada nunca se presenta como directo.

El índice estático consultado en la primera beta devolvió HTTP 401. En beta 2 se ha verificado el servicio público SignalR Core, que negocia la conexión sin cuenta. Solo se solicitan flujos públicos: no se introducen credenciales ni se solicitan flujos reservados a F1TV. El cliente comparte una conexión y espera entre reintentos. Fuera de las ventanas de sesión se conserva la última lectura y se revisa cada cinco minutos; cerca de las sesiones permanece atento al flujo.

Los recursos visuales se han comprobado para **2026**: 23 mapas y 22 fotos/dorsales del directorio oficial actual. Los tres pilotos que aparecen en el campeonato pero no en ese directorio son Esteban Ocon, Yuki Tsunoda y Ryo Hirakawa: se muestran sus nombres y números sin sustituirlos por gráficos ajenos. Las imágenes de otra temporada no se reutilizan automáticamente. La comprobación de mapas confirma la URL y la identidad del circuito; el plano de Las Vegas y el conjunto de dorsales se han inspeccionado visualmente. Los otros 22 mapas requieren revisión visual individual antes de una publicación estable.

La temporada se elige al instalar; esta beta no cambia de año automáticamente. El catálogo de pilotos requiere que ya existan clasificaciones publicadas. La preferencia y el GP seleccionado se conservan en HA; la caché de datos todavía es de memoria y no constituye un archivo permanente.

## Instalación y actualización desde HACS

**Estado actual: preparado, pendiente de hacer público el repositorio con autorización del propietario.** HACS no puede leer repositorios privados, aunque tu cuenta de GitHub tenga acceso. No se ha cambiado la visibilidad del proyecto.

Cuando el repositorio sea público:

1. Abre **HACS → menú ⋮ → Repositorios personalizados**.
2. Añade `https://github.com/GOG23-Software-Studio/f1-paddock` con tipo **Integración**.
3. Abre **F1 Paddock** y descarga la versión deseada. Para `0.1.0b5`, selecciona la pre-release en el selector de versiones/betas disponible en tu versión de HACS.
4. Reinicia Home Assistant y recarga el navegador o la aplicación.
5. Si es tu primera instalación, añade **F1 Paddock** desde **Ajustes → Dispositivos y servicios**. Si ya la instalaste manualmente, conserva la misma integración y sus entidades; no hace falta recrearlas.

Para actualizar, utiliza la actualización de F1 Paddock en HACS, reinicia HA y recarga el navegador. Se conserva el dominio `f1_paddock`, las preferencias y el recurso de tarjetas: no instales una segunda copia de la tarjeta. Guarda siempre una copia de seguridad antes de actualizar.

HACS instala la carpeta `custom_components/f1_paddock` desde la etiqueta de la release; **no utiliza el ZIP manual adjunto**. `hacs.json` oculta la rama de desarrollo para ofrecer versiones publicadas. Esta preparación no equivale a estar incluido en el catálogo oficial: se incluye una marca local propia para HA/HACS; la solicitud de inclusión en el catálogo oficial queda fuera de esta beta.

Requisitos y limitación de privacidad: [estructura de integraciones](https://hacs.dev/docs/publish/integration/), [repositorios privados](https://hacs.dev/docs/faq/private_repositories/).

## Instalación manual en Home Assistant

Paquete: `dist/f1-paddock-0.1.0b5.zip`.

1. Guarda una copia de seguridad de tu configuración.
2. Extrae el ZIP y copia **solo** `custom_components/f1_paddock` dentro de `/config/custom_components/`.
3. Reinicia Home Assistant cuando te venga bien.
4. En **Ajustes → Dispositivos y servicios → Añadir integración**, busca **F1 Paddock**.
5. Elige temporada y piloto. Los cambios posteriores de piloto no consultan Internet.
6. Recarga el navegador o la aplicación para que aparezcan las tarjetas.
7. En el panel, usa **Añadir tarjeta → Por tarjeta** y busca **F1 Paddock**. Elige el sensor Dashboard real creado por tu instalación.

La instalación y el funcionamiento básico se han comprobado en Home Assistant OS con Core 2026.11.1: siete entidades, registro automático del recurso, fuente local, cambio de piloto y resultados por GP. La verificación de tiempos en una sesión real de carrera sigue pendiente.

Ejemplo mínimo — adapta el ID si HA crea otro:

```yaml
type: custom:f1-paddock-card
entity: sensor.f1_paddock_dashboard
table_height: 430
```

El sensor descubre los selectores asociados mediante el registro de entidades de HA. Se pueden indicar `favorite_entity` y `round_entity` manualmente si hace falta. Los nombres de ejemplo no se consideran IDs universales.

`examples/sections-view.yaml` contiene una vista de prueba separada, en formato JSON válido como YAML. No reemplaza el panel existente ni incluye usuarios de esta vivienda. Cambia el ID del sensor antes de importarla. El panel completo permite probar todo con una sola tarjeta; la vista por secciones permite redimensionar y mover cada bloque desde HA.

| Tarjeta | Tipo |
|---|---|
| Panel completo | `custom:f1-paddock-card` |
| Próxima sesión | `custom:f1-paddock-next-card` |
| Circuito | `custom:f1-paddock-circuit-card` |
| Programa | `custom:f1-paddock-programme-card` |
| Piloto | `custom:f1-paddock-driver-card` |
| Último podio | `custom:f1-paddock-podium-card` |
| Mundial de pilotos | `custom:f1-paddock-standings-card` |
| Constructores | `custom:f1-paddock-constructors-card` |
| Resultados | `custom:f1-paddock-results-card` |
| Calendario | `custom:f1-paddock-calendar-card` |
| Tiempos de sesión | `custom:f1-paddock-timing-card` |
| Neumáticos y tandas | `custom:f1-paddock-tyres-card` |
| Paradas | `custom:f1-paddock-pits-card` |

## Datos y consumo

Jolpica suministra resultados, calendario y campeonatos. Consultas espaciadas al menos 1,1 segundos; calendario en caché seis horas y clasificaciones/resultados quince minutos; el coordinador revisa cada cinco minutos. Un cambio de GP pide solo los datos que no estén en caché. HTTP 429 respeta un periodo de espera, sin bucles de reintentos. Los fallos con caché conservan las lecturas y añaden una advertencia; una consulta reciente de HA no implica que los datos deportivos sean recientes.

No hay automatizaciones, avisos ni control de dispositivos. Los atributos voluminosos se excluyen de Recorder. Los diagnósticos contienen solo información de fuentes públicas y del estado de las consultas. Las fotos y mapas se cargan desde sus servidores originales. La fuente se descarga una vez desde F1 y se guarda en la caché local de HA, porque la respuesta original no incluye permisos CORS. Si falla, se usa la fuente del sistema. Los recursos requieren Internet para su primera carga y están sujetos a disponibilidad externa.

## Vista de prueba

`preview/index.html`, servida con `tools/serve_preview.py`, usa una captura real fechada. Funciona con copias privadas de los recursos en `.local/assets`; no contacta con Home Assistant. Permite cambiar de piloto y de tipo de sesión del GP capturado. La selección de otro GP avisa de que esa muestra no está incluida; en la integración instalada sí se consulta al proveedor.

## Desarrollo

Python 3.14; entorno de pruebas con Home Assistant 2026.11.1, aiohttp, pytest, pytest-asyncio y ruff. Node para comprobar las tarjetas; jsdom es solo dependencia de desarrollo. En este espacio de trabajo se reutiliza la instalación de jsdom de MotoGP Paddock; en un clon independiente instala las dependencias del `package.json`.

`tools/audit_sources.py` guarda muestras públicas y el informe de conectividad. `tools/check_assets.py` comprueba recursos originales. `tools/check_official_drivers.py` descubre las imágenes directamente en las páginas oficiales. `tools/build.py` genera ejemplos, captura normalizada y ZIP sin copias de fuentes ni fotografías. Los informes fechados se incluyen en el paquete.

Consulta `SOURCES.md`, `THIRD_PARTY_NOTICES.md` y `VALIDATION.md` antes de redistribuir o instalar.

## Corrección del desplazamiento en beta 2

Las tarjetas conservan sus nodos, imágenes, tablas y foco al recibir nuevos datos. Los cambios de otras entidades de Home Assistant no reconstruyen el panel. El reloj se actualiza sin vaciar el contenido, evitando que el navegador reduzca la altura de la página y salte al principio.


### Simulación local

La tarjeta `custom:f1-paddock-card` admite `card_type: simulation` con el sensor Dashboard habitual. Copia los pilotos recibidos y genera datos de prueba exclusivamente en el navegador, sin escribir sensores ni llamar servicios. No necesita una sesión deportiva activa.

«Iniciar simulación» reproduce diez pasos cada cuatro segundos; permite pausar, avanzar manualmente y reiniciar. Simula tiempos/sectores, paradas y compuestos, reordenación de pilotos, pérdida de señal y recuperación. Finaliza automáticamente y detiene su temporizador al abandonar la vista. Todas las tarjetas muestran la etiqueta SIMULACIÓN. Los tiempos detallados de boxes no se presentan como datos recibidos.

```yaml
type: custom:f1-paddock-card
entity: sensor.f1_paddock_dashboard
card_type: simulation
table_height: 430
```

Los retratos de las tablas utilizan ahora un encuadre de la cara, de 48 × 58 px, manteniendo las fotografías oficiales completas en las tarjetas grandes.


### Lectura de las tablas

El favorito se identifica con fondo destacado, etiqueta «Tu piloto» y `aria-current`. Las marcas explícitas `OverallFastest` / `PersonalFastest` del flujo F1 controlan el morado (mejor de sesión), verde (mejora personal) y amarillo (sin mejora personal) de sectores y última vuelta. La ausencia de marcas deja el dato neutro; no se comparan sectores de vueltas distintas para inventar récords. La columna de mejor vuelta destaca el menor tiempo válido entre los mejores tiempos publicados.

Las tarjetas de sesión muestran por separado la hora y antigüedad del dato F1 y la recepción de datos de tiempos en HA. Los latidos de conexión no actualizan esta última hora. Una sesión finalizada conserva su etiqueta aunque HA acabe de descargarla.


## Apoyar el desarrollo

F1 Paddock es gratuito. Si te resulta útil y quieres apoyar el tiempo dedicado al proyecto, puedes [invitarme a un café](https://www.buymeacoffee.com/oyogor). El apoyo es opcional y no desbloquea funciones.

<a href="https://www.buymeacoffee.com/oyogor" target="_blank" rel="noopener noreferrer"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me a Coffee" height="60" width="217"></a>

## Publicación de nuevas versiones

1. Actualiza `manifest.json`, `const.py`, el encabezado de la tarjeta y las notas de versión.
2. Ejecuta `python tools/package_release.py --tag VERSION` y las comprobaciones. La etiqueta debe coincidir exactamente con `manifest.version`; el empaquetador no necesita HA ni acceso de red.
3. Publica una release con esa etiqueta; el flujo **Attach manual installer to release** construye y adjunta el ZIP y SHA256 desde el código etiquetado. Mantén la marca de pre-release mientras siga siendo beta.

Las comprobaciones automáticas incluyen límites del paquete y hassfest. El trabajo de HACS se ejecuta solo cuando el repositorio es público e incluye la comprobación de la marca local. El logo FP es propio de este proyecto; el logotipo oficial F1 de la cabecera conserva su atribución separada.
