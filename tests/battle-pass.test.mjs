import test from 'node:test';
import assert from 'node:assert/strict';

const hooks = new Map();
globalThis.Hooks = {once() {}, on(name, fn) {const list=hooks.get(name)||[];list.push(fn);hooks.set(name,list);}};
globalThis.foundry = {
 utils: {deepClone: structuredClone, escapeHTML: value=>value, randomID: ()=> 'new-id', getProperty: (value,path)=>path.split('.').reduce((entry,key)=>entry?.[key],value)},
 applications: {api: {ApplicationV2: class {}}, instances: new Map()}
};
globalThis.ui = {notifications: {info() {}, error() {}}};
const {purchase, resetMissions, BattlePass, Config} = await import('../scripts/battle-pass.js');

function fixture({shared=false}={}) {
 const config = {title:'Pass',levels:50,xpPerLevel:100,art:['preview.png'],featuredRewards:[{id:'one',art:'preview.png',uuid:'Item.reward',quantity:3,level:2,premium:true}],carouselSeconds:7,tracks:[{id:'gift',rewards:[]},{id:'glory',rewards:[]}],tabs:['Rewards','Missions','Rules'],missions:[],purchaseMode:'currency',purchaseCurrency:'gp',purchaseQuantity:10,progressMode:shared?'shared':'individual'};
 const p = {xp:100,completed:{a:true},claimed:{'gift:1:1':true},missionProgress:{a:3},glory:false};
 const actor = {system:{currency:{gp:20}},items:[],async update(changes){this.system.currency.gp=changes['system.currency.gp'];return this;},async createEmbeddedDocuments(type,docs){this.items.push(...docs);return docs;}};
 const user = {id:'player',name:'Player',character:actor,getFlag:()=>user.p,setFlag:async(namespace,key,value)=>{if(key==='progress')user.p=structuredClone(value);return user;},p:structuredClone(p)};
 const gm = {id:'gm',isGM:true,active:true};
 const list=[gm,user];list.get=id=>list.find(u=>u.id===id);
 let sharedProgress=structuredClone(p);
 globalThis.game = {user:gm,users:list,actors:[actor],items:new Map(),settings:{get:(namespace,key)=>key==='config'?config:sharedProgress,set:async(namespace,key,value)=>{sharedProgress=structuredClone(value);return value;}}};
 const source={uuid:'Item.reward',documentName:'Item',name:'Reward',type:'loot',system:{quantity:1},toObject:()=>({name:'Reward',type:'loot',system:{quantity:1}})};
 globalThis.fromUuid=async uuid=>uuid==='Item.reward'?source:null;
 return {config,user,actor,gm,p,getProgress:()=>shared?sharedProgress:user.p};
}

test('premium charges configured character currency once and refuses insufficient funds',async()=>{
 const f=fixture();
 await purchase(f.user);
 assert.equal(f.actor.system.currency.gp,10);
 assert.equal(f.user.p.glory,true);
 await assert.rejects(purchase(f.user),/already unlocked/);
 assert.equal(f.actor.system.currency.gp,10);
 f.user.p.glory=false;f.actor.system.currency.gp=9;
 await assert.rejects(purchase(f.user),/Not enough/);
 assert.equal(f.user.p.glory,false);
});

test('premium accepts inventory currency and refunds a failed progress write',async()=>{
 const f=fixture();f.config.purchaseMode='item';f.config.purchaseItem='Item.money';
 const item={uuid:'Actor.a.Item.coin',id:'coin',name:'Money',type:'loot',system:{quantity:20},getFlag:()=> 'Item.money',async update(changes){this.system.quantity=changes['system.quantity'];return this;}};
 f.actor.items.push(item);
 f.user.setFlag=async()=>{throw Error('save failed');};
 await assert.rejects(purchase(f.user),/save failed/);
 assert.equal(item.system.quantity,20);
 assert.equal(f.user.p.glory,false);
});

test('reset clears all missions while retaining EXP, claims and premium, including shared mode',async()=>{
 for(const shared of [false,true]){
  const f=fixture({shared});
  if(shared) await purchase(f.user);else f.user.p.glory=true;
  await resetMissions(f.user,true);
  const p=f.getProgress();
  assert.deepEqual(p.completed,{});assert.deepEqual(p.missionProgress,{});
  assert.equal(p.xp,100);assert.equal(p.glory,true);assert.deepEqual(p.claimed,{'gift:1:1':true});
 }
});

test('carousel is display only even when legacy featured rewards are eligible',()=>{
 const f=fixture();f.user.p.glory=true;
 const html=new BattlePass().rewardView(f.config,f.user.p);
 assert.match(html,/class="bp-carousel"/);
 assert.doesNotMatch(html,/bp-dots|data-do="featured"|Unlock featured reward|Premium · Level/);
 const editor=new Config().featuredRow(f.config.featuredRewards[0]);
 assert.doesNotMatch(editor,/f-qty|f-level|f-premium/);
});

test('old carousel images remain editable and players see premium purchase',async()=>{
 const f=fixture();f.config.featuredRewards=[];game.user=f.user;
 const pass = new BattlePass();
 assert.match(pass.rewardView({...f.config,featuredRewards:[]},f.user.p),/Buy Premium Battle Pass/);
 const html=await new Config()._renderHTML();
 assert.match(html,/class="f-art" value="preview.png"/);
 assert.match(html,/Add carousel image/);assert.match(html,/name="carouselSeconds"/);
});

test('player purchase requests are only handled by the active GM for the initiating user',async()=>{
 const f=fixture();
 const changed={flags:{'telys-battle-pass':{purchaseRequest:'request'}}};
 const listeners=hooks.get('updateUser');
 listeners.forEach(fn=>fn(f.user,changed,{},'someone-else'));
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(f.actor.system.currency.gp,20);
 listeners.forEach(fn=>fn(f.user,changed,{},f.user.id));
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(f.actor.system.currency.gp,10);
 assert.equal(f.user.p.glory,true);
});
