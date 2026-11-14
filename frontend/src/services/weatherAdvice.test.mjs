import test from "node:test";
import assert from "node:assert/strict";
import { buildDayInterpretation as advice } from "./weatherAdvice.js";
const base={date:"2027-01-20",temp_min_c:12.4,temp_max_c:23.1,precip_mm:7.7,precip_prob_pct:100,et0_mm:4.5,wind_kmh:10};
const now=new Date("2027-01-19T12:00:00-04:00");
const run=day=>advice(day,{},"es",now);
test("rain and dry reference deficit produce different, evidenced actions",()=>{
  const wet=run(base), dry=run({...base,precip_mm:0,et0_mm:6.6});
  assert.ok(wet.actions.some(a=>a.id==="rain"&&a.reason.includes("7,7")));
  assert.ok(dry.actions.some(a=>a.id==="reference_deficit"));
  assert.notEqual(wet.adviceText,dry.adviceText);
  assert.ok(dry.adviceText.includes("no es una dosis de riego"));
});
test("preserves simultaneous cold, rain accumulation and wind hazards",()=>{
  const result=run({...base,temp_min_c:-2,precip_mm:25,wind_kmh:25});
  assert.deepEqual(result.actions.map(a=>a.id),["cold","rain_accumulation","wind"]);
});
test("missing values do not become zero or trigger a false frost",()=>{
  const result=run({date:base.date,temp_min_c:null,precip_mm:"",et0_mm:undefined});
  assert.equal(result.actions[0].id,"check");
  assert.ok(result.dayText.includes("Falta"));
  assert.ok(!result.actions.some(a=>a.id==="cold"));
});
test("past data asks for an update instead of giving today's farming advice",()=>{
  const result=run({...base,date:"2027-01-18",temp_min_c:-4});
  assert.equal(result.expired,true);
  assert.deepEqual(result.actions.map(a=>a.id),["expired"]);
});
