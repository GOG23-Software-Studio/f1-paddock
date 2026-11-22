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
const {F1PaddockCard,safeAsset,countdown,nextSession,ageText,dateText,resolveLanguage,translate,F1PaddockEditor,TEAM_CARS_2026,teamCarImage}=await import('../custom_components/f1_paddock/www/f1-paddock-card.js');
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

test('English warnings and empty data are localized without changing source readings',()=>{
 for(const kind of ['dashboard','results','circuit','programme','driver']){
  const {card,states,snapshot}=setup(kind);snapshot.warnings=['source:cached'];
  if(kind==='circuit'||kind==='programme')snapshot.event=null;
  if(kind==='driver')snapshot.drivers=[];
  card.setConfig({entity:'sensor.f1',card_type:kind,language:'en'});card.hass={language:'es',states};
  const text=card.shadowRoot.textContent;
  assert(!text.includes('Información parcial'),kind);assert(!text.includes('Temporada finalizada'),kind);assert(!text.includes('Programa no disponible'),kind);
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


test('position road keeps driver nodes and scroll across overtakes and only moves with fresh data',()=>{
 const {card,states,snapshot}=setup('road');document.body.append(card);
 const alonso=snapshot.drivers.find(d=>d.id==='alonso'),other=snapshot.drivers.find(d=>d.id!=='alonso');
 const now=new Date().toISOString();
 snapshot.timing={phase:'live',live:true,connected:true,source_time:now,rows:[{...alonso,position:2,interval:'+0.250',gap:'+0.250',team_color:'229971'},{...other,position:1}]};card.render();
 const root=card.shadowRoot,marker=root.querySelector('[data-road-driver="alonso"]'),road=root.querySelector('[data-scroll="road"]');
 assert(marker.getAttribute('aria-current'));assert(root.querySelector('.road-detail').textContent.includes('+0.250'));assert(marker.style.cssText.includes('#229971'));assert(root.querySelector('.road-live'));
 const before=marker.style.transform;road.scrollLeft=120;road.focus();
 snapshot.timing.rows[0].position=1;snapshot.timing.rows[1].position=2;card.render();
 assert.equal(root.querySelector('[data-road-driver="alonso"]'),marker);assert.notEqual(marker.style.transform,before);assert.equal(road.scrollLeft,120);assert.equal(root.activeElement,road);
 snapshot.timing.rows.push({id:'aaa-new',name:'New',number:99,position:3,gap:'+1 LAP',team_color:'red;position:fixed'});card.render();
 assert.equal(root.querySelector('[data-road-driver="alonso"]'),marker);assert(root.querySelector('[data-road-driver="aaa-new"] button').title.includes('+1 LAP'));assert(!root.querySelector('[style*="position:fixed"]'));
 snapshot.timing.source_time=new Date(Date.now()-180000).toISOString();card.render();assert(!root.querySelector('.road-live'));
 snapshot.timing.phase='finished';card.render();assert(!root.querySelector('.road-live'));
 card.setConfig({entity:'sensor.f1',card_type:'road',language:'en'});assert(root.textContent.includes('Position road'));assert(root.textContent.includes('To car ahead'));assert(root.textContent.includes('not proportional'));card.remove();
});

test('position road shows unavailable gaps without inventing values or cars',()=>{
 const {card,snapshot}=setup('road');snapshot.timing={rows:[]};card.render();
 assert(!card.shadowRoot.querySelector('.road-marker'));assert(card.shadowRoot.textContent.includes('Sin posiciones publicadas'));
 const ctor=customElements.get('f1-paddock-road-card');assert.equal(ctor.getStubConfig().card_type,'road');
 snapshot.timing.rows=[{id:'test',name:'<img onerror=alert(1)>',position:2,number:7,interval:null,gap:null,retired:true}];card.render();
 const marker=card.shadowRoot.querySelector('.road-marker');assert(marker.querySelector('button').title.includes('Al anterior: —'));assert(card.shadowRoot.querySelector('.road-detail').textContent.includes('Retirado'));assert(!marker.querySelector('img'));
});

test('two-lane road moves a car forward when its published interval shrinks without changing rank',()=>{
 const {card,snapshot}=setup('road');
 const now=new Date().toISOString();
 snapshot.timing={phase:'live',live:true,connected:true,source_time:now,rows:[
  {id:'leader',name:'Leader',position:1,number:1},
  {id:'alonso',name:'Alonso',position:2,number:14,interval:'+2.000'},
  {id:'third',name:'Third',position:3,number:3,interval:'+0.500'}]};card.render();
 const root=card.shadowRoot,car=root.querySelector('[data-road-driver="alonso"]');
 const position=node=>node.style.transform.match(/translate\(([-\d.]+)px,([-\d.]+)px\)/).slice(1).map(Number);
 const original=position(car);
 assert.notEqual(original[1],position(root.querySelector('[data-road-driver="leader"]'))[1]);
 assert(position(root.querySelector('[data-road-driver="leader"]'))[0]>original[0]);
 snapshot.timing.rows[1].interval='+0.200';card.render();
 const closer=position(car);assert(closer[0]>original[0]);assert.equal(closer[1],original[1]);
 snapshot.timing.rows[1].interval='+3.000';card.render();assert(position(car)[0]<closer[0]);
 snapshot.timing.rows[1].interval='1L';card.render();assert(!car.getAttribute('style').includes('NaN'));
 assert.equal(root.querySelector('[data-road-driver="alonso"]'),car);
 snapshot.timing.phase='finished';card.render();assert(!root.querySelector('.road-live'));
});

test('road car selection shows one detail panel and never changes the HA favorite',()=>{
 const {card,states,snapshot}=setup('road');
 snapshot.timing={phase:'finished',rows:[snapshot.drivers.find(d=>d.id==='alonso'),snapshot.drivers.find(d=>d.id!=='alonso')].map((d,i)=>({...d,position:i+1,interval:'+0.200',gap:'+0.200'}))};card.render();
 const root=card.shadowRoot,road=root.querySelector('.road-scroll');road.scrollLeft=-100;road.scrollTo=()=>{};
 const other=root.querySelector('.road-marker:not(.road-favorite) .road-pick'),id=other.dataset.driver;
 other.click();assert.equal(root.querySelectorAll('.road-detail').length,1);
 assert.equal(root.querySelector('[aria-pressed="true"]').dataset.driver,id);
 assert(root.querySelector('.road-detail').textContent.includes(snapshot.timing.rows.find(d=>String(d.id||d.number)===id).name));
 assert.equal(road.scrollLeft,-100);assert.equal(states['sensor.f1'].attributes.favorite_id,'alonso');
 assert(!root.querySelector('.road-marker strong'));assert(!root.querySelector('.road-marker small'));
 root.querySelector('[data-action="road-favorite"]').click();
 assert.equal(root.querySelector('[aria-pressed="true"]').dataset.driver,'alonso');
});

test('real car photos match verified 2026 teams and never borrow a future-season car',()=>{
 assert.equal(TEAM_CARS_2026.length,11);
 for(const asset of TEAM_CARS_2026){
  assert.equal(teamCarImage(2026,asset.team),asset);
  assert(safeAsset(asset.url));assert(asset.url.includes('/common/f1/2026/'));assert(asset.url.endsWith('carright.webp'));
 }
 const {card,snapshot}=setup('road');
 snapshot.timing={phase:'finished',rows:[{id:'alonso',code:'ALO',name:'Fernando Alonso',number:14,team:'Aston Martin',position:1}]};card.render();
 const root=card.shadowRoot,img=root.querySelector('.road-car');
 assert(img.src.includes('2026astonmartincarright.webp'));assert(root.querySelector('.road-rank').textContent.includes('#14'));assert(!root.querySelector('svg'));
 img.dispatchEvent(new dom.window.Event('error'));assert(img.hidden);assert(!img.nextElementSibling.hidden);
 card.render();assert(!root.querySelector('img.road-car'));assert(root.querySelector('.road-missing').textContent.includes('#14'));
 snapshot.season=2023;card.render();assert(!root.querySelector('img.road-car'));
 assert.equal(teamCarImage(2026,'unknown-team'),null);assert.equal(teamCarImage(2025,'Aston Martin'),null);
});


test('only real-data cards are available and old test configuration cannot generate readings',()=>{
 const {card,states,snapshot}=setup('simulation');
 assert.equal(card._config.card_type,'timing');assert.equal(card._data.timing,snapshot.timing);
 assert(!card.shadowRoot.querySelector('[data-action="road-demo"]'));
 const editor=new F1PaddockEditor();editor.setConfig({entity:'sensor.f1'});editor.hass={language:'en',states};
 assert(!Array.from(editor.shadowRoot.querySelector('[name="card_type"]').options).some(o=>o.value==='simulation'));
 assert(!card.shadowRoot.textContent.includes('SIMULACIÓN'));assert(!card.shadowRoot.textContent.includes('Probar simulación'));
});

 test('favorite card uses explicit finished race retirement when results are unavailable, without footer warnings',()=>{
 const {card,snapshot}=setup('driver');snapshot.last_race=null;snapshot.warnings=['calendar:backup'];
 snapshot.timing={phase:'finished',session_type:'Race',name:'Race',event:'Las Vegas Grand Prix',start:'2026-11-22T04:00:00Z',rows:[{id:'alonso',retired:true}]};card.render();
 assert(card.shadowRoot.querySelector('.result-summary h3').textContent.includes('Abandono'));
 assert(card.shadowRoot.querySelector('.result-summary').textContent.includes('Las Vegas'));
 assert(!card.shadowRoot.querySelector('.driver [role="status"]'));
 card.hass={language:'en',states:card._hass.states};assert(card.shadowRoot.querySelector('.result-summary h3').textContent.includes('Retired'));
 snapshot.timing.rows[0].retired=false;card.render();assert(!card.shadowRoot.querySelector('.result-summary h3').textContent.includes('Retired'));
 snapshot.timing.rows[0].retired=true;snapshot.timing.name='Sprint';card.render();assert(!card.shadowRoot.querySelector('.result-summary h3').textContent.includes('Retired'));
 });
