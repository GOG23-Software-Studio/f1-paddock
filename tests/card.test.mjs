import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
// Reuse the already installed development dependency, with no new download.
let JSDOM;
try { ({JSDOM}=createRequire(import.meta.url)('jsdom')); }
catch { ({JSDOM}=createRequire(new URL('../../motogp-paddock/package.json',import.meta.url))('jsdom')); }
const dom=new JSDOM('<!doctype html>',{url:'http://localhost'});
for(const key of ['window','document','HTMLElement','customElements','CustomEvent'])globalThis[key]=dom.window[key];
const {F1PaddockCard,safeAsset,countdown,nextSession,simulationTiming,ageText,dateText,resolveLanguage,translate,F1PaddockEditor}=await import('../custom_components/f1_paddock/www/f1-paddock-card.js');
const original=JSON.parse(fs.readFileSync(new URL('fixtures/snapshot.json',import.meta.url)));
function setup(kind='dashboard'){
 const snapshot=structuredClone(original),id='sensor.f1',fav='select.fav',gp='select.gp';
 const states={[id]:{entity_id:id,state:'Las Vegas',attributes:{snapshot,favorite_id:'alonso',favorite_entity:fav,round_entity:gp}},[fav]:{state:'Fernando Alonso',attributes:{options:snapshot.drivers.map(d=>d.name)}},[gp]:{state:'R20 · Brazilian Grand Prix',attributes:{options:snapshot.calendar.map(d=>`R${d.round} · ${d.name}`)}}};
 const card=new F1PaddockCard();card.setConfig({entity:id,card_type:kind});card.hass={language:"es",states,callService:async()=>{}};return {card,states,snapshot};
}
test('all nine independent blocks and complete dashboard render actual data',()=>{
 for(const kind of ['dashboard','next','circuit','programme','driver','podium','standings','constructors','results','calendar']){
  const {card}=setup(kind);assert(!/undefined|NaN|\[object Object\]/.test(card.shadowRoot.textContent),kind);
  assert(!card.shadowRoot.querySelector('script'));assert(card.shadowRoot.querySelector('ha-card'));
 }
});
test('favorite name and correct portrait, complete standings and top three podium',()=>{
 const {card}=setup();const root=card.shadowRoot;
 assert(root.querySelector('.driver').textContent.includes('Fernando Alonso'));
 assert.equal(root.querySelectorAll('.standings tbody tr').length,25);
 assert.equal(root.querySelectorAll('.podium-place').length,3);
 assert(root.querySelector('.place-1').textContent.includes('Lando Norris'));
 assert.equal(root.querySelectorAll('.calendar tbody tr').length,23);
});
test('qualifying segments and absent sprint do not borrow race rows',()=>{
 const {card}=setup('results');card._session='QUAL';card.render();assert(card.shadowRoot.textContent.includes('Q1'));
 card._session='SPR';card.render();assert(card.shadowRoot.textContent.includes('Sin clasificación publicada'));assert.equal(card.shadowRoot.querySelectorAll('tbody tr').length,0);
});
test('result selection pending hides old result rows',()=>{
 const {card,states}=setup('results');states['select.gp'].state='R21 · Las Vegas Grand Prix';card.render();
 assert(card.shadowRoot.textContent.includes('Cargando el gran premio'));assert.equal(card.shadowRoot.querySelectorAll('tbody tr').length,0);
});
test('provider text and URLs cannot inject markup or scripts',()=>{
 assert.equal(safeAsset('javascript:alert(1)'),'');assert.equal(safeAsset('https://evil.test/image.png'),'');assert.equal(safeAsset('https://media.formula1.com@evil.test/a'),'');
 const {card,snapshot}=setup('standings');snapshot.standings[0].name='<img src=x onerror=alert(1)>';card.render();
 assert(card.shadowRoot.textContent.includes('<img src=x'));assert.equal(card.shadowRoot.querySelectorAll('[onerror]').length,0);
});
test('countdown chooses next session, no fake live label after race starts',()=>{
 const n=nextSession(original,Date.parse('2026-11-12T17:00:00Z'));assert.equal(n.code,'FP1');
 assert(countdown(n.start,Date.parse('2026-11-12T17:00:00Z')).includes('7 d'));
 assert.equal(countdown(n.start,Date.parse('2027-01-01')),'Horario pendiente');
});
test('expanded columns and table scroll survive data refresh',()=>{
 const {card}=setup('standings');card._expanded.add('standings');card.render();const wrap=card.shadowRoot.querySelector('[data-scroll]');wrap.scrollTop=155;wrap.scrollLeft=31;card.render();
 assert(card.shadowRoot.querySelector('.expanded'));assert.equal(card.shadowRoot.querySelector('[data-scroll]').scrollTop,155);
});

test('clock and real data refresh keep card, image, row and scroll nodes mounted',()=>{
 const {card,snapshot,states}=setup('standings');const wrap=card.shadowRoot.querySelector('[data-scroll]');const panel=card.shadowRoot.querySelector('ha-card');const row=card.shadowRoot.querySelector('tbody tr');const image=card.shadowRoot.querySelector('img');wrap.scrollTop=170;
 for(let i=0;i<15;i++)card.render();
 assert.equal(card.shadowRoot.querySelector('ha-card'),panel);assert.equal(card.shadowRoot.querySelector('[data-scroll]'),wrap);assert.equal(card.shadowRoot.querySelector('tbody tr'),row);assert.equal(card.shadowRoot.querySelector('img'),image);assert.equal(wrap.scrollTop,170);
 snapshot.standings[0].points=391;states['sensor.f1']={...states['sensor.f1']};card.hass={language:"es",states};assert.equal(card.shadowRoot.querySelector('tbody tr'),row);assert(row.textContent.includes('391'));
});

test('unrelated HA updates do not redraw a card',()=>{
 const {card,states}=setup('driver');const old=card.render;let count=0;card.render=()=>{count++;old.call(card);};
 for(let i=0;i<10;i++)card.hass={language:"es",states:{...states,'sensor.unrelated':{state:String(i)}}};assert.equal(count,0);
});

test('session cards show official timing, tyre stints and distinct pit durations',()=>{
 for(const kind of ['timing','tyres','pits']){const {card}=setup(kind);assert(card.shadowRoot.textContent.includes('Última sesión · finalizada'));assert(!card.shadowRoot.textContent.includes('En directo'));assert(card.shadowRoot.querySelector('tbody tr'));assert(!/undefined|NaN/.test(card.shadowRoot.textContent));}
 const {card}=setup('pits');assert(card.shadowRoot.textContent.includes('Detenido'));assert(card.shadowRoot.textContent.includes('Pit lane'));assert(card.shadowRoot.textContent.includes('2.500 s'));assert(card.shadowRoot.textContent.includes('24.394 s'));
});


test('simulation changes timing, tyres, pits, order and signal without changing source data',()=>{
 const base=structuredClone(original.timing),before=JSON.stringify(base),now=Date.now();
 const first=simulationTiming(base,0,now),lap=simulationTiming(base,1,now),pit=simulationTiming(base,2,now),tyre=simulationTiming(base,3,now);
 assert.notEqual(first.rows[0].last_lap,lap.rows[0].last_lap);assert(pit.rows[0].in_pit);
 assert.equal(tyre.rows[0].pit_count,1);assert.equal(tyre.rows[0].tyre.compound,'HARD');assert.equal(tyre.rows[0].tyre.age,0);
 assert.equal(simulationTiming(base,6,now).rows[1].tyre.compound,'SOFT');
 assert.equal(simulationTiming(base,7,now).rows[1].id,base.rows[2].id);
 assert.deepEqual(simulationTiming(base,8,now).rows,simulationTiming(base,7,now).rows);assert.equal(simulationTiming(base,8,now).connected,false);assert.equal(simulationTiming(base,9,now).connected,true);
 assert.equal(simulationTiming(base,10,now).phase,'finished');assert.equal(JSON.stringify(base),before);
});

test('simulation updates preserve tables, focus, scroll and original HA entities',()=>{
 const {card,states}=setup('simulation'),before=JSON.stringify(states);let calls=0;card._hass.callService=()=>{calls++;};
 const wrap=card.shadowRoot.querySelector('[data-scroll="timing"]'),tyres=card.shadowRoot.querySelector('[data-scroll="tyres"]'),button=card.shadowRoot.querySelector('[data-action="sim-next"]');
 wrap.scrollTop=168;wrap.scrollLeft=93;tyres.scrollTop=112;
 for(let i=0;i<10;i++){button.click();assert.equal(card.shadowRoot.querySelector('[data-scroll="timing"]'),wrap);assert.equal(card.shadowRoot.querySelector('[data-scroll="tyres"]'),tyres);assert.equal(card.shadowRoot.querySelector('[data-action="sim-next"]'),button);assert.equal(wrap.scrollTop,168);assert.equal(wrap.scrollLeft,93);assert.equal(tyres.scrollTop,112);}
 assert.equal(card._simStep,10);assert.equal(calls,0);assert.equal(JSON.stringify(states),before);assert(card.shadowRoot.textContent.includes('SIMULACIÓN'));assert(!card.shadowRoot.textContent.includes('En directo'));
 card.shadowRoot.querySelector('[data-action="sim-toggle"]').click();assert(card._simRunning);card.disconnectedCallback();assert(!card._simRunning);assert.equal(card._simTimer,null);
});


test('timing colors use feed flags and only compare published personal best laps',()=>{
 const {card,states,snapshot}=setup('timing');snapshot.timing.rows[0].last_lap='1:21.001';snapshot.timing.rows[0].last_lap_mark='personal';snapshot.timing.rows[0].sectors=['24.001','28.002',null];snapshot.timing.rows[0].sector_marks=['overall',null,'personal'];
 states['sensor.f1']={...states['sensor.f1']};card.hass={language:"es",states};
 const row=card.shadowRoot.querySelector('tbody tr');assert(row.querySelector('[aria-label="1:21.001 · Mejora personal"]'));assert(row.querySelector('[aria-label="24.001 · Mejor de la sesión"]'));assert(!row.querySelector('[aria-label^="28.002"]'));assert(!row.querySelector('[aria-label^="null"]'));
 assert(card.shadowRoot.textContent.includes('Sin marca, el tiempo queda neutro'));
});

test('favorite stands out and data source age stays separate from receipt time',()=>{
 const {card,snapshot}=setup('timing');const now=Date.now();snapshot.timing.source_time=new Date(now-86400000).toISOString();snapshot.timing.timing_received_at=new Date(now).toISOString();card.render();
 assert(card.shadowRoot.querySelector('.favorite-row[aria-current="true"] .your-driver'));assert(card.shadowRoot.querySelector('.favorite-row').textContent.includes('Fernando'));
 assert(card.shadowRoot.querySelector('.freshness').textContent.includes('hace 1 d'));assert(card.shadowRoot.querySelector('.freshness').textContent.includes('Recibidos en HA:'));
 assert.equal(ageText(null,now),'Hora no disponible');assert.equal(ageText(new Date(now-65000).toISOString(),now),'hace 1 min');assert.equal(ageText(new Date(now+60000).toISOString(),now),'Hora no disponible');
});

test('automatic language follows HA and explicit choices remain independent across cards',()=>{
 const en=setup('timing'),es=setup('timing');
 en.card.setConfig({entity:'sensor.f1',card_type:'timing',language:'auto'});
 const table=en.card.shadowRoot.querySelector('[data-scroll="timing"]');table.scrollTop=103;table.scrollLeft=61;
 en.card.hass={language:'en-GB',states:en.states};
 assert(en.card.shadowRoot.textContent.includes('Session timing'));
 assert(en.card.shadowRoot.textContent.includes('Last session · finished'));
 assert(en.card.shadowRoot.textContent.includes('Received in HA:'));
 assert.equal(en.card.shadowRoot.querySelector('[data-scroll="timing"]'),table);
 assert.equal(table.scrollTop,103);assert.equal(table.scrollLeft,61);
 en.card.hass={language:'es-ES',states:en.states};assert(en.card.shadowRoot.textContent.includes('Tiempos de la sesión'));
 es.card.setConfig({entity:'sensor.f1',card_type:'timing',language:'es'});es.card.hass={language:'en',states:es.states};
 en.card.setConfig({entity:'sensor.f1',card_type:'timing',language:'en'});en.card.hass={language:'es',states:en.states};
 assert(es.card.shadowRoot.textContent.includes('Tiempos de la sesión'));assert(en.card.shadowRoot.textContent.includes('Session timing'));
 assert.equal(resolveLanguage({language:'auto'},{language:'es-MX'}),'es');assert.equal(resolveLanguage({}, {language:'fr'}),'en');
});

test('English dashboard translates tables, statuses, session labels, tyres and accessibility text',()=>{
 const {card,states,snapshot}=setup();
 snapshot.event.sessions=[{name:'Libres 1',start:new Date(Date.now()+3600000).toISOString()}];
 snapshot.timing.rows[0].last_lap='1:21.001';snapshot.timing.rows[0].last_lap_mark='overall';
 card.setConfig({entity:'sensor.f1',language:'en'});card.hass={language:'es',states};
 const text=card.shadowRoot.textContent;
 for(const label of ['NEXT SESSION','Practice 1','Circuit','Weekend programme','Driver standings','Constructor standings','Pit stops and pit lane','Your driver','Reported laps','Stopped','Session best','Lapped','Race','YOUR DRIVER'])assert(text.includes(label),label);
 for(const label of ['PRÓXIMA SESIÓN','Tu piloto','Piloto','Neumáticos','CLASIFICACIONES PUBLICADAS','No tomó la salida','Retirado','SIMULACIÓN'])assert(!text.includes(label),label);
 assert(card.shadowRoot.querySelector('[aria-label="Enlarge circuit map"]'));
 assert(card.shadowRoot.querySelector('[aria-label="1:21.001 · Session best"]'));
 assert(card.shadowRoot.querySelector('.favorite-row').textContent.includes('Fernando'));
 const options=Array.from(card.shadowRoot.querySelector('[data-action="session"]').options);
 assert.deepEqual(options.map(o=>o.value),['RAC','QUAL','SPR']);assert.deepEqual(options.map(o=>o.textContent),['Race','Qualifying','Sprint']);
 assert.equal(states['select.fav'].state,'Fernando Alonso');
});

test('English warnings, empty data and simulation are localized without changing source readings',()=>{
 for(const kind of ['dashboard','simulation','results','circuit','programme','driver']){
  const {card,states,snapshot}=setup(kind);snapshot.warnings=['source:cached'];
  if(kind==='circuit'||kind==='programme')snapshot.event=null;
  if(kind==='driver')snapshot.drivers=[];
  card.setConfig({entity:'sensor.f1',card_type:kind,language:'en'});card.hass={language:'es',states};
  const text=card.shadowRoot.textContent;
  assert(!text.includes('Información parcial'),kind);assert(!text.includes('Temporada finalizada'),kind);assert(!text.includes('Programa no disponible'),kind);
  if(kind==='simulation'){assert(text.includes('SIMULATION'));assert(text.includes('Start simulation'));assert(text.includes('Test start'));card._simStep=8;card.render();assert(card.shadowRoot.textContent.includes('Stale reading'));}
 }
 const {card,states}=setup('pits');card.setConfig({entity:'sensor.f1',card_type:'pits',language:'en'});states['sensor.f1'].attributes.snapshot.timing.pits_error=true;card.render();assert(card.shadowRoot.textContent.includes('Pit history temporarily unavailable.'));
});

test('localized dates keep date-only days and freshness has an English fallback',()=>{
 const now=Date.UTC(2026,10,19,12);
 assert(dateText('2026-12-01',false,'en').includes('Dec'));assert(dateText('2026-12-01',false,'es').includes('dic'));
 assert.equal(dateText(null,true,'en'),'To be confirmed');assert.equal(dateText('invalid',true,'en'),'To be confirmed');
 assert.equal(ageText(new Date(now-65000).toISOString(),now,'en'),'1 min ago');assert.equal(ageText(null,now,'en'),'Time unavailable');
 assert.equal(countdown(null,now,'en'),'Schedule pending');
});

test('editor language selector translates immediately and preserves all config options',()=>{
 const {states}=setup();const editor=new F1PaddockEditor();
 editor.setConfig({entity:'sensor.f1',card_type:'timing',table_height:530,custom_option:'keep'});editor.hass={language:'es',states};
 let emitted;editor.addEventListener('config-changed',ev=>{emitted=ev.detail.config;});
 let select=editor.shadowRoot.querySelector('[name="language"]');assert.equal(select.value,'auto');assert.deepEqual([...select.options].map(o=>o.textContent),['Automático','Español','English']);
 select.value='en';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 assert.equal(emitted.language,'en');assert.equal(emitted.custom_option,'keep');assert.equal(emitted.table_height,530);
 assert(editor.shadowRoot.textContent.includes('Dashboard sensor'));assert(editor.shadowRoot.textContent.includes('Maximum table height'));assert(editor.shadowRoot.textContent.includes('Session timing'));
 select=editor.shadowRoot.querySelector('[name="language"]');select.value='auto';select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 editor.hass={language:'en-US',states};assert(editor.shadowRoot.textContent.includes('Automatic'));assert.equal(editor._config.custom_option,'keep');
});


test('all independent cards support English without coercing unknown provider labels',()=>{
 for(const kind of ['next','circuit','programme','driver','podium','standings','constructors','results','calendar','timing','tyres','pits']){
  const {card,states}=setup(kind);card.setConfig({entity:'sensor.f1',card_type:kind,language:'en'});card.hass={language:'es',states};
  assert(card.shadowRoot.querySelector('ha-card'),kind);assert(!/undefined|NaN|\[object Object\]/.test(card.shadowRoot.textContent),kind);
 }
 for(const text of ['constructor','toString','provider-specific session'])assert.equal(translate('en',text),text);
});

test('editor dropdowns keep their nodes, focus and pending choice during HA updates',()=>{
 const {states}=setup();states['sensor.other']={entity_id:'sensor.other',attributes:{snapshot:structuredClone(original)}};const editor=new F1PaddockEditor();document.body.append(editor);
 editor.setConfig({entity:'',card_type:'circuit',table_height:430});editor.hass={language:'es',states};
 const sensor=editor.shadowRoot.querySelector('[name="entity"]'),content=editor.shadowRoot.querySelector('[name="card_type"]');
 sensor.focus();sensor.value='sensor.f1';
 for(let i=0;i<10;i++){
  const next={...states,'sensor.unrelated':{state:String(i),attributes:{}},'sensor.f1':{...states['sensor.f1'],attributes:{...states['sensor.f1'].attributes,snapshot:{...original,updated_at:String(i)}}}};
  editor.hass={language:'es',states:next};editor.setConfig({entity:'',card_type:'circuit',table_height:430});
  assert.equal(editor.shadowRoot.querySelector('[name="entity"]'),sensor);assert.equal(editor.shadowRoot.activeElement,sensor);
  assert.equal(sensor.value,'sensor.f1');assert.equal(editor.shadowRoot.querySelector('[name="card_type"]'),content);
 }
 let result;editor.addEventListener('config-changed',ev=>{result=ev.detail.config;});
 sensor.dispatchEvent(new dom.window.Event('change',{bubbles:true}));assert.equal(result.entity,'sensor.f1');
 // A real catalogue change updates options without replacing the select itself.
 editor.hass={language:'es',states:{...states,'sensor.second':{entity_id:'sensor.second',attributes:{snapshot:original,friendly_name:'Second F1'}}}};
 assert.equal(editor.shadowRoot.querySelector('[name="entity"]'),sensor);assert([...sensor.options].some(o=>o.value==='sensor.second'));
 editor.remove();
});


test('independent cards default to their own content and honor changes from the visual editor',()=>{
 const {states}=setup();
 const kinds=['next','circuit','programme','driver','podium','standings','constructors','results','calendar','timing','tyres','pits'];
 for(const kind of kinds){
  const type=`custom:f1-paddock-${kind}-card`;
  const card=document.createElement(type.slice(7));
  const config={type,entity:'sensor.f1',language:'es',table_height:530,custom_option:'keep'};
  card.setConfig(config);card.hass={language:'es',states};
  assert.equal(card._config.card_type,kind);
  const editor=new F1PaddockEditor();editor.setConfig(config);editor.hass={language:'es',states};
  const select=editor.shadowRoot.querySelector('[name="card_type"]');
  assert.equal(select.value,kind);
  let emitted;editor.addEventListener('config-changed',ev=>{emitted=ev.detail.config;card.setConfig(emitted);editor.setConfig(emitted);});
  for(const choice of [...kinds,'dashboard']){
   select.value=choice;select.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
   assert.equal(emitted.card_type,choice);assert.equal(emitted.type,type);
   assert.equal(emitted.custom_option,'keep');assert.equal(emitted.table_height,530);
   assert.equal(card._config.card_type,choice);
   const expected=setup(choice).card;
   assert.deepEqual([...card.shadowRoot.querySelectorAll('h1,h2')].map(n=>n.textContent),[...expected.shadowRoot.querySelectorAll('h1,h2')].map(n=>n.textContent));
  }
 }
});


test('new cards automatically choose the sole dashboard and preserve explicit or ambiguous choices',()=>{
 const {states}=setup();const hass={language:'es',states};
 const kinds=['dashboard','next','circuit','programme','driver','podium','standings','constructors','results','calendar','timing','tyres','pits'];
 for(const kind of kinds){
  const ctor=kind==='dashboard'?F1PaddockCard:customElements.get(`f1-paddock-${kind}-card`);
  const stub=ctor.getStubConfig(hass);assert.equal(stub.entity,'sensor.f1');assert.equal(stub.card_type,kind);
  const card=new ctor();card.setConfig(stub);card.hass=hass;assert(card.shadowRoot.querySelector('ha-card'));
 }
 const editor=new F1PaddockEditor();let updates=[];editor.addEventListener('config-changed',ev=>updates.push(ev.detail.config));
 editor.setConfig({entity:'',card_type:'standings',language:'en',custom_option:'keep'});editor.hass={language:'es',states:{}};assert.equal(updates.length,0);
 editor.hass=hass;assert.equal(updates.length,1);assert.equal(updates[0].entity,'sensor.f1');assert.equal(updates[0].custom_option,'keep');
 assert.equal(editor.shadowRoot.querySelector('[name="entity"]').value,'sensor.f1');
 for(let i=0;i<3;i++)editor.hass={...hass};assert.equal(updates.length,1);
 editor.setConfig({...updates[0],entity:'sensor.explicit'});editor.hass=hass;assert.equal(editor._config.entity,'sensor.explicit');
 const two={...hass,states:{...states,'sensor.second':{attributes:{snapshot:original}}}};
 assert.equal(F1PaddockCard.getStubConfig(two).entity,'');assert.equal(F1PaddockCard.getStubConfig().entity,'');
 editor.hass=two;editor.setConfig({entity:'',card_type:'calendar'});assert.equal(editor._config.entity,'');assert.equal(updates.length,1);
});


test('shared season selector localizes current and prevents old-season readings being shown as the new year',async()=>{
 const {card,states}=setup('next');
 states['select.season']={state:'current',attributes:{options:['current','2026','2025','2024','2023']}};
 states['sensor.f1'].attributes.season_entity='select.season';
 card.hass={language:'es',states};
 let picker=card.shadowRoot.querySelector('[aria-label="Temporada"]');
 assert(picker);assert.equal(picker.value,'current');assert(picker.textContent.includes('Temporada actual (automática)'));
 let called;card.hass={language:'es',states,callService:async(...args)=>{called=args;}};
 picker.value='2023';picker.dispatchEvent(new dom.window.Event('change',{bubbles:true}));
 await Promise.resolve();assert.deepEqual(called,['select','select_option',{entity_id:'select.season',option:'2023'}]);
 states['select.season']={...states['select.season'],state:'2023'};card.hass={language:'es',states};
 assert(card.shadowRoot.textContent.includes('Cargando la temporada seleccionada'));assert(!card.shadowRoot.textContent.includes('CAMPEONATO DEL MUNDO'));
 states['sensor.f1']={...states['sensor.f1'],state:'unavailable'};card.hass={language:'es',states};
 assert(card.shadowRoot.textContent.includes('No se pudo cargar la temporada'));assert(card.shadowRoot.querySelector('[aria-label="Temporada"]'));
 card.setConfig({entity:'sensor.f1',card_type:'next',language:'en'});
 assert(card.shadowRoot.textContent.includes('Current season (automatic)'));assert(card.shadowRoot.textContent.includes('Unable to load the season'));
});
