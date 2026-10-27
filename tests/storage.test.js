import test from "node:test";
import assert from "node:assert/strict";
import { loadPlan, clearPlan, writePlanIfUnchanged, clearPlanIfUnchanged, STORAGE_KEY } from "../src/storage.js";

test("unreadable stored data is preserved until explicitly cleared",()=>{
  const values = new Map([[STORAGE_KEY, "{incomplete"]]);
  const storage = {getItem:key=>values.get(key) ?? null, removeItem:key=>values.delete(key)};
  assert.deepEqual(loadPlan(()=>storage),{status:"corrupt",data:null,raw:"{incomplete"});
  assert.equal(values.get(STORAGE_KEY),"{incomplete");
  assert.equal(clearPlan(()=>storage),true);
  assert.equal(loadPlan(()=>storage).status,"empty");
});

test("stale tabs do not replace or remove a changed plan",()=>{
  const values=new Map();
  const storage={getItem:key=>values.get(key) ?? null,setItem:(key,value)=>values.set(key,value),removeItem:key=>values.delete(key)};
  const getStorage=()=>storage;
  const first=writePlanIfUnchanged(getStorage,{plan:"first"},null);
  assert.equal(first.status,"saved");
  assert.equal(writePlanIfUnchanged(getStorage,{plan:"stale"},null).status,"conflict");
  const second=writePlanIfUnchanged(getStorage,{plan:"second"},first.raw);
  assert.equal(second.status,"saved");
  assert.equal(clearPlanIfUnchanged(getStorage,first.raw).status,"conflict");
  assert.equal(values.get(STORAGE_KEY),second.raw);
  assert.equal(clearPlanIfUnchanged(getStorage,second.raw).status,"cleared");
  assert.equal(writePlanIfUnchanged(getStorage,{plan:"stale"},second.raw).status,"conflict");
  assert.equal(values.has(STORAGE_KEY),false);
});

test("conflict-aware operations report unavailable storage",()=>{
  const unavailable=()=>{throw new Error("denied")};
  assert.equal(writePlanIfUnchanged(unavailable,{},null).status,"unavailable");
  assert.equal(clearPlanIfUnchanged(unavailable,null).status,"unavailable");
});

test("inaccessible browser storage is reported and failed deletion is not success",()=>{
  const unavailable=()=>{throw new Error("denied")};
  assert.equal(loadPlan(unavailable).status,"unavailable");
  assert.equal(clearPlan(unavailable),false);
});

