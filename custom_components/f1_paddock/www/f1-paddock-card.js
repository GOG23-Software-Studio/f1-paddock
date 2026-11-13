/** F1 Paddock 0.1.0b6. HA provides data; cards never poll external providers. */
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
    const current=parent.childNodes[index];
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
// A deterministic, browser-only rehearsal. Never writes HA state or contacts providers.
export const SIMULATION_EVENTS=[
  'Salida de la prueba · vuelta 12 · neumáticos medios',
  'Nuevos tiempos de vuelta y sectores',
  'El líder entra en boxes',
  'Primera parada · cambio a duros nuevos',
  'Salida de boxes · nueva tanda en pista',
  'El segundo piloto entra en boxes',
  'Segunda estrategia · cambio a blandos nuevos',
  'Adelantamiento · cambia el orden de la tabla',
  'Pérdida de señal · lectura antigua',
  'Se recupera la conexión y llegan tiempos nuevos',
  'Bandera a cuadros · simulación finalizada'
];
export function simulationTiming(base,step,now=Date.now()){
  const n=Math.max(0,Math.min(10,Math.floor(Number(step)||0)));
  const frame=n===8?7:n;
  const rows=(base.rows||[]).map((r,i)=>({...r,position:i+1,laps:12+frame,
    last_lap:`1:${String(20+i%8).padStart(2,'0')}.${String(900-frame*47-i*3).padStart(3,'0')}`,
    best_lap:`1:19.${String(800-frame*19-i*2).padStart(3,'0')}`,
    gap:i?`+${(i*1.8+frame*.12).toFixed(3)}`:'Líder',interval:i?'+1.800':'—',
    sectors:[`26.${700-frame*11}`,`28.${600-frame*13}`,`25.${600-frame*17}`],
    pit_count:0,in_pit:false,retired:false,tyre:{compound:'MEDIUM',age:12+frame,new:false},
    stints:[{compound:'MEDIUM',age:12+frame,new:false}],sector_marks:[i===0?'overall':i===1?'personal':'regular','personal','regular'],last_lap_mark:i===0?'overall':i===1?'personal':'regular'}));
  for(const [i,entry,change,compound] of [[0,2,3,'HARD'],[1,5,6,'SOFT']]){
    const r=rows[i];if(!r)continue;r.in_pit=n===entry||n===change;
    if(n>=change){r.pit_count=1;r.tyre={compound,age:frame-change,new:true};r.stints=[{compound:'MEDIUM',age:12+change,new:false},{...r.tyre}];}
  }
  if(n>=7&&rows.length>2){[rows[1],rows[2]]=[rows[2],rows[1]];rows.forEach((r,i)=>r.position=i+1);}
  rows.forEach((r,i)=>{r.gap=i?`+${(i*1.8+frame*.12).toFixed(3)}`:'Líder';});
  return {...base,simulation:true,event:'Gran Premio de prueba',name:'Carrera simulada',
    timing_received_at:new Date(now-(n===8?120000:0)).toISOString(),start:new Date(now-600000).toISOString(),source_time:new Date(now-(n===8?120000:0)).toISOString(),
    phase:n===10?'finished':n===8?'stale':'live',live:n<10&&n!==8,connected:n<10&&n!==8,
    reported_lap:12+frame,total_laps:22,rows,pits:[],pits_error:false};
}
export function ageText(value,now=Date.now()){
  const age=now-Date.parse(value);if(!Number.isFinite(age)||age< -5000)return 'Hora no disponible';
  const sec=Math.max(0,Math.floor(age/1000));
  return sec<60?`hace ${sec} s`:sec<3600?`hace ${Math.floor(sec/60)} min`:sec<86400?`hace ${Math.floor(sec/3600)} h`:`hace ${Math.floor(sec/86400)} d`;
}
export function lapSeconds(value){
  if(typeof value!=='string'||!/^([0-9]+:)?[0-9]{1,2}\.[0-9]{3}$/.test(value))return null;
  const parts=value.split(':').map(Number),seconds=parts.length===2?parts[0]*60+parts[1]:parts[0];return seconds>0?seconds:null;
}
const timeStamp=value=>{const d=new Date(value);return value&&Number.isFinite(+d)?new Intl.DateTimeFormat('es',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(d):'No disponible';};
const TIME_MARKS={overall:['◆','Mejor de la sesión'],personal:['↑','Mejora personal'],regular:['•','Sin mejora personal']};
const PHASE={live:'En directo',finished:'Última sesión · finalizada',stale:'Lectura antigua · sin directo',waiting:'Esperando datos de sesión'};
const TYRES={SOFT:['S','Blando','#ff6473'],MEDIUM:['M','Medio','#f6d365'],HARD:['H','Duro','#edf2fa'],INTERMEDIATE:['I','Intermedio','#62cb9e'],WET:['W','Lluvia','#65aaf0']};
const tyreBadge=t=>{if(!t)return '—';const x=TYRES[t.compound]||['?',t.compound||'Sin dato','#a5b6cc'];return `<span class="tyre" style="--tyre-color:${x[2]}" title="${escapeHTML(x[1])}">${x[0]}</span> ${escapeHTML(x[1])}`;};
export const dateText = (value,time=true) => {
  if(!value) return 'Por confirmar';
  const onlyDate=/^\d{4}-\d{2}-\d{2}$/.test(value);
  const d=new Date(onlyDate?`${value}T12:00:00Z`:value);
  if(!Number.isFinite(+d)) return 'Por confirmar';
  return new Intl.DateTimeFormat('es',{day:'2-digit',month:'short',...(onlyDate?{timeZone:'UTC'}:time?{hour:'2-digit',minute:'2-digit'}:{})}).format(d);
};
export function nextSession(snapshot,now=Date.now()) {
  return (snapshot.event?.sessions||[]).filter(s=>s.start&&Date.parse(s.start)>now).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start))[0]||null;
}
export function countdown(start,now=Date.now()) {
  const diff=Date.parse(start)-now;
  if(!Number.isFinite(diff)||diff<=0) return 'Horario pendiente';
  const m=Math.floor(diff/60000); return `${Math.floor(m/1440)} d ${Math.floor(m%1440/60)} h ${m%60} min`;
}
const SESSION_NAMES={RAC:'Carrera',QUAL:'Clasificación',SPR:'Sprint'};
const STATUS={'Did not start':'No tomó la salida','Did not qualify':'No se clasificó',Finished:'Finalizado',Lapped:'Doblado',Retired:'Abandono','Disqualified':'Descalificado','Not classified':'Sin clasificar','Withdrew':'Retirado'};
const BLOCKS={next:'Próxima sesión',circuit:'Circuito',programme:'Programa del fin de semana',driver:'Tu piloto',podium:'Último podio',standings:'Mundial de pilotos',constructors:'Mundial de constructores',results:'Resultados',calendar:'Calendario de la temporada',timing:'Tiempos de la sesión',tyres:'Neumáticos y tandas',pits:'Paradas y paso por boxes'};
const e=escapeHTML;
const numberGraphic=d=>safeAsset(d?.number_art)?`<span class="number"><img class="number-art" src="${e(safeAsset(d.number_art))}" alt="Dorsal ${e(d.number)} · gráfico oficial F1"><span class="initials" hidden>${e(d.number)}</span></span>`:`<span class="number">${e(d?.number??'—')}</span>`;
const val=x=>x===null||x===undefined?'—':e(x);
const bodyPhoto=(d,cls='')=>safeAsset(d?.photo)?`<img class="portrait ${cls}" src="${e(safeAsset(d.photo))}" alt="${e(d.name)}" loading="lazy" referrerpolicy="no-referrer"><span class="initials" hidden>${e(d.code||'F1')}</span>`:`<span class="initials ${cls}" aria-label="Foto no disponible">${e(d?.code||'F1')}</span>`;
const photo=(d,cls='')=>cls==='small'?`<span class="headshot">${bodyPhoto(d,cls)}</span>`:bodyPhoto(d,cls);

export class F1PaddockCard extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this._session='RAC';this._expanded=new Set();this._scroll=new Map();this._simStep=0;this._simRunning=false;
    this.shadowRoot.addEventListener('click',ev=>this._click(ev));
    this.shadowRoot.addEventListener('change',ev=>this._change(ev));
    this.shadowRoot.addEventListener('error',ev=>{if(ev.target.tagName==='IMG'){const image=ev.target;image.hidden=true;if(image.nextElementSibling?.classList.contains('initials'))image.nextElementSibling.hidden=false;else{const p=document.createElement('p');p.className='muted';p.textContent='Imagen no disponible en la fuente';image.after(p);}}},true);
  }
  setConfig(config){if(!config.entity)throw new Error('Selecciona el sensor Dashboard de F1 Paddock');this._config={card_type:'dashboard',table_height:430,...config};this.render();}
  set hass(hass){this._hass=hass;if(!this._config)return;const entity=hass.states[this._config.entity];const f=this._config.favorite_entity||entity?.attributes?.favorite_entity;const r=this._config.round_entity||entity?.attributes?.round_entity;const refs=[entity,hass.states[f],hass.states[r]];if(this._refs&&refs.every((v,i)=>v===this._refs[i]))return;this._refs=refs;this.render();}
  connectedCallback(){if(!this._clock)this._clock=setInterval(()=>{if(this.shadowRoot.activeElement?.tagName!=='SELECT'&&!this.shadowRoot.querySelector('dialog[open]'))this.render();},10000);}
  disconnectedCallback(){clearInterval(this._clock);this._clock=null;this._stopSimulation();}
  getCardSize(){return this._config?.card_type==='dashboard'?18:6;}
  getGridOptions(){return {columns:12,rows:'auto',min_columns:6};}
  static getConfigElement(){return document.createElement('f1-paddock-card-editor');}
  static getStubConfig(){return {entity:'',card_type:'dashboard',table_height:430};}
  _card(key,content,kicker){if(this._data?.warnings?.length||this._entity?.state==='unavailable')content+='<p class="tiny muted" role="status">Información parcial: se conservan las últimas lecturas disponibles.</p>';return `<ha-card class="panel ${key}"><div class="kicker">${e(kicker||'F1 PADDOCK')}</div><h2>${e(BLOCKS[key]||key)}</h2>${content}</ha-card>`;}
  _picker(attribute,label){const id=this._config[attribute]||this._entity?.attributes?.[attribute],s=this._hass?.states[id];
    if(!id||!s)return `<span class="muted">${e(label)}: selector no disponible</span>`;
    return `<label class="picker">${e(label)}<select data-entity="${e(id)}" aria-label="${e(label)}">${(s.attributes.options||[]).map(x=>`<option${x===s.state?' selected':''}>${e(x)}</option>`).join('')}</select></label>`;
  }
  _next(){const s=this._data,n=nextSession(s);const updated=Date.parse(s.updated_at),age=Date.now()-updated;const warning=this._entity.state==='unavailable'||!Number.isFinite(age)||age>900000||s.warnings?.length;
    return `<ha-card class="hero"><div><div class="kicker">CAMPEONATO DEL MUNDO · ${val(s.season)}</div><h1 aria-label="F1 Paddock">${safeAsset(s.logo)?`<img class="f1-logo" src="${e(safeAsset(s.logo))}" alt="F1 · logotipo oficial">`:'F1'} <small>Paddock</small></h1><span class="badge">${warning?'Datos pendientes de actualizar':'Resultados publicados'}</span></div><div><div class="kicker">${n?'PRÓXIMA SESIÓN · '+e(n.name):s.event?'PROGRAMA DEL GRAN PREMIO':'TEMPORADA FINALIZADA'}</div><div class="count">${n?e(countdown(n.start)):s.event?'Consulta los horarios':'Hasta la próxima temporada'}</div><div>${e(s.event?.name||'')}</div><p class="muted">${n?e(dateText(n.start)):'Hora local de tu dispositivo'}</p></div><div>${this._picker('favorite_entity','Tu piloto')}</div><div class="health">${warning?'● Información parcial o antigua':'● Última consulta'} · ${e(dateText(s.updated_at))}<span>${e(PHASE[timingPhase(s.timing)]||PHASE.waiting)} · F1 Timing · Neumáticos y contador de paradas. Tiempos de boxes publicados: OpenF1.</span></div></ha-card>`;
  }
  _circuit(){const c=this._data.event;
    if(!c)return this._card('circuit','<p>Temporada finalizada. Consulta los circuitos en el calendario.</p>','EL GRAN PREMIO');
    const url=safeAsset(c.map);return this._card('circuit',`<h3>${e(c.circuit)}</h3><p class="muted">Ronda ${val(c.round)} · ${e(c.name)}</p><p>${e(c.city)} · ${e(c.country)}</p>${url?`<button class="map" data-action="map" aria-label="Ampliar plano del circuito"><img src="${e(url)}" alt="Plano detallado de ${e(c.circuit)}, con las zonas señaladas por F1"><span>Ampliar plano ⤢</span></button><p class="muted tiny">Plano F1 · ${val(c.season)} · Curvas, sectores y zonas según el gráfico original.</p>`:'<p class="empty">Plano de esta temporada aún no verificado.</p>'}`,'EL GRAN PREMIO');
  }
  _programme(){const ss=this._data.event?.sessions||[],next=nextSession(this._data);let last='';
    const rows=ss.map(s=>{const day=dateText(s.start||s.date,false),head=day!==last?`<tr class="day"><th colspan="2">${e(day)}</th></tr>`:'';last=day;
      return `${head}<tr><td>${e(s.name)} ${s===next?'<span class="badge accent">Siguiente</span>':''}</td><td>${s.start?e(new Date(s.start).toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'})):'Por confirmar'}</td></tr>`;}).join('');
    return this._card('programme',`<p class="muted">Hora local de tu dispositivo</p><div class="table-wrap" data-scroll="programme"><table><thead><tr><th>Sesión</th><th>Hora</th></tr></thead><tbody>${rows||'<tr><td>Programa no disponible</td></tr>'}</tbody></table></div>`,'ENTRENAMIENTOS · CLASIFICACIÓN · CARRERA');
  }
  _driver(){const d=this._favorite;
    if(!d)return this._card('driver',`<p class="empty">El piloto guardado no aparece en la clasificación disponible. Puedes elegir otro.</p>${this._picker('favorite_entity','Tu piloto')}`,'PILOTO SELECCIONADO');
    const last=this._data.last_race,r=last?.rows?.find(r=>r.id===d.id);
    return this._card('driver',`<div class="driver-head">${photo(d,'large')}<div>${numberGraphic(d)}<h3>${e(d.name)}</h3><p class="muted">${e(d.team)}</p><div class="stats"><div><b>${val(d.position)}º</b><span>Mundial</span></div><div><b>${val(d.points)}</b><span>Puntos</span></div></div></div></div><div class="result-summary"><div class="kicker">ÚLTIMA CARRERA PUBLICADA</div><h3>${r?'P'+val(r.position):'Sin resultado publicado'}</h3><p>${e(last?.event?.name||'')} · ${e(dateText(last?.date,false))}</p>${r?`<div class="stats"><div><b>${val(r.points)}</b><span>Puntos</span></div><div><b>${val(r.laps)}</b><span>Vueltas</span></div><div><b>${val(r.time)}</b><span>Tiempo / diferencia</span></div></div><p class="muted">${e(STATUS[r.status]||r.status||'Estado no publicado')}</p>`:''}</div>`,'TU PILOTO · '+(d.number??'—'));
  }
  _podium(){const r=this._data.last_race,rows=r?.rows||[];const winners=[2,1,3].map(p=>rows.find(d=>d.position===p));
    return this._card('podium',`<p class="muted">${e(r?.event?.name||'Resultados todavía no publicados')} · ${e(dateText(r?.date,false))}</p><div class="podium-grid">${winners.map((d,i)=>d?`<div class="podium-place place-${[2,1,3][i]}">${photo(d)}<div class="plinth"><b>${val(d.position)}</b>${numberGraphic(d)}<strong>${e(d.name)}</strong><span>${e(d.team)}</span><span>${val(d.time)}</span></div></div>`:'<div class="empty">Pendiente</div>').join('')}</div>`,'CARRERA · RESULTADO PUBLICADO');
  }
  _identity(d){return `<div class="identity">${photo(d,'small')}<div><strong>${e(d.name)}</strong>${d.id&&d.id===this._favorite?.id?'<span class="your-driver">Tu piloto</span>':''}<small>${e(d.team||'')} · ${d.number!==null&&d.number!==undefined?'#'+val(d.number):e(d.code||'')}</small></div></div>`;}
  _table(key,headers,rows,favorite=true){const expanded=this._expanded.has(key);
    return `<div class="table-actions">${favorite?'<button data-action="favorite-row">Ir a mi piloto</button>':''}<button data-action="expand" data-key="${e(key)}">${expanded?'Vista compacta':'Todas las columnas ↔'}</button></div><div class="table-wrap ${expanded?'expanded':''}" role="region" aria-label="${e(BLOCKS[key]||'Resultados de la sesión')}" tabindex="0" data-scroll="${e(key)}"><table><thead><tr>${headers.map(h=>`<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${headers.length}">Datos todavía no publicados.</td></tr>`}</tbody></table></div>`;
  }
  _row(d,cells){return `<tr${d.id&&d.id===this._favorite?.id?' class="favorite-row" aria-current="true"':''}>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`;}
  _standings(){return this._card('standings',`<p class="muted">Temporada ${val(this._data.season)} · Después de la ronda ${val(this._data.standings_round)}</p>${this._table('standings',['P','Piloto','Pts','Al líder','Victorias'],(this._data.standings||[]).map(d=>this._row(d,[val(d.position),this._identity(d),val(d.points),val(d.deficit),val(d.wins)])))}`,'TEMPORADA ACTUAL');}
  _constructors(){return this._card('constructors',this._table('constructors',['P','Equipo','Puntos','Victorias'],(this._data.constructors||[]).map(d=>this._row(d,[val(d.position),e(d.name),val(d.points),val(d.wins)])),false),'CAMPEONATO DE EQUIPOS');}
  _results(){const r=this._data.results?.find(r=>r.code===this._session),gp=this._data.calendar?.find(c=>c.round===this._data.result_round);const selector=this._config.round_entity||this._entity.attributes.round_entity;const selected=this._hass.states[selector]?.state;const pending=selected&&selected!==`R${gp?.round} · ${gp?.name}`;const rows=r?.rows||[],qual=this._session==='QUAL';
    return this._card('results',`${this._picker('round_entity','Gran premio')}<label class="picker">Sesión<select data-action="session" aria-label="Sesión">${Object.entries(SESSION_NAMES).map(([k,v])=>`<option value="${k}"${k===this._session?' selected':''}>${v}</option>`).join('')}</select></label><h3>${e(gp?.name||'')}</h3><p class="muted">${e(SESSION_NAMES[this._session])} · GP del ${e(dateText(gp?.date,false))}</p>${pending?'<p class="empty">Cargando el gran premio seleccionado…</p>':!r?.available?'<p class="empty">Sin clasificación publicada para esta sesión y gran premio.</p>':this._table('results',qual?['P','Piloto','Q1','Q2','Q3']:['P','Piloto','Tiempo / diferencia','Pts','Parrilla','Vueltas','Estado'],rows.map(d=>this._row(d,qual?[val(d.position),this._identity(d),val(d.q1),val(d.q2),val(d.q3)]:[val(d.position),this._identity(d),val(d.time),val(d.points),val(d.grid),val(d.laps),e(STATUS[d.status]||d.status||'—')])))}<p class="tiny muted">Carrera, clasificación y sprint cuando estén publicados. Los tiempos y neumáticos de la última sesión recibida se muestran en el centro de sesión.</p>`,'CLASIFICACIONES PUBLICADAS');
  }
  _freshness(){const t=this._data.timing||{},phase=timingPhase(t),source=t.source_time,received=t.timing_received_at;
    return `<div class="freshness ${phase}"><span class="feed-age">${phase==='live'?'● ':phase==='stale'?'◷ ':''}Datos F1: <time datetime="${e(source||'')}">${e(timeStamp(source))}</time> · ${e(ageText(source))}</span><span>Recibidos en HA: ${e(timeStamp(received))}${received?' · '+e(ageText(received)):''}</span></div>`;
  }
  _sessionNote(){const t=this._data.timing||{},phase=timingPhase(t);return `<div class="session-note"><span class="badge">${e(t.simulation?'SIMULACIÓN · '+(this._simStep===8?'Lectura antigua':this._simStep===10?'Finalizada':this._simRunning?'En marcha':'Pausada'):PHASE[phase])}</span><p>${e(t.event||'Sesión todavía no recibida')} · ${e(t.name||'')}<br>${e(dateText(t.start))}</p>${this._freshness()}</div>`;}
  _timeCell(value,mark){const meta=lapSeconds(value)!==null?TIME_MARKS[mark]:null;return meta?`<span class="lap-time ${mark}" title="${e(meta[1])}" aria-label="${e(value+' · '+meta[1])}"><span aria-hidden="true">${meta[0]}</span> ${val(value)}</span>`:val(value);}
  _timing(){const t=this._data.timing||{},rows=t.rows||[];const bests=rows.map(d=>lapSeconds(d.best_lap)).filter(x=>x!==null),best=bests.length?Math.min(...bests):null;
    return this._card('timing',`${this._sessionNote()}${t.reported_lap!==null&&t.reported_lap!==undefined?`<p class="muted">Vuelta publicada ${val(t.reported_lap)} / ${val(t.total_laps)}</p>`:''}<div class="time-legend"><span class="overall">◆ Mejor de sesión</span><span class="personal">↑ Mejora personal</span><span class="regular">• Sin mejora personal</span></div>${this._table('timing',['P','Piloto','Al líder','Intervalo','Última vuelta','Mejor vuelta','S1','S2','S3','Vueltas','Neumático','Paradas'],rows.map(d=>this._row(d,[val(d.position),this._identity(d),val(d.gap),val(d.interval),this._timeCell(d.last_lap,d.last_lap_mark),this._timeCell(d.best_lap,best!==null&&lapSeconds(d.best_lap)===best?'overall':null),...[0,1,2].map(i=>this._timeCell(d.sectors?.[i],d.sector_marks?.[i])),val(d.laps),tyreBadge(d.tyre),val(d.pit_count)])))}<p class="tiny muted">Colores de última vuelta y sectores según las marcas de F1; el mínimo de mejores vueltas publicadas se destaca en morado. Sin marca, el tiempo queda neutro.</p>`,'CENTRO DE SESIÓN');}

  _tyres(){const rows=this._data.timing?.rows||[];return this._card('tyres',`${this._sessionNote()}${this._table('tyres',['P','Piloto','Compuesto','Vueltas publicadas','Juego','Tandas'],rows.map(d=>this._row(d,[val(d.position),this._identity(d),tyreBadge(d.tyre),val(d.tyre?.age),d.tyre?.new===true?'Nuevo':d.tyre?.new===false?'Usado':'—',(d.stints||[]).map(s=>`<span class="stint">${tyreBadge(s)}<br>${val(s.age)} vueltas</span>`).join('')||'—'])))}<p class="tiny muted">Compuestos y tandas publicados por F1. No se deduce desgaste ni se cuenta una parada por cada cambio de tanda.</p>`,'ESTRATEGIA · DATOS PUBLICADOS');}
  _pits(){const t=this._data.timing||{},rows=t.rows||[];const seconds=x=>typeof x==='number'&&Number.isFinite(x)?e(x.toFixed(3))+' s':'—';return this._card('pits',`${this._sessionNote()}${this._table('pit-counts',['P','Piloto','Paradas','Estado'],rows.map(d=>this._row(d,[val(d.position),this._identity(d),val(d.pit_count),d.in_pit?'En boxes':d.retired?'Retirado':'—'])))}<h3 style="margin-top:20px">Tiempos de boxes publicados</h3><p class="session-note">El contador se recibe del directo público. Los tiempos detallados se consultan después de la sesión; no están disponibles en directo sin acceso adicional.</p>${this._table('pits',['Piloto','Vuelta','Detenido','Pit lane'],(t.pits||[]).map(p=>{const d=rows.find(d=>d.number===p.number)||{name:'#'+p.number};return this._row(d,[this._identity(d),val(p.lap),seconds(p.stop_seconds),seconds(p.lane_seconds)]);}))}<p class="tiny muted">OpenF1 · «Detenido» y «Pit lane» son medidas distintas. Un guion no equivale a cero.${t.pits_error?' Historial de boxes temporalmente no disponible.':''}</p>`,'BOXES · CONTADOR Y TIEMPOS');}
  _calendar(){return this._card('calendar',this._table('calendar',['R','Gran premio','Carrera'],(this._data.calendar||[]).map(d=>`<tr${d.id===this._data.event?.id?' class="upcoming"':''}><td>${val(d.round)}</td><td>${e(d.name)}${d.id===this._data.event?.id?'<small>GRAN PREMIO ACTUAL / PRÓXIMO</small>':''}</td><td>${e(dateText(d.start||d.date))}</td></tr>`),false),'TODOS LOS GRANDES PREMIOS');}
  render(){if(!this._config||!this._hass)return;
    if(this.shadowRoot.querySelector('dialog[open]'))return;
    this._entity=this._hass.states[this._config.entity];this._data=this._entity?.attributes?.snapshot;
    if(!this._data){this._patch('<ha-card style="padding:24px">F1 Paddock · Selecciona el sensor Dashboard de la integración. Datos todavía no disponibles.</ha-card>');return;}
    if(this._config.card_type==='simulation'){this._simBase??=structuredClone(this._data);this._data={...this._simBase,timing:simulationTiming(this._simBase.timing||{},this._simStep)};}
    this._favorite=this._data.drivers?.find(d=>d.id===this._entity.attributes.favorite_id);
    for(const x of this.shadowRoot.querySelectorAll('[data-scroll]'))this._scroll.set(x.dataset.scroll,[x.scrollLeft,x.scrollTop]);
    const methods={next:()=>this._next(),circuit:()=>this._circuit(),programme:()=>this._programme(),driver:()=>this._driver(),podium:()=>this._podium(),standings:()=>this._standings(),constructors:()=>this._constructors(),results:()=>this._results(),calendar:()=>this._calendar(),simulation:()=>this._simulation(),timing:()=>this._timing(),tyres:()=>this._tyres(),pits:()=>this._pits()};
    const kind=this._config.card_type,whole=kind==='dashboard';const body=whole?`${this._next()}<div class="columns"><div>${this._circuit()}${this._programme()}${this._results()}</div><div>${this._driver()}${this._timing()}${this._tyres()}${this._standings()}</div><div>${this._podium()}${this._pits()}${this._constructors()}${this._calendar()}</div></div>`:(methods[kind]?.()||'<p>Tarjeta desconocida</p>');
    // Chromium registers font faces in the document, not inside shadow roots.
    const font=safeAsset(this._data.font);
    if(font==='/f1_paddock_font/Formula1-Bold.woff'&&!document.getElementById('f1-paddock-font-face')){
      const style=document.createElement('style');style.id='f1-paddock-font-face';
      style.textContent=`@font-face{font-family:F1Paddock;src:url("${font}") format("woff");font-display:swap}`;
      document.head.append(style);
    }
    this._patch(`<style>${this._styles()}</style><div class="root">${body}</div>`);
    for(const x of this.shadowRoot.querySelectorAll('[data-scroll]')){const p=this._scroll.get(x.dataset.scroll);if(p){x.scrollLeft=p[0];x.scrollTop=p[1];}}
  }
  _stopSimulation(){clearInterval(this._simTimer);this._simTimer=null;this._simRunning=false;}
  _advanceSimulation(){this._simStep=Math.min(10,this._simStep+1);if(this._simStep===10)this._stopSimulation();this.render();}
  _startSimulation(){if(this._simStep===10)this._simStep=0;this._simRunning=true;this._simTimer=setInterval(()=>this._advanceSimulation(),4000);}
  _simulation(){return `<ha-card class="panel rehearsal"><div class="kicker">PRUEBA LOCAL · DATOS INVENTADOS</div><h2>Simulación de sesión</h2><p>Comprueba tiempos, sectores, cambios de neumático, paradas y reconexión. No modifica sensores, resultados ni tu piloto guardado.</p><div class="sim-controls"><button data-action="sim-toggle">${this._simRunning?'Pausar':'Iniciar simulación'}</button><button data-action="sim-next">Siguiente paso</button><button data-action="sim-reset">Reiniciar</button></div><p class="sim-progress" role="status">Paso ${this._simStep} / 10 · ${e(SIMULATION_EVENTS[this._simStep])}</p><p class="tiny muted">Avanza cada 4 segundos y termina automáticamente. Las duraciones detalladas de boxes no se simulan como datos recibidos.</p></ha-card><div class="simulation-grid"><div class="simulation-timing">${this._timing()}</div><div>${this._tyres()}</div><div>${this._pits()}</div></div>`;}
  _patch(html){const template=document.createElement('template');template.innerHTML=html;patchDOM(this.shadowRoot,template.content);}
  async _change(ev){const t=ev.target;if(t.dataset.action==='session'){this._session=t.value;this.render();return;}
    if(t.dataset.entity){t.disabled=true;try{await this._hass.callService('select','select_option',{entity_id:t.dataset.entity,option:t.value});}catch{t.disabled=false;const p=document.createElement('p');p.textContent='No se pudo guardar la selección. Inténtalo de nuevo.';p.setAttribute('role','alert');t.after(p);}}
  }
  _click(ev){const b=ev.target.closest('button');if(!b)return;
    if(b.dataset.action==='sim-toggle'){if(this._simRunning)this._stopSimulation();else this._startSimulation();this.render();}
    if(b.dataset.action==='sim-next'){this._stopSimulation();this._advanceSimulation();}
    if(b.dataset.action==='sim-reset'){this._stopSimulation();this._simStep=0;this.render();}
    if(b.dataset.action==='expand'){const key=b.dataset.key;this._expanded.has(key)?this._expanded.delete(key):this._expanded.add(key);this.render();}
    if(b.dataset.action==='favorite-row'){const wrap=b.closest('.table-actions')?.nextElementSibling;const row=wrap?.querySelector('.favorite-row');row?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'smooth'});}
    if(b.dataset.action==='map'){const url=safeAsset(this._data.event?.map);if(!url)return;const dialog=document.createElement('dialog');dialog.innerHTML=`<button class="close" aria-label="Cerrar plano">Cerrar ✕</button><h2>${e(this._data.event.circuit)}</h2><img src="${e(url)}" alt="Plano detallado del circuito"><p>Plano original F1 · ${val(this._data.season)}</p>`;this.shadowRoot.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{dialog.remove();this.render();});dialog.showModal();}
  }
  _styles(){const h=Math.min(1000,Math.max(200,Number(this._config.table_height)||430)),font=safeAsset(this._data.font);
    return `${font?`@font-face{font-family:F1Paddock;src:url("${e(font)}") format("woff");font-display:swap}`:''}
    :host{display:block;color:#edf2fa;font-family:var(--primary-font-family,Arial,sans-serif);--muted:#a2b4c8;--accent:#ff6279;font-size:13px}*{box-sizing:border-box}[hidden]{display:none!important}.root{width:100%}ha-card{display:block;color:inherit;border:1px solid #ffffff12;border-radius:22px;background:linear-gradient(135deg,#20232d,#142630);box-shadow:none;overflow:hidden}.panel{padding:22px;margin-bottom:20px}.kicker{font-size:9px;letter-spacing:1.4px;font-weight:700;color:var(--muted);line-height:1.6}h1,h2,h3,p{margin:0 0 14px}h1,h2,.count,.number{font-family:F1Paddock,Arial,sans-serif}h1{font-size:44px;margin-top:12px}h1{display:flex;align-items:center;gap:18px;flex-wrap:wrap}.f1-logo{width:155px;height:auto;max-height:50px;object-fit:contain}h1 small{font-family:F1Paddock,Arial,sans-serif;font-size:22px;font-weight:700;font-style:italic;letter-spacing:.025em;line-height:1.2}h2{font-size:18px;line-height:1.5;margin-top:8px}h3{font-size:19px;line-height:1.5}.muted{color:var(--muted);line-height:1.6}.tiny{font-size:10px;margin:12px 0 0}.hero{padding:28px;background:linear-gradient(110deg,#482635,#20232d 50%,#132c38);display:grid;grid-template-columns:1.1fr 1.1fr 1fr;gap:24px;margin-bottom:24px;align-items:center}.count{font-size:24px;color:#ffc191;margin:14px 0}.badge{display:inline-block;border:1px solid #ffffff20;border-radius:20px;padding:6px 10px;font-size:10px;font-family:Arial,sans-serif}.accent{padding:3px 6px;color:#ffc191}.health{grid-column:1/-1;border:1px solid #ffffff12;padding:12px;border-radius:12px;font-size:11px;color:#a9d5c6;line-height:1.7}.health span{display:block;color:var(--muted)}.columns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.columns>div{min-width:0}.picker{display:block;font-size:11px;color:var(--muted);margin-bottom:14px}select{display:block;width:100%;padding:12px;margin-top:6px;background:#1b2b37;color:#edf2fa;border:1px solid #ffffff24;border-radius:9px;font:inherit;min-height:44px}button{font:inherit;cursor:pointer;color:#dbe7f5;background:#ffffff06;border:1px solid #ffffff24;border-radius:9px;padding:9px 11px;min-height:38px}button:hover{border-color:#ff6279}button:focus-visible,select:focus-visible,.table-wrap:focus-visible{outline:2px solid #82bafa;outline-offset:2px}.map{padding:10px;width:100%;background:#111820;position:relative}.map img{width:100%;display:block;min-height:160px;object-fit:contain}.map span{display:block;text-align:right;color:#c0cddd;font-size:11px;padding-top:8px}.driver{background:linear-gradient(135deg,#412735,#172a35)}.driver-head{display:grid;grid-template-columns:42% 1fr;gap:15px;align-items:center}.portrait{object-fit:contain;width:100%;display:block}.portrait.large{height:210px;object-fit:cover;object-position:top}.number{font-size:38px;color:var(--accent);margin-bottom:14px}.number-art{display:block;width:105px;height:65px;object-fit:contain;object-position:left center}.plinth .number-art{width:100%;height:36px;object-position:center}.stats{display:flex;gap:20px;flex-wrap:wrap;margin-top:12px}.stats b{font-size:21px;display:block;color:#ff788c}.stats span{display:block;font-size:10px;color:var(--muted);margin-top:6px}.result-summary{margin-top:16px;padding:16px;border:1px solid #ffffff13;border-radius:12px}.result-summary h3{font-size:29px;margin-top:8px;color:#ff788c}.result-summary p{font-size:11px;margin-bottom:6px}.initials{display:flex;align-items:center;justify-content:center;font-size:25px;background:#ffffff08;border-radius:12px;min-height:80px}.initials.large{height:210px}.podium-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;align-items:end;margin-top:20px}.podium-place .portrait{height:135px;object-fit:cover;object-position:top}.podium-place.place-1 .portrait{height:165px}.plinth{background:#ffffff06;padding:12px 5px;border:1px solid #ffffff13;border-radius:12px;display:flex;flex-direction:column;text-align:center;gap:8px;min-height:165px}.place-1 .plinth{border-color:#cabb6544;background:#cabb650c;min-height:185px}.plinth>b{font-size:25px}.plinth .number{font-size:24px;margin:0}.plinth strong{font-size:12px;overflow-wrap:anywhere}.plinth span:not(.number){font-size:9px;color:var(--muted)}.tyre{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border:3px solid var(--tyre-color);color:var(--tyre-color);border-radius:50%;font-size:11px;font-weight:800}.stint{display:inline-block;border:1px solid #ffffff18;border-radius:10px;padding:8px;margin:3px;font-size:10px}.session-note{line-height:1.7;color:#a6bacf;font-size:11px}.table-actions{display:flex;justify-content:space-between;gap:8px;margin:14px 0 10px}.table-actions button{font-size:10px}.table-wrap{max-height:${h}px;overflow:auto;overscroll-behavior:auto;touch-action:pan-x pan-y;scrollbar-color:#657587 #17212c;scrollbar-width:thin;border-radius:8px}table{width:100%;border-collapse:separate;border-spacing:0;font-size:11px;line-height:1.5}th,td{padding:11px 8px;text-align:left;border-bottom:1px solid #ffffff0c;vertical-align:middle;white-space:nowrap}thead th{position:sticky;top:0;z-index:2;background:#1b2b36;color:var(--muted);font-size:10px}td:first-child{font-weight:700}td:nth-child(2){white-space:normal;min-width:120px}table small{display:block;font-size:9px;color:var(--muted);margin-top:4px}.identity{display:flex;gap:8px;align-items:center;min-width:145px}.headshot{position:relative;display:block;overflow:hidden;width:48px;height:58px;flex:0 0 48px;border-radius:10px;background:#ffffff08}.identity .headshot .portrait.small{position:absolute;width:125px;max-width:none;height:auto;left:50%;top:0;transform:translateX(-50%)}.identity .initials{width:48px;min-height:58px;font-size:10px;flex-shrink:0}.identity strong{font-size:11px}.identity small{font-size:9px}.rehearsal{border-color:#e8bf5680}.sim-controls{display:flex;gap:10px;flex-wrap:wrap}.sim-progress{min-height:42px;line-height:1.8;margin-top:16px;color:#f6d365}.simulation-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.simulation-grid>div{min-width:0}.simulation-timing{grid-column:1/-1}@media(max-width:650px){.simulation-grid{display:block}}.your-driver{display:inline-block;margin-left:5px;padding:2px 5px;border:1px solid #ff869a70;border-radius:5px;color:#ffd8df;background:#ff62791a;font-size:8px;font-weight:700;white-space:nowrap}.favorite-row>td{background:#ff62791c;border-bottom-color:#ff627936}.favorite-row .identity strong{color:#ffd8df}.favorite-row{background:#ff627912}.favorite-row td:first-child{border-left:2px solid #ff6279}.upcoming{background:#ff627915}.upcoming small{color:#ffc191}.expanded table{min-width:650px}.expanded th:nth-child(2),.expanded td:nth-child(2){position:sticky;left:30px;background:#182a35;z-index:1}.expanded th:first-child,.expanded td:first-child{position:sticky;left:0;min-width:30px;background:#182a35;z-index:1}.expanded thead th:first-child,.expanded thead th:nth-child(2){z-index:3}.expanded .favorite-row td:first-child,.expanded .favorite-row td:nth-child(2){background:#372632}.time-legend{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:10px;line-height:1.7;margin:12px 0}.lap-time{font-variant-numeric:tabular-nums;font-weight:700}.overall{color:#d6a1ff}.personal{color:#77dfad}.regular{color:#f6d365}.freshness{padding:10px 12px;border:1px solid #ffffff1c;border-radius:9px;margin:10px 0 14px;min-height:60px;font-variant-numeric:tabular-nums}.freshness>span{display:block}.freshness.live .feed-age{color:#77dfad}.freshness.stale .feed-age{color:#f6d365}.session-note>p{margin:8px 0}.day th{color:#ffc191;background:#ffffff04}.empty{padding:18px 0;color:var(--muted);line-height:1.7}dialog{width:min(1200px,95vw);max-height:90vh;background:#172430;color:#edf2fa;border:1px solid #ffffff33;border-radius:18px;padding:24px}dialog::backdrop{background:#000b}dialog img{display:block;width:100%;max-height:70vh;object-fit:contain}dialog .close{float:right}dialog p{color:var(--muted);font-size:11px;margin-top:12px}@media(max-width:1050px){.columns{grid-template-columns:repeat(2,minmax(0,1fr))}.columns>div:last-child{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}.hero{grid-template-columns:1fr 1fr}.hero>div:nth-child(3){grid-column:1/-1}}@media(max-width:650px){.hero{grid-template-columns:1fr;padding:20px;gap:18px}.hero>div:nth-child(3){grid-column:auto}.columns,.columns>div:last-child{display:block}.panel{padding:18px}.count{font-size:23px}.hero h1{font-size:38px}.driver-head{grid-template-columns:40% 1fr}.number{font-size:32px}.stats{gap:16px}h2{font-size:17px}}`;
  }
}

export class F1PaddockEditor extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this.shadowRoot.addEventListener('change',ev=>{const t=ev.target;if(!t.name)return;const value=t.name==='table_height'?Number(t.value):t.value;this._config={...this._config,[t.name]:value};this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this._config},bubbles:true,composed:true}));});}
  setConfig(c){this._config={...c};this.render();}set hass(h){this._hass=h;this.render();}
  render(){if(!this._config||!this._hass)return;const sensors=Object.entries(this._hass.states).filter(([,s])=>s.attributes?.snapshot?.schema_version===1&&s.attributes.snapshot.capabilities&&s.entity_id?.startsWith('sensor.'));
    this.shadowRoot.innerHTML=`<style>label{display:block;margin:16px 0}select,input{display:block;width:100%;padding:12px;margin-top:8px;background:var(--card-background-color,#202830);color:var(--primary-text-color,#fff);border:1px solid #888;border-radius:8px}</style><label>Sensor Dashboard<select name="entity"><option value="">Selecciona el sensor</option>${sensors.map(([id,s])=>`<option value="${e(id)}"${id===this._config.entity?' selected':''}>${e(s.attributes.friendly_name||id)}</option>`).join('')}</select></label><label>Contenido<select name="card_type">${Object.entries({dashboard:'Panel completo',simulation:'Simulación de sesión · prueba',...BLOCKS}).map(([key,name])=>`<option value="${key}"${key===(this._config.card_type||'dashboard')?' selected':''}>${e(name)}</option>`).join('')}</select></label><label>Altura máxima de las tablas<input type="number" name="table_height" min="200" max="1000" value="${e(this._config.table_height||430)}"></label><p>Los selectores de piloto y gran premio se detectan automáticamente. Diseño y visibilidad se ajustan desde Home Assistant.</p>`;
  }
}
if(!customElements.get('f1-paddock-card'))customElements.define('f1-paddock-card',F1PaddockCard);
if(!customElements.get('f1-paddock-card-editor'))customElements.define('f1-paddock-card-editor',F1PaddockEditor);
window.customCards=window.customCards||[];
window.customCards.push({type:'f1-paddock-card',name:'F1 Paddock · Panel completo',description:'Fórmula 1 con el estilo de MotoGP Paddock',preview:true});
for(const [key,name] of Object.entries(BLOCKS)){
  const tag=`f1-paddock-${key}-card`;
  if(!customElements.get(tag))customElements.define(tag,class extends F1PaddockCard{setConfig(c){super.setConfig({...c,card_type:key});}static getStubConfig(){return {entity:'',card_type:key};}});
  window.customCards.push({type:tag,name:'F1 Paddock · '+name,description:name+' · Tarjeta independiente',preview:true});
}
