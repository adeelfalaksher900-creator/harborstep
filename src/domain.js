export const RESOURCES = [
  { id:"acs-ride", category:"ride", name:"Road To Recovery", provider:"American Cancer Society", description:"Volunteer rides to cancer-related medical appointments where available.", caveat:"Availability varies by area and volunteer capacity. Call to ask about your appointment.", href:"https://www.cancer.org/support-programs-and-services/road-to-recovery.html", phone:"1-800-227-2345", action:"Ask about a ride" },
  { id:"acs-lodge", category:"stay", name:"Hope Lodge", provider:"American Cancer Society", description:"Free lodging for eligible patients and caregivers traveling for cancer treatment.", caveat:"Locations, availability, and eligibility vary. Contact the program before making plans.", href:"https://www.cancer.org/support-programs-and-services/patient-lodging/hope-lodge.html", phone:"1-800-227-2345", action:"Explore lodging" },
  { id:"cancercare", category:"cost", name:"Financial assistance", provider:"CancerCare", description:"Explore available financial and co-pay assistance for cancer-related costs.", caveat:"Funds and eligibility change. The provider determines whether support is available.", href:"https://www.cancercare.org/financial_assistance", action:"Check current programs" },
  { id:"triage", category:"cost", name:"Insurance & financial guidance", provider:"Triage Cancer", description:"Find practical educational resources on insurance, finances, work, and cancer rights.", caveat:"Information and assistance vary by situation and location; confirm details with the provider.", href:"https://triagecancer.org/", action:"Explore guidance" },
  { id:"csc-navigation", category:"ride", categories:["ride","stay","cost"], name:"Speak with a cancer resource navigator", provider:"Cancer Support Community", description:"A navigator can help you look for local and national transportation, lodging and financial resources. Phone and web chat are available.", caveat:"Program availability and eligibility vary; check directly with the provider.", href:"https://www.cancersupportcommunity.org/cancer-support-helpline", phone:"1-888-793-9355", action:"See hours and chat" },
  { id:"united-way-211", category:"cost", name:"Find local help with everyday costs", provider:"United Way 211", description:"Find your local 211 to ask about community resources for housing, food, bills and caregiver support.", caveat:"Available services and contact methods vary by location. 211 is not an emergency service.", href:"https://211.org/", phone:"211", action:"Find your local 211" }
];

export const NEEDS = [{id:"ride",label:"Transportation"},{id:"stay",label:"Lodging"},{id:"cost",label:"Financial support"}];
export const SUGGESTED_TASKS = {ride:"Contact a ride program to ask about availability",stay:"Ask about lodging near the appointment",cost:"Ask a financial navigator what support is open"};

// Add a suggestion only for a newly selected need, without changing existing work.
export function reconcileSuggestedTasks(previousNeeds, nextNeeds, tasks, createId) {
  const added = nextNeeds.filter(need => !previousNeeds.includes(need) && SUGGESTED_TASKS[need]);
  const existing = new Set(tasks.map(task => task.text));
  return [...tasks, ...added.filter(need => !existing.has(SUGGESTED_TASKS[need])).map(need => ({id:createId(), text:SUGGESTED_TASKS[need], done:false}))];
}
export const US_REGIONS = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","AS","GU","MP","PR","VI"];

export function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

export function validatePlan(plan) {
  const errors={};
  if (typeof plan?.label !== "string" || !plan.label.trim() || plan.label.length > 80) errors.label="Give this appointment a name (up to 80 characters).";
  if (!isCalendarDate(plan?.date)) errors.date="Choose a valid appointment date.";
  if (typeof plan?.city !== "string" || !plan.city.trim() || plan.city.length > 80) errors.city="Enter a city (up to 80 characters).";
  if (!US_REGIONS.includes(plan?.state)) errors.state="Choose a U.S. state or territory.";
  if (!Array.isArray(plan?.needs) || !plan.needs.length || plan.needs.some(n => !NEEDS.some(need => need.id === n)) || new Set(plan.needs).size !== plan.needs.length) errors.needs="Select at least one kind of support.";
  return errors;
}

// Stored browser data is untrusted: corrupted or older data must never crash rendering.
export function isStoredPlan(data) {
  if (!data || typeof data !== "object" || Object.keys(validatePlan(data.plan)).length || !Array.isArray(data.tasks) || !Array.isArray(data.expenses)) return false;
  const idsAreUnique = items => new Set(items.map(item => item.id)).size === items.length;
  return data.tasks.every(t => t && typeof t.id === "string" && t.id.length > 0 && typeof t.text === "string" && t.text.trim().length > 0 && t.text.length <= 120 && typeof t.done === "boolean") && idsAreUnique(data.tasks)
    && data.expenses.every(x => x && typeof x.id === "string" && x.id.length > 0 && typeof x.label === "string" && x.label.trim().length > 0 && x.label.length <= 80 && typeof x.amount === "number" && Number.isFinite(x.amount) && x.amount >= 0 && x.amount <= 1000000) && idsAreUnique(data.expenses);
}
export function resourceMatches(resource, category) { return (resource.categories || [resource.category]).includes(category); }
export function relevantResources(needs) { return RESOURCES.filter(resource=>needs.some(category=>resourceMatches(resource, category))); }
export function expensesTotal(expenses) { return expenses.reduce((total,item)=>total+Math.round(Number(item.amount || 0)*100),0)/100; }
export function money(value) { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(value); }
export function displayDate(value) { if (!isCalendarDate(value)) return ""; const [y,m,d]=value.split("-").map(Number); const date = new Date(0); date.setUTCFullYear(y,m-1,d); date.setUTCHours(0,0,0,0); return new Intl.DateTimeFormat("en-US",{dateStyle:"long",timeZone:"UTC"}).format(date); }

