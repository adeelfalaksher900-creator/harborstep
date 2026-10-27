import test from "node:test";
import assert from "node:assert/strict";
import { loadPlan, clearPlan, STORAGE_KEY } from "../src/storage.js";

test("unreadable stored data is preserved until explicitly cleared",()=>{
  const values = new Map([[STORAGE_KEY, "{incomplete"]]);
  const storage = {getItem:key=>values.get(key) ?? null, removeItem:key=>values.delete(key)};
  assert.deepEqual(loadPlan(()=>storage),{status:"corrupt",data:null});
  assert.equal(values.get(STORAGE_KEY),"{incomplete");
  assert.equal(clearPlan(()=>storage),true);
  assert.equal(loadPlan(()=>storage).status,"empty");
});

test("inaccessible browser storage is reported and failed deletion is not success",()=>{
  const unavailable=()=>{throw new Error("denied")};
  assert.equal(loadPlan(unavailable).status,"unavailable");
  assert.equal(clearPlan(unavailable),false);
});
