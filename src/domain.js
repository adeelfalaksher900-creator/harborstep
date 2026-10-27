export const RESOURCES = [
  { id:"acs-ride", category:"ride", name:"Road To Recovery", provider:"American Cancer Society", description:"Volunteer rides to cancer-related medical appointments where available.", caveat:"Availability varies by area and volunteer capacity. Call to ask about your appointment.", href:"https://www.cancer.org/support-programs-and-services/road-to-recovery.html", phone:"1-800-227-2345", action:"Ask about a ride" },
  { id:"acs-lodge", category:"stay", name:"Hope Lodge", provider:"American Cancer Society", description:"Free lodging for eligible patients and caregivers traveling for cancer treatment.", caveat:"Locations, availability, and eligibility vary. Contact the program before making plans.", href:"https://www.cancer.org/support-programs-and-services/patient-lodging/hope-lodge.html", phone:"1-800-227-2345", action:"Explore lodging" },
  { id:"cancercare", category:"cost", name:"Financial assistance", provider:"CancerCare", description:"Explore available financial and co-pay assistance for cancer-related costs.", caveat:"Funds and eligibility change. The provider determines whether support is available.", href:"https://www.cancercare.org/financial_assistance", action:"Check current programs" },
  { id:"triage", category:"cost", name:"Insurance & financial guidance", provider:"Triage Cancer", description:"Find practical educational resources on insurance, finances, work, and cancer rights.", caveat:"Information and assistance vary by situation and location; confirm details with the provider.", href:"https://triagecancer.org/", action:"Explore guidance" }
];

export const NEEDS = [{id:"ride",label:"Transportation"},{id:"stay",label:"Lodging"},{id:"cost",label:"Financial support"}];
export function validatePlan(plan) {
  const errors={};
  if (!plan.label.trim()) errors.label="Give this appointment a name.";
  if (!plan.date || !/^\d{4}-\d{2}-\d{2}$/.test(plan.date)) errors.date="Choose an appointment date.";
  if (!plan.city.trim()) errors.city="Enter a city.";
  if (!/^[A-Z]{2}$/.test(plan.state)) errors.state="Choose a U.S. state or territory.";
  if (!plan.needs.length) errors.needs="Select at least one kind of support.";
  return errors;
}
export function relevantResources(needs) { return RESOURCES.filter(r=>needs.includes(r.category)); }
export function expensesTotal(expenses) { return expenses.reduce((total,item)=>total+Number(item.amount||0),0); }
export function money(value) { return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(value); }
export function displayDate(value) { if (!value) return ""; const [y,m,d]=value.split("-").map(Number); return new Intl.DateTimeFormat("en-US",{dateStyle:"long",timeZone:"UTC"}).format(new Date(Date.UTC(y,m-1,d))); }
