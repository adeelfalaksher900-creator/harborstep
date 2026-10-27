import test from "node:test";
import assert from "node:assert/strict";
import { validatePlan, relevantResources, expensesTotal, displayDate, isStoredPlan, isCalendarDate } from "../src/domain.js";

test("plan requires logistics and a support need",()=>{assert.deepEqual(Object.keys(validatePlan({label:"",date:"",city:"",state:"",needs:[]})).sort(),["city","date","label","needs","state"]);});
test("resources are filtered to selected needs",()=>{const items=relevantResources(["ride"]);assert.equal(items.length,1);assert.ok(items.every(x=>x.category==="ride"));});
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
