/** F1 Paddock 0.1.8. HA provides data; cards never poll external providers. */
export const TEAM_CARS_2026 = [{"season":2026,"team":"Alpine","aliases":["Alpine","BWT Alpine F1 Team"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/alpine/2026alpinecarright.webp","source_page":"https://www.formula1.com/en/teams/alpine"},{"season":2026,"team":"Aston Martin","aliases":["Aston Martin","Aston Martin Aramco F1 Team"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/astonmartin/2026astonmartincarright.webp","source_page":"https://www.formula1.com/en/teams/aston-martin"},{"season":2026,"team":"Audi","aliases":["Audi","Audi Revolut F1 Team"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/audi/2026audicarright.webp","source_page":"https://www.formula1.com/en/teams/audi"},{"season":2026,"team":"Cadillac","aliases":["Cadillac","Cadillac Formula 1 Team"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/cadillac/2026cadillaccarright.webp","source_page":"https://www.formula1.com/en/teams/cadillac"},{"season":2026,"team":"Ferrari","aliases":["Ferrari","Scuderia Ferrari HP"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/ferrari/2026ferraricarright.webp","source_page":"https://www.formula1.com/en/teams/ferrari"},{"season":2026,"team":"Haas","aliases":["Haas","Haas F1 Team","TGR Haas F1 Team"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/haas/2026haascarright.webp","source_page":"https://www.formula1.com/en/teams/haas"},{"season":2026,"team":"McLaren","aliases":["McLaren","McLaren Mastercard F1 Team"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/mclaren/2026mclarencarright.webp","source_page":"https://www.formula1.com/en/teams/mclaren"},{"season":2026,"team":"Mercedes","aliases":["Mercedes","Mercedes-AMG Petronas F1 Team"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/mercedes/2026mercedescarright.webp","source_page":"https://www.formula1.com/en/teams/mercedes"},{"season":2026,"team":"Racing Bulls","aliases":["Racing Bulls","Visa Cash App Racing Bulls F1 Team"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/racingbulls/2026racingbullscarright.webp","source_page":"https://www.formula1.com/en/teams/racing-bulls"},{"season":2026,"team":"Red Bull","aliases":["Red Bull","Red Bull Racing","Red Bull Racing Ford"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/redbullracing/2026redbullracingcarright.webp","source_page":"https://www.formula1.com/en/teams/red-bull-racing"},{"season":2026,"team":"Williams","aliases":["Williams","Atlassian Williams F1 Team"],"url":"https://media.formula1.com/image/upload/c_fit,w_768/q_auto/v1740000001/common/f1/2026/williams/2026williamscarright.webp","source_page":"https://www.formula1.com/en/teams/williams"}];
export function teamCarImage(season, team) {
  if(Number(season)!==2026||typeof team!=='string')return null;
  const name=team.trim().toLowerCase().replace(/\s+/g,' ');
  return TEAM_CARS_2026.find(car=>car.aliases.some(alias=>alias.toLowerCase()===name))||null;
}
export function resolveLanguage(config, hass) {
  const selected=config?.language;
  return String(selected==='es'||selected==='en'?selected:hass?.language||globalThis.navigator?.language||'en').toLowerCase().startsWith('es')?'es':'en';
}
const ENGLISH = {"Carretera de posiciones":"Position road","ORDEN E INTERVALOS":"ORDER AND INTERVALS","Vista esquemática del orden; separación visual no proporcional al tiempo ni a la distancia real.":"Schematic running order; visual spacing is not proportional to time or physical distance.","Sin posiciones publicadas para esta sesión.":"No positions published for this session.","Al anterior":"To car ahead","Diferencias publicadas; un guion indica dato no disponible.":"Published gaps; a dash means unavailable data.","Líder":"Leader","En boxes":"In pits","Retirado":"Retired","Cargando la temporada seleccionada…":"Loading the selected season…","No se pudo cargar la temporada. Puedes elegir otra o volver a intentarlo.":"Unable to load the season. Choose another season or try again.","Temporada":"Season","Temporada actual (automática)":"Current season (automatic)",
  "Calendario de respaldo: FastF1. Algunos resultados pueden no estar disponibles.": "Backup calendar: FastF1. Some results may be unavailable.",
  "Pulsa un coche para ver sus datos.": "Select a car to see its details.",
  "Volver a datos reales": "Return to real data",
  "Datos del piloto": "Driver details",
  "Monoplaza oficial": "Official team car",
  "Imágenes de referencia de los equipos": "Team reference images",
  "Posición": "Position",
  "Imagen no disponible en la fuente": "Image unavailable from the source",
  "Selecciona el sensor Dashboard de F1 Paddock": "Select the F1 Paddock Dashboard sensor",
  "Información parcial: se conservan las últimas lecturas disponibles.": "Partial data: the last available readings are retained.",
  "selector no disponible": "selector unavailable",
  "CAMPEONATO DEL MUNDO": "WORLD CHAMPIONSHIP",
  "Datos pendientes de actualizar": "Data awaiting update",
  "Resultados publicados": "Published results",
  "PRÓXIMA SESIÓN": "NEXT SESSION",
  "PROGRAMA DEL GRAN PREMIO": "GRAND PRIX PROGRAMME",
  "TEMPORADA FINALIZADA": "SEASON FINISHED",
  "Consulta los horarios": "Check the schedule",
  "Hasta la próxima temporada": "Until next season",
  "Hora local de tu dispositivo": "Your device’s local time",
  "● Información parcial o antigua": "● Partial or stale data",
  "● Última consulta": "● Last check",
  "Neumáticos y contador de paradas. Tiempos de boxes publicados: OpenF1.": "Tyres and pit-stop counts. Published pit times: OpenF1.",
  "Temporada finalizada. Consulta los circuitos en el calendario.": "Season finished. See circuits in the calendar.",
  "EL GRAN PREMIO": "THE GRAND PRIX",
  "Ronda": "Round",
  "Ampliar plano del circuito": "Enlarge circuit map",
  "Plano detallado de": "Detailed map of",
  "con las zonas señaladas por F1": "with zones marked by F1",
  "Ampliar plano ⤢": "Enlarge map ⤢",
  "Curvas, sectores y zonas según el gráfico original.": "Corners, sectors and zones as shown in the original artwork.",
  "Plano de esta temporada aún no verificado.": "This season’s map has not been verified yet.",
  "Plano F1": "F1 map",
  "Siguiente": "Next",
  "Por confirmar": "To be confirmed",
  "Programa no disponible": "Programme unavailable",
  "ENTRENAMIENTOS · CLASIFICACIÓN · CARRERA": "PRACTICE · QUALIFYING · RACE",
  "El piloto guardado no aparece en la clasificación disponible. Puedes elegir otro.": "The saved driver is missing from the available standings. You can choose another.",
  "PILOTO SELECCIONADO": "SELECTED DRIVER",
  "ÚLTIMA CARRERA PUBLICADA": "LATEST PUBLISHED RACE",
  "Sin resultado publicado": "No published result",
  "Estado no publicado": "Status not published",
  "TU PILOTO": "YOUR DRIVER",
  "Resultados todavía no publicados": "Results not published yet",
  "Pendiente": "Pending",
  "CARRERA · RESULTADO PUBLICADO": "RACE · PUBLISHED RESULT",
  "Ir a mi piloto": "Go to my driver",
  "Vista compacta": "Compact view",
  "Todas las columnas ↔": "All columns ↔",
  "Resultados de la sesión": "Session results",
  "Datos todavía no publicados.": "Data not published yet.",
  "Temporada": "Season",
  "Después de la ronda": "After round",
  "TEMPORADA ACTUAL": "CURRENT SEASON",
  "CAMPEONATO DE EQUIPOS": "TEAM CHAMPIONSHIP",
  "GP del": "GP on",
  "Cargando el gran premio seleccionado…": "Loading the selected grand prix…",
  "Sin clasificación publicada para esta sesión y gran premio.": "No classification published for this session and grand prix.",
  "Carrera, clasificación y sprint cuando estén publicados. Los tiempos y neumáticos de la última sesión recibida se muestran en el centro de sesión.": "Race, qualifying and sprint when published. Timing and tyres from the last received session are shown in the session centre.",
  "CLASIFICACIONES PUBLICADAS": "PUBLISHED CLASSIFICATIONS",
  "Datos F1:": "F1 data:",
  "Recibidos en HA:": "Received in HA:",
  "Lectura antigua": "Stale reading",
  "Finalizada": "Finished",
  "En marcha": "Running",
  "Pausada": "Paused",
  "Sesión todavía no recibida": "Session not received yet",
  "Vuelta publicada": "Reported lap",
  "Mejor de sesión": "Session best",
  "Mejora personal": "Personal improvement",
  "Sin mejora personal": "No personal improvement",
  "Mejor de la sesión": "Session best",
  "Colores de última vuelta y sectores según las marcas de F1; el mínimo de mejores vueltas publicadas se destaca en morado. Sin marca, el tiempo queda neutro.": "Last-lap and sector colors follow F1 flags; the lowest published best lap is purple. Unflagged times remain neutral.",
  "CENTRO DE SESIÓN": "SESSION CENTRE",
  "Nuevo": "New",
  "Usado": "Used",
  "vueltas": "laps",
  "Compuestos y tandas publicados por F1. No se deduce desgaste ni se cuenta una parada por cada cambio de tanda.": "Compounds and stints published by F1. Wear is not inferred and stint changes do not imply a stop.",
  "ESTRATEGIA · DATOS PUBLICADOS": "STRATEGY · PUBLISHED DATA",
  "En boxes": "In pits",
  "Retirado": "Retired",
  "Tiempos de boxes publicados": "Published pit times",
  "El contador se recibe del directo público. Los tiempos detallados se consultan después de la sesión; no están disponibles en directo sin acceso adicional.": "Counts come from public timing. Detailed pit times are requested after the session; live durations require additional access.",
  "OpenF1 · «Detenido» y «Pit lane» son medidas distintas. Un guion no equivale a cero.": "OpenF1 · “Stopped” and “Pit lane” are different measurements. A dash does not mean zero.",
  "Historial de boxes temporalmente no disponible.": "Pit history temporarily unavailable.",
  "BOXES · CONTADOR Y TIEMPOS": "PITS · COUNTS AND TIMES",
  "GRAN PREMIO ACTUAL / PRÓXIMO": "CURRENT / NEXT GRAND PRIX",
  "PRÓXIMO GP": "NEXT GP",
  "TODOS LOS GRANDES PREMIOS": "ALL GRANDS PRIX",
  "F1 Paddock · Selecciona el sensor Dashboard de la integración. Datos todavía no disponibles.": "F1 Paddock · Select the integration’s Dashboard sensor. Data is not available yet.",
  "Tarjeta desconocida": "Unknown card",
  "Líder": "Leader",
  "Comprueba tiempos, sectores, cambios de neumático, paradas y reconexión. No modifica sensores, resultados ni tu piloto guardado.": "Test timing, sectors, tyre changes, stops and reconnection. Sensors, results and your saved driver are unchanged.",
  "Pausar": "Pause",
  "Siguiente paso": "Next step",
  "Reiniciar": "Reset",
  "Paso": "Step",
  "No se pudo guardar la selección. Inténtalo de nuevo.": "Unable to save the selection. Try again.",
  "Cerrar plano": "Close map",
  "Cerrar ✕": "Close ✕",
  "Plano detallado del circuito": "Detailed circuit map",
  "Plano original F1": "Original F1 map",
  "Próxima sesión": "Next session",
  "Circuito": "Circuit",
  "Programa del fin de semana": "Weekend programme",
  "Tu piloto": "Your driver",
  "Último podio": "Latest podium",
  "Mundial de pilotos": "Driver standings",
  "Mundial de constructores": "Constructor standings",
  "Resultados": "Results",
  "Calendario de la temporada": "Season calendar",
  "Tiempos de la sesión": "Session timing",
  "Neumáticos y tandas": "Tyres and stints",
  "Paradas y paso por boxes": "Pit stops and pit lane",
  "No tomó la salida": "Did not start",
  "No se clasificó": "Did not qualify",
  "Finalizado": "Finished",
  "Doblado": "Lapped",
  "Abandono": "Retired",
  "Descalificado": "Disqualified",
  "Sin clasificar": "Not classified",
  "Carrera": "Race",
  "Clasificación": "Qualifying",
  "Libres 1": "Practice 1",
  "Libres 2": "Practice 2",
  "Libres 3": "Practice 3",
  "Clasificación sprint": "Sprint qualifying",
  "En directo": "Live",
  "Última sesión · finalizada": "Last session · finished",
  "Lectura antigua · sin directo": "Stale reading · not live",
  "Esperando datos de sesión": "Waiting for session data",
  "Blando": "Soft",
  "Medio": "Medium",
  "Duro": "Hard",
  "Intermedio": "Intermediate",
  "Lluvia": "Wet",
  "Sin dato": "No data",
  "No disponible": "Unavailable",
  "Foto no disponible": "Photo unavailable",
  "Dorsal": "Race number",
  "gráfico oficial F1": "official F1 artwork",
  "F1 · logotipo oficial": "F1 · official logo",
  "Mundial": "Championship",
  "Puntos": "Points",
  "Vueltas": "Laps",
  "Tiempo / diferencia": "Time / gap",
  "Piloto": "Driver",
  "Al líder": "To leader",
  "Victorias": "Wins",
  "Equipo": "Team",
  "Gran premio": "Grand prix",
  "Sesión": "Session",
  "Parrilla": "Grid",
  "Estado": "Status",
  "Intervalo": "Interval",
  "Última vuelta": "Last lap",
  "Mejor vuelta": "Best lap",
  "Neumático": "Tyre",
  "Paradas": "Stops",
  "Compuesto": "Compound",
  "Vueltas publicadas": "Reported laps",
  "Juego": "Set",
  "Tandas": "Stints",
  "Vuelta": "Lap",
  "Detenido": "Stopped",
  "Hora": "Time",
  "Sensor Dashboard": "Dashboard sensor",
  "Selecciona el sensor": "Select the sensor",
  "Contenido": "Content",
  "Panel completo": "Complete dashboard",
  "Altura máxima de las tablas": "Maximum table height",
  "Los selectores de piloto y gran premio se detectan automáticamente. Diseño y visibilidad se ajustan desde Home Assistant.": "Driver and grand prix selectors are detected automatically. Layout and visibility are managed by Home Assistant.",
  "Idioma": "Language",
  "Automático": "Automatic",
};
const SPANISH_SESSIONS = {'Race':'Carrera','Qualifying':'Clasificación','Practice 1':'Libres 1','Practice 2':'Libres 2','Practice 3':'Libres 3','Sprint Qualifying':'Clasificación sprint','Sprint Shootout':'Clasificación sprint'};
export const translate = (language, text) => {
  const messages=language==='en'?ENGLISH:SPANISH_SESSIONS;
  return Object.hasOwn(messages,text)?messages[text]:text;
};

export const escapeHTML = v => String(v ?? '—').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const safeAsset = value => {
  if (typeof value !== 'string') return '';
  if (value === '/f1_paddock_font/Formula1-Bold.woff') return value;
  if (/^\/preview-assets\/[A-Za-z0-9_.-]+$/.test(value)) return value;
  try { const u=new URL(value); return u.protocol==='https:'&&['media.formula1.com','www.formula1.com'].includes(u.hostname)&&!u.username&&!u.password ? value : ''; } catch { return ''; }
};
// Keep live DOM nodes (and page height) stable. Replacing a shadow tree on every
// HA state change makes the browser clamp its outer scroll position to the top.
export function patchDOM(parent, source) {
  let index=0;
  for(const next of Array.from(source.childNodes)){
    let current=parent.childNodes[index];
    // Moving a keyed road marker preserves the car node across overtakes and new arrivals.
    const driverKey=next.nodeType===1&&next.getAttribute('data-road-driver');
    if(driverKey&&current?.getAttribute?.('data-road-driver')!==driverKey){
      const existing=Array.from(parent.children).find(node=>node.getAttribute('data-road-driver')===driverKey);
      if(existing)parent.insertBefore(existing,current||null);
      else parent.insertBefore(next.cloneNode(true),current||null);
      current=parent.childNodes[index];
    }
    if(!current){parent.append(next.cloneNode(true));index++;continue;}
    if(current.nodeType!==next.nodeType||current.nodeName!==next.nodeName){parent.replaceChild(next.cloneNode(true),current);index++;continue;}
    if(current.nodeType===3||current.nodeType===8){if(current.nodeValue!==next.nodeValue)current.nodeValue=next.nodeValue;}
    else if(!current.isEqualNode(next)){
      for(const a of Array.from(current.attributes||[]))if(!next.hasAttribute(a.name))current.removeAttribute(a.name);
      for(const a of Array.from(next.attributes||[]))if(current.getAttribute(a.name)!==a.value)current.setAttribute(a.name,a.value);
      patchDOM(current,next);
    }
    index++;
  }
  while(parent.childNodes.length>index)parent.lastChild.remove();
}
export function timingPhase(t={},now=Date.now()){
  if(t.phase==='finished')return 'finished';
  const age=now-Date.parse(t.source_time);
  return t.live&&t.connected&&Number.isFinite(age)&&age>=-5000&&age<=90000?'live':t.phase==='live'||t.phase==='stale'?'stale':'waiting';
}
export function ageText(value,now=Date.now(),language="es"){
  const age=now-Date.parse(value);if(!Number.isFinite(age)||age< -5000)return language==='en'?'Time unavailable':'Hora no disponible';
  const sec=Math.max(0,Math.floor(age/1000));
  const amount=sec<60?sec:sec<3600?Math.floor(sec/60):sec<86400?Math.floor(sec/3600):Math.floor(sec/86400); const unit=sec<60?"s":sec<3600?"min":sec<86400?"h":"d"; return language==="en"?`${amount} ${unit} ago`:`hace ${amount} ${unit}`;
}
export function lapSeconds(value){
  if(typeof value!=='string'||!/^([0-9]+:)?[0-9]{1,2}\.[0-9]{3}$/.test(value))return null;
  const parts=value.split(':').map(Number),seconds=parts.length===2?parts[0]*60+parts[1]:parts[0];return seconds>0?seconds:null;
}
const timeStamp=(value,language="es")=>{const d=new Date(value);return value&&Number.isFinite(+d)?new Intl.DateTimeFormat(language,{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(d):translate(language,'No disponible');};
const TIME_MARKS={overall:['◆','Mejor de la sesión'],personal:['↑','Mejora personal'],regular:['•','Sin mejora personal']};
const PHASE={live:'En directo',finished:'Última sesión · finalizada',stale:'Lectura antigua · sin directo',waiting:'Esperando datos de sesión'};
const TYRES={SOFT:['S','Blando','#ff6473'],MEDIUM:['M','Medio','#f6d365'],HARD:['H','Duro','#edf2fa'],INTERMEDIATE:['I','Intermedio','#62cb9e'],WET:['W','Lluvia','#65aaf0']};
const tyreBadge=(t,language='es')=>{if(!t)return '—';const x=TYRES[t.compound]||['?',t.compound||'Sin dato','#a5b6cc'];return `<span class="tyre" style="--tyre-color:${x[2]}" title="${escapeHTML(translate(language,x[1]))}">${x[0]}</span> ${escapeHTML(translate(language,x[1]))}`;};
export const dateText = (value,time=true,language="es") => {
  if(!value) return translate(language,'Por confirmar');
  const onlyDate=/^\d{4}-\d{2}-\d{2}$/.test(value);
  const d=new Date(onlyDate?`${value}T12:00:00Z`:value);
  if(!Number.isFinite(+d)) return translate(language,'Por confirmar');
  return new Intl.DateTimeFormat(language,{day:'2-digit',month:'short',...(onlyDate?{timeZone:'UTC'}:time?{hour:'2-digit',minute:'2-digit'}:{})}).format(d);
};
export function nextSession(snapshot,now=Date.now()) {
  return (snapshot.event?.sessions||[]).filter(s=>s.start&&Date.parse(s.start)>now).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start))[0]||null;
}
export function countdown(start,now=Date.now(),language="es") {
  const diff=Date.parse(start)-now;
  if(!Number.isFinite(diff)||diff<=0) return language==='en'?'Schedule pending':'Horario pendiente';
  const m=Math.floor(diff/60000); return `${Math.floor(m/1440)} d ${Math.floor(m%1440/60)} h ${m%60} min`;
}
const SESSION_NAMES={RAC:'Carrera',QUAL:'Clasificación',SPR:'Sprint'};
const STATUS={'Did not start':'No tomó la salida','Did not qualify':'No se clasificó',Finished:'Finalizado',Lapped:'Doblado',Retired:'Abandono','Disqualified':'Descalificado','Not classified':'Sin clasificar','Withdrew':'Retirado'};
const BLOCKS={road:'Carretera de posiciones',next:'Próxima sesión',circuit:'Circuito',programme:'Programa del fin de semana',driver:'Tu piloto',podium:'Último podio',standings:'Mundial de pilotos',constructors:'Mundial de constructores',results:'Resultados',calendar:'Calendario de la temporada',timing:'Tiempos de la sesión',tyres:'Neumáticos y tandas',pits:'Paradas y paso por boxes'};
const e=escapeHTML;
const numberGraphic=(d,language='es')=>safeAsset(d?.number_art)?`<span class="number"><img class="number-art" src="${e(safeAsset(d.number_art))}" alt="${e(translate(language,'Dorsal'))} ${e(d.number)} · ${e(translate(language,'gráfico oficial F1'))}"><span class="initials" hidden>${e(d.number)}</span></span>`:`<span class="number">${e(d?.number??'—')}</span>`;
const val=x=>x===null||x===undefined?'—':e(x);
const bodyPhoto=(d,cls='',language='es')=>safeAsset(d?.photo)?`<img class="portrait ${cls}" src="${e(safeAsset(d.photo))}" alt="${e(d.name)}" loading="lazy" referrerpolicy="no-referrer"><span class="initials" hidden>${e(d.code||'F1')}</span>`:`<span class="initials ${cls}" aria-label="${e(translate(language,'Foto no disponible'))}">${e(d?.code||'F1')}</span>`;
const photo=(d,cls='',language='es')=>cls==='small'?`<span class="headshot">${bodyPhoto(d,cls,language)}</span>`:bodyPhoto(d,cls,language);

function dashboardSensors(hass){return Object.entries(hass?.states||{}).filter(([id,s])=>id.startsWith('sensor.')&&s.attributes?.snapshot?.schema_version===1&&s.attributes.snapshot.capabilities);}
function onlyDashboard(hass){const sensors=dashboardSensors(hass);return sensors.length===1?sensors[0][0]:'';}

export class F1PaddockCard extends HTMLElement {
  get _language(){return resolveLanguage(this._config,this._hass);}
  _t(text){return translate(this._language,text);}
  constructor(){super();this.attachShadow({mode:'open'});this._session='RAC';this._expanded=new Set();this._scroll=new Map();
    this.shadowRoot.addEventListener('click',ev=>this._click(ev));
    this.shadowRoot.addEventListener('change',ev=>this._change(ev));
    this.shadowRoot.addEventListener('error',ev=>{if(ev.target.tagName==='IMG'){const image=ev.target;if(image.classList.contains('road-car')){this._failedRoadImages??=new Set();this._failedRoadImages.add(image.getAttribute('src'));}image.hidden=true;if(image.nextElementSibling?.classList.contains('initials'))image.nextElementSibling.hidden=false;else{const p=document.createElement('p');p.className='muted';p.textContent=this._t("Imagen no disponible en la fuente");image.after(p);}}},true);
  }
  setConfig(config){if(!config.entity)throw new Error(this._t("Selecciona el sensor Dashboard de F1 Paddock"));this._config={card_type:'dashboard',table_height:430,language:"auto",...config};if(!['dashboard',...Object.keys(BLOCKS)].includes(this._config.card_type))this._config.card_type='timing';this.render();}
  set hass(hass){this._hass=hass;if(!this._config)return;const entity=hass.states[this._config.entity];const f=this._config.favorite_entity||entity?.attributes?.favorite_entity;const r=this._config.round_entity||entity?.attributes?.round_entity;const refs=[this._language,entity,hass.states[f],hass.states[r],hass.states[entity?.attributes?.season_entity]];if(this._refs&&refs.every((v,i)=>v===this._refs[i]))return;this._refs=refs;this.render();}
  connectedCallback(){if(!this._clock)this._clock=setInterval(()=>{if(this.shadowRoot.activeElement?.tagName!=='SELECT'&&!this.shadowRoot.querySelector('dialog[open]'))this.render();},10000);}
  disconnectedCallback(){clearInterval(this._clock);this._clock=null;}
  getCardSize(){return this._config?.card_type==='dashboard'?18:6;}
  getGridOptions(){return {columns:12,rows:'auto',min_columns:6};}
  static getConfigElement(){return document.createElement('f1-paddock-card-editor');}
  static getStubConfig(hass){return {entity:onlyDashboard(hass),card_type:'dashboard',table_height:430};}
  _card(key,content,kicker){if(this._data?.warnings?.length||this._entity?.state==='unavailable')content+=`<p class="tiny muted" role="status">${this._t(this._data?.warnings?.includes('calendar:backup')?"Calendario de respaldo: FastF1. Algunos resultados pueden no estar disponibles.":"Información parcial: se conservan las últimas lecturas disponibles.")}</p>`;return `<ha-card class="panel ${key}"><div class="kicker">${e(kicker||'F1 PADDOCK')}</div><h2>${e(this._t(BLOCKS[key]||key))}</h2>${content}</ha-card>`;}
  _picker(attribute,label){const id=this._config[attribute]||this._entity?.attributes?.[attribute],s=this._hass?.states[id];
    if(!id||!s)return `<span class="muted">${e(label)}: ${this._t("selector no disponible")}</span>`;
    return `<label class="picker">${e(label)}<select data-entity="${e(id)}" aria-label="${e(label)}">${(s.attributes.options||[]).map(x=>`<option value="${e(x)}"${x===s.state?' selected':''}>${e(x==='current'?this._t("Temporada actual (automática)"):x)}</option>`).join('')}</select></label>`;
  }
  _next(){const s=this._data,n=nextSession(s);const updated=Date.parse(s.updated_at),age=Date.now()-updated;const warning=this._entity.state==='unavailable'||!Number.isFinite(age)||age>900000||s.warnings?.length;
    return `<ha-card class="hero"><div><div class="kicker">${this._t("CAMPEONATO DEL MUNDO")} · ${val(s.season)}</div><h1 aria-label="F1 Paddock">${safeAsset(s.logo)?`<img class="f1-logo" src="${e(safeAsset(s.logo))}" alt="${this._t("F1 · logotipo oficial")}">`:'F1'} <small>Paddock</small></h1><span class="badge">${warning?this._t("Datos pendientes de actualizar"):this._t("Resultados publicados")}</span></div><div><div class="kicker">${n?this._t('PRÓXIMA SESIÓN')+' · '+e(this._t(n.name)):s.event?this._t("PROGRAMA DEL GRAN PREMIO"):this._t("TEMPORADA FINALIZADA")}</div><div class="count">${n?e(countdown(n.start,Date.now(),this._language)):s.event?this._t("Consulta los horarios"):this._t("Hasta la próxima temporada")}</div><div>${e(s.event?.name||'')}</div><p class="muted">${n?e(dateText(n.start,true,this._language)):this._t("Hora local de tu dispositivo")}</p></div><div>${this._entity?.attributes?.season_entity?this._picker('season_entity',this._t("Temporada")):''}${this._picker('favorite_entity',this._t("Tu piloto"))}</div><div class="health">${warning?this._t("● Información parcial o antigua"):this._t("● Última consulta")} · ${e(dateText(s.updated_at,true,this._language))}<span>${e(this._t(PHASE[timingPhase(s.timing)]||PHASE.waiting))} · F1 Timing · ${this._t("Neumáticos y contador de paradas. Tiempos de boxes publicados: OpenF1.")}</span></div></ha-card>`;
  }
  _circuit(){const c=this._data.event;
    if(!c)return this._card('circuit',`<p>${this._t("Temporada finalizada. Consulta los circuitos en el calendario.")}</p>`,this._t("EL GRAN PREMIO"));
    const url=safeAsset(c.map);return this._card('circuit',`<h3>${e(c.circuit)}</h3><p class="muted">${this._t("Ronda")} ${val(c.round)} · ${e(c.name)}</p><p>${e(c.city)} · ${e(c.country)}</p>${url?`<button class="map" data-action="map" aria-label="${this._t("Ampliar plano del circuito")}"><img src="${e(url)}" alt="${this._t("Plano detallado de")} ${e(c.circuit)}, ${this._t("con las zonas señaladas por F1")}"><span>${this._t("Ampliar plano ⤢")}</span></button><p class="muted tiny">${this._t("Plano F1")} · ${val(c.season)} · ${this._t("Curvas, sectores y zonas según el gráfico original.")}</p>`:`<p class="empty">${this._t("Plano de esta temporada aún no verificado.")}</p>`}`,this._t("EL GRAN PREMIO"));
  }
  _programme(){const ss=this._data.event?.sessions||[],next=nextSession(this._data);let last='';
    const rows=ss.map(s=>{const day=dateText(s.start||s.date,false,this._language),head=day!==last?`<tr class="day"><th colspan="2">${e(day)}</th></tr>`:'';last=day;
      return `${head}<tr><td>${e(this._t(s.name))} ${s===next?`<span class="badge accent">${this._t("Siguiente")}</span>`:''}</td><td>${s.start?e(new Date(s.start).toLocaleTimeString(this._language,{hour:'2-digit',minute:'2-digit'})):this._t("Por confirmar")}</td></tr>`;}).join('');
    return this._card('programme',`<p class="muted">${this._t("Hora local de tu dispositivo")}</p><div class="table-wrap" data-scroll="programme"><table><thead><tr><th>${this._t("Sesión")}</th><th>${this._t("Hora")}</th></tr></thead><tbody>${rows||`<tr><td>${this._t("Programa no disponible")}</td></tr>`}</tbody></table></div>`,this._t("ENTRENAMIENTOS · CLASIFICACIÓN · CARRERA"));
  }
  _driver(){const d=this._favorite;
    if(!d)return this._card('driver',`<p class="empty">${this._t("El piloto guardado no aparece en la clasificación disponible. Puedes elegir otro.")}</p>${this._picker('favorite_entity',this._t("Tu piloto"))}`,this._t("PILOTO SELECCIONADO"));
    const last=this._data.last_race,r=last?.rows?.find(r=>r.id===d.id);
    return this._card('driver',`<div class="driver-head">${photo(d,'large',this._language)}<div>${numberGraphic(d,this._language)}<h3>${e(d.name)}</h3><p class="muted">${e(d.team)}</p><div class="stats"><div><b>${val(d.position)}${this._language==='es'?'º':''}</b><span>${this._t("Mundial")}</span></div><div><b>${val(d.points)}</b><span>${this._t("Puntos")}</span></div></div></div></div><div class="result-summary"><div class="kicker">${this._t("ÚLTIMA CARRERA PUBLICADA")}</div><h3>${r?'P'+val(r.position):this._t("Sin resultado publicado")}</h3><p>${e(last?.event?.name||'')} · ${e(dateText(last?.date,false,this._language))}</p>${r?`<div class="stats"><div><b>${val(r.points)}</b><span>${this._t("Puntos")}</span></div><div><b>${val(r.laps)}</b><span>${this._t("Vueltas")}</span></div><div><b>${val(r.time)}</b><span>${this._t("Tiempo / diferencia")}</span></div></div><p class="muted">${e(this._t(STATUS[r.status]||r.status)||this._t("Estado no publicado"))}</p>`:''}</div>`,this._t('TU PILOTO')+' · '+(d.number??'—'));
  }
  _podium(){const r=this._data.last_race,rows=r?.rows||[];const winners=[2,1,3].map(p=>rows.find(d=>d.position===p));
    return this._card('podium',`<p class="muted">${e(r?.event?.name||this._t("Resultados todavía no publicados"))} · ${e(dateText(r?.date,false,this._language))}</p><div class="podium-grid">${winners.map((d,i)=>d?`<div class="podium-place place-${[2,1,3][i]}">${photo(d,'',this._language)}<div class="plinth"><b>${val(d.position)}</b>${numberGraphic(d,this._language)}<strong>${e(d.name)}</strong><span>${e(d.team)}</span><span>${val(d.time)}</span></div></div>`:`<div class="empty">${this._t("Pendiente")}</div>`).join('')}</div>`,this._t("CARRERA · RESULTADO PUBLICADO"));
  }
  _identity(d){return `<div class="identity">${photo(d,'small',this._language)}<div><strong>${e(d.name)}</strong>${d.id&&d.id===this._favorite?.id?`<span class="your-driver">${this._t("Tu piloto")}</span>`:''}<small>${e(d.team||'')} · ${d.number!==null&&d.number!==undefined?'#'+val(d.number):e(d.code||'')}</small></div></div>`;}
  _table(key,headers,rows,favorite=true){const expanded=this._expanded.has(key);
    return `<div class="table-actions">${favorite?`<button data-action="favorite-row">${this._t("Ir a mi piloto")}</button>`:''}<button data-action="expand" data-key="${e(key)}">${expanded?this._t("Vista compacta"):this._t("Todas las columnas ↔")}</button></div><div class="table-wrap ${expanded?'expanded':''}" role="region" aria-label="${e(this._t(BLOCKS[key]||'Resultados de la sesión'))}" tabindex="0" data-scroll="${e(key)}"><table><thead><tr>${headers.map(h=>`<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${headers.length}">${this._t("Datos todavía no publicados.")}</td></tr>`}</tbody></table></div>`;
  }
  _row(d,cells){return `<tr${d.id&&d.id===this._favorite?.id?' class="favorite-row" aria-current="true"':''}>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`;}
  _standings(){return this._card('standings',`<p class="muted">${this._t("Temporada")} ${val(this._data.season)} · ${this._t("Después de la ronda")} ${val(this._data.standings_round)}</p>${this._table('standings',['P',this._t("Piloto"),'Pts',this._t("Al líder"),this._t("Victorias")],(this._data.standings||[]).map(d=>this._row(d,[val(d.position),this._identity(d),val(d.points),val(d.deficit),val(d.wins)])))}`,this._t("TEMPORADA ACTUAL"));}
  _constructors(){return this._card('constructors',this._table('constructors',['P',this._t("Equipo"),this._t("Puntos"),this._t("Victorias")],(this._data.constructors||[]).map(d=>this._row(d,[val(d.position),e(d.name),val(d.points),val(d.wins)])),false),this._t("CAMPEONATO DE EQUIPOS"));}
  _results(){const r=this._data.results?.find(r=>r.code===this._session),gp=this._data.calendar?.find(c=>c.round===this._data.result_round);const selector=this._config.round_entity||this._entity.attributes.round_entity;const selected=this._hass.states[selector]?.state;const pending=selected&&selected!==`R${gp?.round} · ${gp?.name}`;const rows=r?.rows||[],qual=this._session==='QUAL';
    return this._card('results',`${this._picker('round_entity',this._t("Gran premio"))}<label class="picker">${this._t("Sesión")}<select data-action="session" aria-label="${this._t("Sesión")}">${Object.entries(SESSION_NAMES).map(([k,v])=>`<option value="${k}"${k===this._session?' selected':''}>${e(this._t(v))}</option>`).join('')}</select></label><h3>${e(gp?.name||'')}</h3><p class="muted">${e(this._t(SESSION_NAMES[this._session]))} · ${this._t("GP del")} ${e(dateText(gp?.date,false,this._language))}</p>${pending?`<p class="empty">${this._t("Cargando el gran premio seleccionado…")}</p>`:!r?.available?`<p class="empty">${this._t("Sin clasificación publicada para esta sesión y gran premio.")}</p>`:this._table('results',qual?['P',this._t("Piloto"),'Q1','Q2','Q3']:['P',this._t("Piloto"),this._t("Tiempo / diferencia"),'Pts',this._t("Parrilla"),this._t("Vueltas"),this._t("Estado")],rows.map(d=>this._row(d,qual?[val(d.position),this._identity(d),val(d.q1),val(d.q2),val(d.q3)]:[val(d.position),this._identity(d),val(d.time),val(d.points),val(d.grid),val(d.laps),e(this._t(STATUS[d.status]||d.status||'—'))])))}<p class="tiny muted">${this._t("Carrera, clasificación y sprint cuando estén publicados. Los tiempos y neumáticos de la última sesión recibida se muestran en el centro de sesión.")}</p>`,this._t("CLASIFICACIONES PUBLICADAS"));
  }
  _freshness(){const t=this._data.timing||{},phase=timingPhase(t),source=t.source_time,received=t.timing_received_at;
    return `<div class="freshness ${phase}"><span class="feed-age">${phase==='live'?'● ':phase==='stale'?'◷ ':''}${this._t("Datos F1:")} <time datetime="${e(source||'')}">${e(timeStamp(source,this._language))}</time> · ${e(ageText(source,Date.now(),this._language))}</span><span>${this._t("Recibidos en HA:")} ${e(timeStamp(received,this._language))}${received?' · '+e(ageText(received,Date.now(),this._language)):''}</span></div>`;
  }
  _sessionNote(){const t=this._data.timing||{},phase=timingPhase(t);return `<div class="session-note"><span class="badge">${e(this._t(PHASE[phase]))}</span><p>${e(t.event||this._t("Sesión todavía no recibida"))} · ${e(this._t(t.name||''))}<br>${e(dateText(t.start,true,this._language))}</p>${this._freshness()}</div>`;}
  _timeCell(value,mark){const meta=lapSeconds(value)!==null?TIME_MARKS[mark]:null;return meta?`<span class="lap-time ${mark}" title="${e(this._t(meta[1]))}" aria-label="${e(value+' · '+this._t(meta[1]))}"><span aria-hidden="true">${meta[0]}</span> ${val(value)}</span>`:val(value);}
  _timing(){const t=this._data.timing||{},rows=t.rows||[];const bests=rows.map(d=>lapSeconds(d.best_lap)).filter(x=>x!==null),best=bests.length?Math.min(...bests):null;
    return this._card('timing',`${this._sessionNote()}${t.reported_lap!==null&&t.reported_lap!==undefined?`<p class="muted">${this._t("Vuelta publicada")} ${val(t.reported_lap)} / ${val(t.total_laps)}</p>`:''}<div class="time-legend"><span class="overall">◆ ${this._t("Mejor de sesión")}</span><span class="personal">↑ ${this._t("Mejora personal")}</span><span class="regular">• ${this._t("Sin mejora personal")}</span></div>${this._table('timing',['P',this._t("Piloto"),this._t("Al líder"),this._t("Intervalo"),this._t("Última vuelta"),this._t("Mejor vuelta"),'S1','S2','S3',this._t("Vueltas"),this._t("Neumático"),this._t("Paradas")],rows.map(d=>this._row(d,[val(d.position),this._identity(d),val(this._t(d.gap)),val(d.interval),this._timeCell(d.last_lap,d.last_lap_mark),this._timeCell(d.best_lap,best!==null&&lapSeconds(d.best_lap)===best?'overall':null),...[0,1,2].map(i=>this._timeCell(d.sectors?.[i],d.sector_marks?.[i])),val(d.laps),tyreBadge(d.tyre,this._language),val(d.pit_count)])))}<p class="tiny muted">${this._t("Colores de última vuelta y sectores según las marcas de F1; el mínimo de mejores vueltas publicadas se destaca en morado. Sin marca, el tiempo queda neutro.")}</p>`,this._t("CENTRO DE SESIÓN"));}

  _tyres(){const rows=this._data.timing?.rows||[];return this._card('tyres',`${this._sessionNote()}${this._table('tyres',['P',this._t("Piloto"),this._t("Compuesto"),this._t("Vueltas publicadas"),this._t("Juego"),this._t("Tandas")],rows.map(d=>this._row(d,[val(d.position),this._identity(d),tyreBadge(d.tyre,this._language),val(d.tyre?.age),d.tyre?.new===true?this._t("Nuevo"):d.tyre?.new===false?this._t("Usado"):'—',(d.stints||[]).map(s=>`<span class="stint">${tyreBadge(s,this._language)}<br>${val(s.age)} ${this._t("vueltas")}</span>`).join('')||'—'])))}<p class="tiny muted">${this._t("Compuestos y tandas publicados por F1. No se deduce desgaste ni se cuenta una parada por cada cambio de tanda.")}</p>`,this._t("ESTRATEGIA · DATOS PUBLICADOS"));}
  _pits(){const t=this._data.timing||{},rows=t.rows||[];const seconds=x=>typeof x==='number'&&Number.isFinite(x)?e(x.toFixed(3))+' s':'—';return this._card('pits',`${this._sessionNote()}${this._table('pit-counts',['P',this._t("Piloto"),this._t("Paradas"),this._t("Estado")],rows.map(d=>this._row(d,[val(d.position),this._identity(d),val(d.pit_count),d.in_pit?this._t("En boxes"):d.retired?this._t("Retirado"):'—'])))}<h3 style="margin-top:20px">${this._t("Tiempos de boxes publicados")}</h3><p class="session-note">${this._t("El contador se recibe del directo público. Los tiempos detallados se consultan después de la sesión; no están disponibles en directo sin acceso adicional.")}</p>${this._table('pits',[this._t("Piloto"),this._t("Vuelta"),this._t("Detenido"),'Pit lane'],(t.pits||[]).map(p=>{const d=rows.find(d=>d.number===p.number)||{name:'#'+p.number};return this._row(d,[this._identity(d),val(p.lap),seconds(p.stop_seconds),seconds(p.lane_seconds)]);}))}<p class="tiny muted">${this._t("OpenF1 · «Detenido» y «Pit lane» son medidas distintas. Un guion no equivale a cero.")}${t.pits_error?' '+this._t('Historial de boxes temporalmente no disponible.'):''}</p>`,this._t("BOXES · CONTADOR Y TIEMPOS"));}
  _road(){
    const timing=this._data.timing||{},phase=timingPhase(timing);
    const rows=(timing.rows||[]).filter(d=>Number.isInteger(d.position)&&d.position>0);
    const rank=new Map([...rows].sort((a,b)=>a.position-b.position).map((d,i)=>[String(d.id||d.number),i]));
    const selected=rows.find(d=>String(d.id||d.number)===this._roadSelected)||rows.find(d=>d.id===this._favorite?.id)||rows.find(d=>d.position===1)||rows[0];
    const markers=[...rows].sort((a,b)=>String(a.id||a.number).localeCompare(String(b.id||b.number))).map(d=>{
      const key=String(d.id||d.number),favorite=key===String(this._favorite?.id);
      const place=rank.get(key),lane=place%2,columns=Math.ceil(rows.length/2);
      const interval=/^\+?\d+(?:\.\d+)?$/.test(String(d.interval??''))?Number(d.interval):null;
      const retreat=interval===null||d.position===1?0:Math.min(38,Math.log1p(interval)*22);
      const x=182+(columns-1-Math.floor(place/2))*280-lane*140-retreat,y=lane*104;
      const colorSource=d.team_color||{'Mercedes':'27F4D2','Ferrari':'E8002D','McLaren':'FF8000','Aston Martin':'229971','Red Bull':'3671C6','Red Bull Racing':'3671C6','Alpine':'FF87BC','Racing Bulls':'6692FF','Williams':'64C4FF','Haas F1 Team':'B6BABD','Audi':'F50537','Cadillac':'9098A2'}[d.team];
      const color=/^#?[0-9a-f]{6}$/i.test(colorSource||'')?'#'+colorSource.replace('#',''):'#8da7bf';
      const candidate=teamCarImage(this._data.season,d.team),car=candidate&&!this._failedRoadImages?.has(candidate.url)?candidate:null;
      const status=d.retired?this._t("Retirado"):d.in_pit?this._t("En boxes"):'';
      return `<div class="road-marker${favorite?' road-favorite':''}${selected===d?' road-selected':''}" data-road-driver="${e(key)}"${favorite?' aria-current="true"':''} style="transform:translate(${x}px,${y}px);--car-color:${color}"><button class="road-pick" data-action="road-driver" data-driver="${e(key)}" aria-pressed="${selected===d}" aria-label="P${val(d.position)} · ${e(d.name)}" title="${e(d.name)} · ${this._t('Al anterior')}: ${val(d.interval)} · ${this._t('Al líder')}: ${val(d.gap)}${status?' · '+e(status):''}"><span class="road-rank">P${val(d.position)} · ${e(d.code||d.name)} · #${val(d.number)}${favorite?' ★':''}</span>${car?`<img class="road-car" src="${e(safeAsset(car.url))}" alt="${e(car.team)} · ${this._t('Monoplaza oficial')} 2026" loading="lazy" decoding="async" referrerpolicy="no-referrer"><span class="road-car road-missing initials" hidden>#${val(d.number)}</span>`:`<span class="road-car road-missing initials">#${val(d.number)}</span>`}</button></div>`;
    }).join('');
    const detail=selected?`<div class="road-detail" role="region" aria-label="${this._t('Datos del piloto')}"><div class="road-person"><strong>${e(selected.name)}${selected.id===this._favorite?.id?` <span class="your-driver">${this._t('Tu piloto')}</span>`:''}</strong><small>${e(selected.team||'')} · #${val(selected.number)}${selected.retired?' · '+this._t('Retirado'):selected.in_pit?' · '+this._t('En boxes'):''}</small></div><div><small>${this._t('Posición')}</small><b>P${val(selected.position)}</b></div><div><small>${this._t('Al anterior')}</small><b>${selected.position===1?this._t('Líder'):val(selected.interval)}</b></div><div><small>${this._t('Al líder')}</small><b>${selected.position===1?'—':val(selected.gap)}</b></div><div><small>${this._t('Neumático')}</small>${tyreBadge(selected.tyre,this._language)}</div><div><small>${this._t('Paradas')}</small><b>${val(selected.pit_count)}</b></div></div>`:'';
    return this._card('road',`${this._sessionNote()}<div class="road-actions"><button data-action="road-favorite">${this._t("Ir a mi piloto")}</button><span class="tiny muted">${this._t('Pulsa un coche para ver sus datos.')}</span></div>${rows.length?`<div class="road-scroll" data-scroll="road" role="region" tabindex="0" aria-label="${this._t("Carretera de posiciones")}"><div class="road-strip ${phase==='live'?'road-live':''}" style="width:${Math.max(600,Math.ceil(rows.length/2)*280+182)}px">${markers}</div></div>`:`<p class="empty">${this._t("Sin posiciones publicadas para esta sesión.")}</p>`}${detail}<p class="tiny muted">${this._t("Vista esquemática del orden; separación visual no proporcional al tiempo ni a la distancia real.")} · <a style="color:inherit" href="https://www.formula1.com/en/teams" target="_blank" rel="noopener noreferrer">${this._t('Imágenes de referencia de los equipos')} · Formula1.com</a></p>`,this._t("ORDEN E INTERVALOS"));
  }
  _calendar(){return this._card('calendar',this._table('calendar',['R',this._t("Gran premio"),this._t("Carrera")],(this._data.calendar||[]).map(d=>`<tr${d.id===this._data.event?.id?' class="upcoming" aria-current="true"':''}><td>${val(d.round)}</td><td>${e(d.name)}${d.id===this._data.event?.id?`<span class="next-gp-badge">🏁 ${this._t("PRÓXIMO GP")}</span>`:''}</td><td>${e(dateText(d.start||d.date,true,this._language))}</td></tr>`),false),this._t("TODOS LOS GRANDES PREMIOS"));}
  render(){if(!this._config||!this._hass)return;
    if(this.shadowRoot.querySelector('dialog[open]'))return;
    this._entity=this._hass.states[this._config.entity];this._data=this._entity?.attributes?.snapshot;
    const seasonChoice=this._hass.states[this._entity?.attributes?.season_entity]?.state;
    const requestedSeason=seasonChoice==='current'?new Date().getFullYear():Number(seasonChoice);
    if(this._data&&Number.isFinite(requestedSeason)&&requestedSeason>0&&requestedSeason!==this._data.season){
      this._patch(`<ha-card style="padding:24px">${this._picker('season_entity',this._t("Temporada"))}<p role="status">${this._t(this._entity.state==='unavailable'?"No se pudo cargar la temporada. Puedes elegir otra o volver a intentarlo.":"Cargando la temporada seleccionada…")}</p></ha-card>`);return;
    }
    if(!this._data){this._patch(`<ha-card style="padding:24px">${this._t("F1 Paddock · Selecciona el sensor Dashboard de la integración. Datos todavía no disponibles.")}</ha-card>`);return;}
    this._favorite=this._data.drivers?.find(d=>d.id===this._entity.attributes.favorite_id);
    for(const x of this.shadowRoot.querySelectorAll('[data-scroll]'))this._scroll.set(x.dataset.scroll,[x.scrollLeft,x.scrollTop]);
    const methods={road:()=>this._road(),next:()=>this._next(),circuit:()=>this._circuit(),programme:()=>this._programme(),driver:()=>this._driver(),podium:()=>this._podium(),standings:()=>this._standings(),constructors:()=>this._constructors(),results:()=>this._results(),calendar:()=>this._calendar(),timing:()=>this._timing(),tyres:()=>this._tyres(),pits:()=>this._pits()};
    const kind=this._config.card_type,whole=kind==='dashboard';const body=whole?`${this._next()}${this._road()}<div class="columns"><div>${this._circuit()}${this._programme()}${this._results()}</div><div>${this._driver()}${this._timing()}${this._tyres()}${this._standings()}</div><div>${this._podium()}${this._pits()}${this._constructors()}${this._calendar()}</div></div>`:(methods[kind]?.()||`<p>${this._t("Tarjeta desconocida")}</p>`);
    // Chromium registers font faces in the document, not inside shadow roots.
    const font=safeAsset(this._data.font);
    if(font==='/f1_paddock_font/Formula1-Bold.woff'&&!document.getElementById('f1-paddock-font-face')){
      const style=document.createElement('style');style.id='f1-paddock-font-face';
      style.textContent=`@font-face{font-family:F1Paddock;src:url("${font}") format("woff");font-display:swap}`;
      document.head.append(style);
    }
    this._patch(`<style>${this._styles()}</style><div class="root" lang="${this._language}">${body}</div>`);
    for(const x of this.shadowRoot.querySelectorAll('[data-scroll]')){const p=this._scroll.get(x.dataset.scroll);if(p){x.scrollLeft=p[0];x.scrollTop=p[1];}}
  }
  _patch(html){const template=document.createElement('template');template.innerHTML=html;patchDOM(this.shadowRoot,template.content);}
  async _change(ev){const t=ev.target;if(t.dataset.action==='session'){this._session=t.value;this.render();return;}
    if(t.dataset.entity){t.disabled=true;try{await this._hass.callService('select','select_option',{entity_id:t.dataset.entity,option:t.value});}catch{t.disabled=false;const p=document.createElement('p');p.textContent=this._t("No se pudo guardar la selección. Inténtalo de nuevo.");p.setAttribute('role','alert');t.after(p);}}
  }
  _click(ev){const b=ev.target.closest('button');if(!b)return;
    if(b.dataset.action==='road-driver'){this._roadSelected=b.dataset.driver;this.render();return;}
    if(b.dataset.action==='road-favorite'){this._roadSelected=this._favorite?.id;this.render();const marker=this.shadowRoot.querySelector('.road-favorite'),wrap=this.shadowRoot.querySelector('.road-scroll');if(marker&&wrap)wrap.scrollTo({left:wrap.scrollLeft+marker.getBoundingClientRect().left-wrap.getBoundingClientRect().left-wrap.clientWidth/2+marker.clientWidth/2,behavior:'smooth'});}
    if(b.dataset.action==='expand'){const key=b.dataset.key;this._expanded.has(key)?this._expanded.delete(key):this._expanded.add(key);this.render();}
    if(b.dataset.action==='favorite-row'){const wrap=b.closest('.table-actions')?.nextElementSibling;const row=wrap?.querySelector('.favorite-row');row?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});}
    if(b.dataset.action==='map'){const url=safeAsset(this._data.event?.map);if(!url)return;const dialog=document.createElement('dialog');dialog.innerHTML=`<button class="close" aria-label="${this._t("Cerrar plano")}">${this._t("Cerrar ✕")}</button><h2>${e(this._data.event.circuit)}</h2><img src="${e(url)}" alt="${this._t("Plano detallado del circuito")}"><p>${this._t("Plano original F1")} · ${val(this._data.season)}</p>`;this.shadowRoot.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{dialog.remove();this.render();});dialog.showModal();}
  }
  _styles(){const h=Math.min(1000,Math.max(200,Number(this._config.table_height)||430)),font=safeAsset(this._data.font);
    return `${font?`@font-face{font-family:F1Paddock;src:url("${e(font)}") format("woff");font-display:swap}`:''}
    .calendar tr.upcoming td{background:#ff627922;border-top:1px solid #ff627966;border-bottom:1px solid #ff627966;color:#fff;font-weight:700}.calendar tr.upcoming td:first-child{border-left:4px solid var(--accent);color:#ffadba}.calendar .next-gp-badge{display:table;margin-top:7px;padding:5px 9px;border-radius:6px;background:var(--accent);color:#171c26;font-size:10px;font-weight:900;letter-spacing:.7px;line-height:1.3;white-space:nowrap}.road .session-note{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px}.road .session-note>p{margin:0}.road .freshness{width:100%;display:flex;flex-wrap:wrap;gap:0 14px;min-height:0;padding:6px 10px;margin:2px 0 8px}.road-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.road-scroll{direction:rtl;overflow-x:auto;scrollbar-color:#657587 #17212c;touch-action:pan-x pan-y;margin:12px 0 14px}.road-strip{direction:ltr;height:236px;position:relative;background:linear-gradient(transparent 8px,#8995a0 8px,#8995a0 11px,#273039 11px,#273039 222px,#8995a0 222px,#8995a0 225px,transparent 225px)}.road-strip:before{content:"";position:absolute;left:0;right:0;top:118px;height:2px;background:repeating-linear-gradient(90deg,#ffffff55 0 28px,transparent 28px 52px)}.road-marker{position:absolute;left:0;top:14px;width:228px;text-align:center;font-size:11px;font-variant-numeric:tabular-nums}.road-live .road-marker{transition:transform 1.6s ease-in-out}.road-pick{display:block;width:228px;min-height:0;border:0;border-radius:12px;padding:0;background:none;color:inherit;cursor:pointer}.road-pick:hover{background:#ffffff0a}.road-pick:focus-visible{outline:2px solid #a8d6ff;outline-offset:2px}.road-rank{display:inline-block;font-weight:800;font-size:11px;line-height:18px;padding:0 7px;margin-bottom:3px;border-radius:5px;background:#101820bb;color:#e8eff8}.road-car{display:block;width:228px;height:72px;object-fit:contain;margin:0}.road-missing{display:flex;align-items:center;justify-content:center;background:#ffffff05;border:1px dashed #ffffff33;border-radius:8px;color:var(--muted);font-size:24px}.road-selected .road-rank{background:#38536d;color:white;box-shadow:0 0 0 1px #a8d6ff77}.road-favorite .road-rank{color:#ffd1dc}.road-favorite .road-car{filter:drop-shadow(0 0 6px #ff6279)}.road-detail{display:flex;align-items:center;gap:12px 24px;flex-wrap:wrap;border:1px solid #ffffff1c;border-radius:12px;background:#0c172044;padding:12px 14px;margin-bottom:12px;min-height:78px}.road-detail>div{display:flex;flex-direction:column;gap:5px}.road-detail .road-person{flex:1 1 190px}.road-detail small{color:var(--muted);font-size:10px}.road-detail b{font-size:15px;font-variant-numeric:tabular-nums}.road-detail strong{font-size:14px}.road .tiny{margin-bottom:0}@media(prefers-reduced-motion:reduce){.road-live .road-marker{transition:none}}:host{display:block;color:#edf2fa;font-family:var(--primary-font-family,Arial,sans-serif);--muted:#a2b4c8;--accent:#ff6279;font-size:13px}*{box-sizing:border-box}[hidden]{display:none!important}.root{width:100%}ha-card{display:block;color:inherit;border:1px solid #ffffff12;border-radius:22px;background:linear-gradient(135deg,#20232d,#142630);box-shadow:none;overflow:hidden}.panel{padding:22px;margin-bottom:20px}.kicker{font-size:9px;letter-spacing:1.4px;font-weight:700;color:var(--muted);line-height:1.6}h1,h2,h3,p{margin:0 0 14px}h1,h2,.count,.number{font-family:F1Paddock,Arial,sans-serif}h1{font-size:44px;margin-top:12px}h1{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.f1-logo{width:155px;height:auto;max-height:50px;object-fit:contain}h1 small{font-family:F1Paddock,Arial,sans-serif;font-size:22px;font-weight:700;font-style:italic;letter-spacing:.025em;line-height:1.2}h2{font-size:18px;line-height:1.5;margin-top:8px}h3{font-size:19px;line-height:1.5}.muted{color:var(--muted);line-height:1.6}.tiny{font-size:10px;margin:12px 0 0}.hero{padding:28px;background:linear-gradient(110deg,#482635,#20232d 50%,#132c38);display:grid;grid-template-columns:1.1fr 1.1fr 1fr;gap:24px;margin-bottom:24px;align-items:center}.count{font-size:24px;color:#ffc191;margin:14px 0}.badge{display:inline-block;border:1px solid #ffffff20;border-radius:20px;padding:6px 10px;font-size:10px;font-family:Arial,sans-serif}.accent{padding:3px 6px;color:#ffc191}.health{grid-column:1/-1;border:1px solid #ffffff12;padding:12px;border-radius:12px;font-size:11px;color:#a9d5c6;line-height:1.7}.health span{display:block;color:var(--muted)}.columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.columns>div{min-width:0}.picker{display:block;font-size:11px;color:var(--muted);margin-bottom:14px}select{display:block;width:100%;padding:12px;margin-top:6px;background:#1b2b37;color:#edf2fa;border:1px solid #ffffff24;border-radius:9px;font:inherit;min-height:44px}button{font:inherit;cursor:pointer;color:#dbe7f5;background:#ffffff06;border:1px solid #ffffff24;border-radius:9px;padding:9px 11px;min-height:38px}button:hover{border-color:#ff6279}button:focus-visible,select:focus-visible,.table-wrap:focus-visible{outline:2px solid #82bafa;outline-offset:2px}.map{padding:10px;width:100%;background:#111820;position:relative}.map img{width:100%;display:block;min-height:160px;object-fit:contain}.map span{display:block;text-align:right;color:#c0cddd;font-size:11px;padding-top:8px}.driver{background:linear-gradient(135deg,#412735,#172a35)}.driver-head{display:grid;grid-template-columns:42% 1fr;gap:15px;align-items:center}.portrait{object-fit:contain;width:100%;display:block}.portrait.large{height:210px;object-fit:cover;object-position:top}.number{font-size:38px;color:var(--accent);margin-bottom:14px}.number-art{display:block;width:105px;height:65px;object-fit:contain;object-position:left center}.plinth .number-art{width:100%;height:36px;object-position:center}.stats{display:flex;gap:20px;flex-wrap:wrap;margin-top:12px}.stats b{font-size:21px;display:block;color:#ff788c}.stats span{display:block;font-size:10px;color:var(--muted);margin-top:6px}.result-summary{margin-top:16px;padding:16px;border:1px solid #ffffff13;border-radius:12px}.result-summary h3{font-size:29px;margin-top:8px;color:#ff788c}.result-summary p{font-size:11px;margin-bottom:6px}.initials{display:flex;align-items:center;justify-content:center;font-size:25px;background:#ffffff08;border-radius:12px;min-height:80px}.initials.large{height:210px}.podium-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;align-items:end;margin-top:20px}.podium-place .portrait{height:135px;object-fit:cover;object-position:top}.podium-place.place-1 .portrait{height:165px}.plinth{background:#ffffff06;padding:12px 5px;border:1px solid #ffffff13;border-radius:12px;display:flex;flex-direction:column;text-align:center;gap:8px;min-height:165px}.place-1 .plinth{border-color:#cabb6544;background:#cabb650c;min-height:185px}.plinth>b{font-size:25px}.plinth .number{font-size:24px;margin:0}.plinth strong{font-size:12px;overflow-wrap:anywhere}.plinth span:not(.number){font-size:9px;color:var(--muted)}.tyre{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:3px solid var(--tyre-color);color:var(--tyre-color);border-radius:50%;font-size:11px;font-weight:800}.stint{display:inline-block;border:1px solid #ffffff18;border-radius:10px;padding:8px;margin:3px;font-size:10px}.session-note{line-height:1.7;color:#a6bacf;font-size:11px}.table-actions{display:flex;justify-content:space-between;gap:8px;margin:14px 0 10px}.table-actions button{font-size:10px}.table-wrap{max-height:${h}px;overflow:auto;overscroll-behavior:auto;touch-action:pan-x pan-y;scrollbar-color:#657587 #17212c;scrollbar-width:thin;border-radius:8px}table{width:100%;border-collapse:separate;border-spacing:0;font-size:11px;line-height:1.5}th,td{padding:11px 8px;text-align:left;border-bottom:1px solid #ffffff0c;vertical-align:middle;white-space:nowrap}thead th{position:sticky;top:0;z-index:2;background:#1b2b36;color:var(--muted);font-size:10px}td:first-child{font-weight:700}td:nth-child(2){white-space:normal;min-width:120px}table small{display:block;font-size:9px;color:var(--muted);margin-top:4px}.identity{display:flex;gap:8px;align-items:center;min-width:145px}.headshot{position:relative;display:block;overflow:hidden;width:48px;height:58px;flex:0 0 48px;border-radius:10px;background:#ffffff08}.identity .headshot .portrait.small{position:absolute;width:125px;max-width:none;height:auto;left:50%;top:0;transform:translateX(-50%)}.identity .initials{width:48px;min-height:58px;font-size:10px;flex-shrink:0}.identity strong{font-size:11px}.identity small{font-size:9px}.your-driver{display:inline-block;margin-left:5px;padding:2px 5px;border:1px solid #ff869a70;border-radius:5px;color:#ffd8df;background:#ff62791a;font-size:8px;font-weight:700;white-space:nowrap}.favorite-row>td{background:#ff62791c;border-bottom-color:#ff627936}.favorite-row .identity strong{color:#ffd8df}.favorite-row{background:#ff627912}.favorite-row td:first-child{border-left:2px solid #ff6279}.upcoming{background:#ff627915}.upcoming small{color:#ffc191}.expanded table{min-width:650px}.expanded th:nth-child(2),.expanded td:nth-child(2){position:sticky;left:30px;background:#182a35;z-index:1}.expanded th:first-child,.expanded td:first-child{position:sticky;left:0;min-width:30px;background:#182a35;z-index:1}.expanded thead th:first-child,.expanded thead th:nth-child(2){z-index:3}.expanded .favorite-row td:first-child,.expanded .favorite-row td:nth-child(2){background:#372632}.time-legend{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:10px;line-height:1.7;margin:12px 0}.lap-time{font-variant-numeric:tabular-nums;font-weight:700}.overall{color:#d6a1ff}.personal{color:#77dfad}.regular{color:#f6d365}.freshness{padding:10px 12px;border:1px solid #ffffff1c;border-radius:9px;margin:10px 0 14px;min-height:60px;font-variant-numeric:tabular-nums}.freshness>span{display:block}.freshness.live .feed-age{color:#77dfad}.freshness.stale .feed-age{color:#f6d365}.session-note>p{margin:8px 0}.day th{color:#ffc191;background:#ffffff04}.empty{padding:18px 0;color:var(--muted);line-height:1.7}dialog{width:min(1200px,95vw);max-height:90vh;background:#172430;color:#edf2fa;border:1px solid #ffffff33;border-radius:18px;padding:24px}dialog::backdrop{background:#000b}dialog img{display:block;width:100%;max-height:70vh;object-fit:contain}dialog .close{float:right}dialog p{color:var(--muted);font-size:11px;margin-top:12px}@media(max-width:1050px){.columns{grid-template-columns:repeat(2,minmax(0,1fr))}.columns>div:last-child{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}.hero{grid-template-columns:1fr 1fr}.hero>div:nth-child(3){grid-column:1/-1}}@media(max-width:650px){.hero{grid-template-columns:1fr;padding:20px;gap:18px}.hero>div:nth-child(3){grid-column:auto}.columns,.columns>div:last-child{display:block}.panel{padding:18px}.count{font-size:23px}.hero h1{font-size:38px}.driver-head{grid-template-columns:40% 1fr}.number{font-size:32px}.stats{gap:16px}h2{font-size:17px}}`;
  }
}

function editorConfig(config){
  const kind=Object.keys(BLOCKS).find(key=>config.type===`custom:f1-paddock-${key}-card`)||'dashboard';
  return {...config,card_type:config.card_type??kind};
}

export class F1PaddockEditor extends HTMLElement {
  get _language(){return resolveLanguage(this._config,this._hass);}
  _t(text){return translate(this._language,text);}
  constructor(){super();this.attachShadow({mode:'open'});this.shadowRoot.addEventListener('change',ev=>{const t=ev.target;if(!t.name)return;const value=t.name==='table_height'?Number(t.value):t.value;this._config={...this._config,[t.name]:value};this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true}));if(t.name==='language')this.render();});}
  setConfig(c){const next=editorConfig(c);const changed=JSON.stringify(next)!==JSON.stringify(this._config);this._config=next;if(changed)this.render();}
  _sensors(){return dashboardSensors(this._hass);}
  set hass(h){
    this._hass=h;
    // Sporting readings and unrelated HA states do not change the editor's controls.
    const signature=JSON.stringify([this._language,this._sensors().map(([id,s])=>[id,s.attributes.friendly_name||id])]);
    if(signature===this._editorSignature)return;
    this._editorSignature=signature;this.render();
  }
  render(){if(!this._config||!this._hass)return;const sensors=this._sensors();
    const automatic=!this._config.entity&&sensors.length===1;
    if(automatic)this._config={...this._config,entity:sensors[0][0]};
    const html=`<style>:host{display:block;min-width:0}*{box-sizing:border-box}label{display:block;min-width:0;margin:16px 0}select,input{display:block;width:100%;max-width:100%;padding:12px;margin-top:8px;background:var(--card-background-color,#202830);color:var(--primary-text-color,#fff);border:1px solid #888;border-radius:8px}input[type="number"]{width:120px}</style><label>${this._t("Sensor Dashboard")}<select name="entity"><option value="">${this._t("Selecciona el sensor")}</option>${sensors.map(([id,s])=>`<option value="${e(id)}"${id===this._config.entity?' selected':''}>${e(s.attributes.friendly_name||id)}</option>`).join('')}</select></label><label>${this._t("Idioma")}<select name="language">${[["auto",this._t("Automático")],["es","Español"],["en","English"]].map(([key,label])=>`<option value="${key}"${key===(this._config.language||"auto")?" selected":""}>${e(label)}</option>`).join("")}</select></label><label>${this._t("Contenido")}<select name="card_type">${Object.entries({dashboard:this._t("Panel completo"),...BLOCKS}).map(([key,name])=>`<option value="${key}"${key===(this._config.card_type||'dashboard')?' selected':''}>${e(this._t(name))}</option>`).join('')}</select></label><label>${this._t("Altura máxima de las tablas")}<input type="number" name="table_height" min="200" max="1000" value="${e(this._config.table_height||430)}"></label><p>${this._t("Los selectores de piloto y gran premio se detectan automáticamente. Diseño y visibilidad se ajustan desde Home Assistant.")}</p>`;
    const template=document.createElement('template');template.innerHTML=html;patchDOM(this.shadowRoot,template.content);
    if(automatic)this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this._config}},bubbles:true,composed:true}));
  }
}
if(!customElements.get('f1-paddock-card'))customElements.define('f1-paddock-card',F1PaddockCard);
if(!customElements.get('f1-paddock-card-editor'))customElements.define('f1-paddock-card-editor',F1PaddockEditor);
window.customCards=window.customCards||[];
const pickerLanguage=resolveLanguage(null,{language:document.documentElement.lang||globalThis.navigator?.language});
window.customCards.push({type:'f1-paddock-card',name:'F1 Paddock · '+translate(pickerLanguage,'Panel completo'),description:pickerLanguage==='es'?'Fórmula 1 con el estilo de MotoGP Paddock':'Formula 1 in the style of MotoGP Paddock',preview:true});
for(const [key,name] of Object.entries(BLOCKS)){
  const tag=`f1-paddock-${key}-card`;
  if(!customElements.get(tag))customElements.define(tag,class extends F1PaddockCard{setConfig(c){super.setConfig({card_type:key,...c});}static getStubConfig(hass){return {entity:onlyDashboard(hass),card_type:key};}});
  window.customCards.push({type:tag,name:'F1 Paddock · '+translate(pickerLanguage,name),description:translate(pickerLanguage,name)+(pickerLanguage==='es'?' · Tarjeta independiente':' · Independent card'),preview:true});
}
