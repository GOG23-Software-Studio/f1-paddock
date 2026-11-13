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
const {F1PaddockCard,safeAsset,countdown,nextSession,simulationTiming,ageText}=await import('../custom_components/f1_paddock/www/f1-paddock-card.js');
const original=JSON.parse(fs.readFileSync(new URL('fixtures/snapshot.json',import.meta.url)));
function setup(kind='dashboard'){
 const snapshot=structuredClone(original),id='sensor.f1',fav='select.fav',gp='select.gp';
 const states={[id]:{state:'Las Vegas',attributes:{snapshot,favorite_id:'alonso',favorite_entity:fav,round_entity:gp}},[fav]:{state:'Fernando Alonso',attributes:{options:snapshot.drivers.map(d=>d.name)}},[gp]:{state:'R20 · Brazilian Grand Prix',attributes:{options:snapshot.calendar.map(d=>`R${d.round} · ${d.name}`)}}};
 const card=new F1PaddockCard();card.setConfig({entity:id,card_type:kind});card.hass={states,callService:async()=>{}};return {card,states,snapshot};
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
 snapshot.standings[0].points=391;states['sensor.f1']={...states['sensor.f1']};card.hass={states};assert.equal(card.shadowRoot.querySelector('tbody tr'),row);assert(row.textContent.includes('391'));
});

test('unrelated HA updates do not redraw a card',()=>{
 const {card,states}=setup('driver');const old=card.render;let count=0;card.render=()=>{count++;old.call(card);};
 for(let i=0;i<10;i++)card.hass={states:{...states,'sensor.unrelated':{state:String(i)}}};assert.equal(count,0);
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
 states['sensor.f1']={...states['sensor.f1']};card.hass={states};
 const row=card.shadowRoot.querySelector('tbody tr');assert(row.querySelector('[aria-label="1:21.001 · Mejora personal"]'));assert(row.querySelector('[aria-label="24.001 · Mejor de la sesión"]'));assert(!row.querySelector('[aria-label^="28.002"]'));assert(!row.querySelector('[aria-label^="null"]'));
 assert(card.shadowRoot.textContent.includes('Sin marca, el tiempo queda neutro'));
});

test('favorite stands out and data source age stays separate from receipt time',()=>{
 const {card,snapshot}=setup('timing');const now=Date.now();snapshot.timing.source_time=new Date(now-86400000).toISOString();snapshot.timing.timing_received_at=new Date(now).toISOString();card.render();
 assert(card.shadowRoot.querySelector('.favorite-row[aria-current="true"] .your-driver'));assert(card.shadowRoot.querySelector('.favorite-row').textContent.includes('Fernando'));
 assert(card.shadowRoot.querySelector('.freshness').textContent.includes('hace 1 d'));assert(card.shadowRoot.querySelector('.freshness').textContent.includes('Recibidos en HA:'));
 assert.equal(ageText(null,now),'Hora no disponible');assert.equal(ageText(new Date(now-65000).toISOString(),now),'hace 1 min');assert.equal(ageText(new Date(now+60000).toISOString(),now),'Hora no disponible');
});
