import { isStoredPlan } from "./domain.js";

export const STORAGE_KEY = "harborstep-plan-v1";

// Accessing localStorage itself can throw (for example in restricted browsing modes).
export function loadPlan(getStorage) {
  try {
    const raw = getStorage().getItem(STORAGE_KEY);
    if (raw === null) return { status: "empty", data: null, raw: null };
    try {
      const data = JSON.parse(raw);
      return isStoredPlan(data) ? { status: "ready", data, raw } : { status: "corrupt", data: null, raw };
    } catch {
      return { status: "corrupt", data: null, raw };
    }
  } catch {
    return { status: "unavailable", data: null, raw: null };
  }
}

// localStorage has no atomic compare-and-swap: simultaneous operations can still race.
export function writePlanIfUnchanged(getStorage, data, expectedRaw) {
  try {
    const storage = getStorage();
    if (storage.getItem(STORAGE_KEY) !== expectedRaw) return { status: "conflict" };
    const raw = JSON.stringify(data);
    storage.setItem(STORAGE_KEY, raw);
    return { status: "saved", raw };
  } catch {
    return { status: "unavailable" };
  }
}

export function clearPlanIfUnchanged(getStorage, expectedRaw) {
  try {
    const storage = getStorage();
    if (storage.getItem(STORAGE_KEY) !== expectedRaw) return { status: "conflict" };
    storage.removeItem(STORAGE_KEY);
    return { status: "cleared" };
  } catch {
    return { status: "unavailable" };
  }
}

export function clearPlan(getStorage) {
  try {
    getStorage().removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

