import test from 'node:test';
import assert from 'node:assert/strict';
import {carouselEntries,startCarousel} from '../scripts/carousel.mjs';

test('legacy Item UUIDs and linked compendium rewards resolve to artwork',async()=>{
 const config={art:['Item.one','bad.png','custom.webp'],featuredRewards:[{art:'bad.png',uuid:'Compendium.cones.items.Item.two'}]};
 const entries=await carouselEntries(config,async uuid=>({img:uuid==='Item.one'?'one.webp':'two.webp',name:'Light Cone'}));
 assert.deepEqual(entries.map(entry=>entry.sources),[['one.webp'],['bad.png','two.webp'],['custom.webp']]);
});

test('carousel falls back to Item artwork, fades one image at a time and stops on close',async()=>{
 const original={Image:globalThis.Image,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
 const timers=new Map(),transitions=[];let id=0;
 globalThis.setTimeout=(fn,ms)=>{timers.set(++id,{fn,ms});return id;};
 globalThis.clearTimeout=id=>timers.delete(id);
 globalThis.Image=class{set src(src){queueMicrotask(()=>src==='bad.png'?this.onerror?.():this.onload?.());}};
 const image={hidden:true,animate(frames){transitions.push(frames.map(frame=>frame.opacity));return{finished:Promise.resolve(),cancel(){}};}};
 const status={hidden:true};
 const container={querySelector:selector=>selector==='img'?image:status};
 try {
  const stop=startCarousel(container,[{sources:['bad.png','one.webp'],name:'First'},{sources:['two.webp'],name:'Second'}],2);
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(image.src,'one.webp');assert.equal(image.hidden,false);
  const [timerId,timer]=[...timers.entries()].find(([,timer])=>timer.ms===2000);
  timers.delete(timerId);timer.fn();
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(image.src,'two.webp');assert.equal(image.alt,'Second');
  assert.deepEqual(transitions,[[0,1],[1,0],[0,1]]);
  stop();assert.equal(timers.size,0);
 } finally {Object.assign(globalThis,original);}
});
