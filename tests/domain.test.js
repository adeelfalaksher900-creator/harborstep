import test from "node:test";
import assert from "node:assert/strict";
import { validatePlan, relevantResources, expensesTotal, displayDate } from "../src/domain.js";

test("plan requires logistics and a support need",()=>{assert.deepEqual(Object.keys(validatePlan({label:"",date:"",city:"",state:"",needs:[]})).sort(),["city","date","label","needs","state"]);});
test("resources are filtered to selected needs",()=>{const items=relevantResources(["ride"]);assert.equal(items.length,1);assert.ok(items.every(x=>x.category==="ride"));});
test("expenses sum decimal amounts and date stays on selected calendar day",()=>{assert.equal(expensesTotal([{amount:"5.50"},{amount:"4"}]),9.5);assert.equal(displayDate("2026-10-28"),"October 28, 2026");});
