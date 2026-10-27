import test from "node:test";
import assert from "node:assert/strict";
import { validatePlan, relevantResources, resourceMatches, expensesTotal, displayDate, isStoredPlan, isCalendarDate, reconcileSuggestedTasks, SUGGESTED_TASKS } from "../src/domain.js";

test("new support needs add suggestions without deleting or duplicating existing work",()=>{
  const tasks=[{id:"1",text:SUGGESTED_TASKS.ride,done:true},{id:"2",text:"Ask clinic",done:false}];
  let nextId=3;
  const updated=reconcileSuggestedTasks(["ride"],["stay","cost"],tasks,()=>String(nextId++));
  assert.deepEqual(updated.slice(0,2),tasks);
  assert.deepEqual(updated.slice(2).map(t=>t.text),[SUGGESTED_TASKS.stay,SUGGESTED_TASKS.cost]);
  const again=reconcileSuggestedTasks(["stay","cost"],["ride","stay","cost"],updated,()=>String(nextId++));
  assert.deepEqual(again,updated);
});

test("plan requires logistics and a support need",()=>{assert.deepEqual(Object.keys(validatePlan({label:"",date:"",city:"",state:"",needs:[]})).sort(),["city","date","label","needs","state"]);});
test("resources are filtered to selected needs",()=>{const items=relevantResources(["ride"]);assert.ok(items.some(x=>x.id==="acs-ride"));assert.ok(items.every(x=>resourceMatches(x,"ride")));assert.equal(items.some(x=>x.id==="united-way-211"),false);});
test("a multi-need navigator appears once and remains available in each applicable filter",()=>{const items=relevantResources(["ride","stay","cost"]);const navigator=items.find(x=>x.id==="csc-navigation");assert.ok(navigator);assert.equal(items.filter(x=>x.id==="csc-navigation").length,1);for(const need of ["ride","stay","cost"])assert.equal(resourceMatches(navigator,need),true);});
test("CancerCare navigation is listed for transport and costs without duplicates",()=>{const items=relevantResources(["ride","cost"]);const item=items.find(x=>x.id==="cancercare-navigation");assert.ok(item);assert.equal(items.filter(x=>x.id===item.id).length,1);assert.equal(resourceMatches(item,"ride"),true);assert.equal(resourceMatches(item,"cost"),true);assert.equal(resourceMatches(item,"stay"),false);});
test("expenses sum decimal amounts and date stays on selected calendar day",()=>{assert.equal(expensesTotal([{amount:"5.50"},{amount:"4"}]),9.5);assert.equal(displayDate("2026-10-28"),"October 28, 2026");});


test("calendar dates and U.S. regions are validated",()=>{
  const plan={label:"Visit",date:"2026-02-29",city:"Boston",state:"ZZ",needs:["ride"]};
  assert.deepEqual(Object.keys(validatePlan(plan)).sort(),["date","state"]);
  assert.equal(isCalendarDate("2024-02-29"),true);
  assert.equal(isCalendarDate("1900-02-29"),false);
  assert.equal(displayDate("2026-02-29"),"");
});

test("invalid or corrupted stored plans cannot reach the interface",()=>{
  const valid={plan:{label:"Visit",date:"2026-10-28",city:"Boston",state:"MA",needs:["ride"]},tasks:[{id:"1",text:"Call",done:false}],expenses:[{id:"2",label:"Parking",amount:12.5}]};
  assert.equal(isStoredPlan(valid),true);
  assert.equal(isStoredPlan({...valid,plan:{...valid.plan,needs:null}}),false);
  assert.equal(isStoredPlan({...valid,tasks:[null]}),false);
  assert.equal(isStoredPlan({...valid,expenses:[{id:"2",label:"Parking",amount:"not money"}]}),false);
  assert.equal(isStoredPlan({...valid,tasks:[valid.tasks[0],valid.tasks[0]]}),false);
});

test("expense totals avoid floating point display errors",()=>{
  assert.equal(expensesTotal([{amount:0.1},{amount:0.2}]),0.3);
});

