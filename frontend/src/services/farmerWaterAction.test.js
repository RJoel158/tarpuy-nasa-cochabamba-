import test from 'node:test';
import assert from 'node:assert/strict';
import { decideFarmerWaterAction } from './farmerWaterAction.js';
import { waterActionText } from '../utils/quechuaI18n.js';
import { buildWaterActionNarration } from './narration.js';
const now=Date.parse('2026-11-15T05:00:00Z');
const sample=(extra={})=>({weather_scope:'selected_point_model',fetched_at_utc:'2026-11-15T04:55:00Z',current_conditions:{observed_at:'2026-11-15T00:55',precip_mm:0,soil_moisture_top_pct:30},seven_day_forecast:[{date:'2026-11-15',precip_mm:1,temp_min_c:12}],predictions_summary:{net_water_balance_7d_mm:-20},...extra});
test('weekly deficit with moist surface never orders irrigation',()=>{
 const a=decideFarmerWaterAction(sample(),null,now); assert.equal(a.reason,'reference_deficit'); assert.notEqual(a.code,'IRRIGATE');
});
test('current modeled rain overrides weekly deficit and dry surface',()=>{
 const a=decideFarmerWaterAction(sample({current_conditions:{observed_at:'2026-11-15T00:55',precip_mm:2,soil_moisture_top_pct:10}}),null,now); assert.equal(a.reason,'current_rain');assert.notEqual(a.code,'IRRIGATE');
});
test('stale current rain is not presented as current',()=>{
 const a=decideFarmerWaterAction(sample({current_conditions:{observed_at:'2026-11-14T16:45',precip_mm:2}}),null,now);assert.notEqual(a.reason,'current_rain');
});
test('old, failed or zonal weather asks to confirm data',()=>{
 for(const extra of [{weather_scope:'stored_pilot_zone'},{weather_refresh_error:true},{fetched_at_utc:'2026-11-14T12:00:00Z'}]) assert.equal(decideFarmerWaterAction(sample(extra),null,now).reason,'data_review');
});
test('daily accumulation does not claim an hour or an observed flood',()=>{
 const a=decideFarmerWaterAction(sample({seven_day_forecast:[{date:'2026-11-15',precip_mm:30,temp_min_c:10}]}),null,now);assert.equal(a.reason,'rain_forecast');assert.match(a.presentation.message,/podría/);
});
test('municipal drainage is context, not a flood sensor',()=>{
 const a=decideFarmerWaterAction(sample(),{tipo:'Quebrada'},now);assert.equal(a.reason,'drainage');assert.match(a.presentation.message,/no confirma inundación/);
});
test('audio includes the same cause, consequence and action as the card',()=>{
 const a=decideFarmerWaterAction(sample(),null,now);const t=waterActionText(a,'es');const spoken=buildWaterActionNarration(a,'es');
 for(const part of [t.title,t.message,t.instruction])assert.ok(spoken.includes(part));
 assert.equal(waterActionText(a,'qu').language,'es');
});
