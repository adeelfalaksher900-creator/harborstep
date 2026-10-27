import { isStoredPlan } from "./domain.js";

export const STORAGE_KEY = "harborstep-plan-v1";

// Accessing localStorage itself can throw (for example in restricted browsing modes).
export function loadPlan(getStorage) {
  try {
    const raw = getStorage().getItem(STORAGE_KEY);
    if (raw === null) return { status: "empty", data: null };
    try {
      const data = JSON.parse(raw);
      return isStoredPlan(data) ? { status: "ready", data } : { status: "corrupt", data: null };
    } catch {
      return { status: "corrupt", data: null };
    }
  } catch {
    return { status: "unavailable", data: null };
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
