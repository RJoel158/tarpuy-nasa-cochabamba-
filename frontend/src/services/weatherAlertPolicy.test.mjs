import test from 'node:test';
import assert from 'node:assert/strict';
import { weatherAlertPolicy } from './weatherAlertPolicy.js';
const now=Date.parse('2026-11-15T04:00:00Z');
const base={weather_scope:'selected_point_model',fetched_at_utc:'2026-11-15T03:55:00Z',active_alerts:[{id:'water_deficit',severity:'critical'}]};
test('stored zonal red alert is replaced by a data quality state',()=>{
 const r=weatherAlertPolicy({...base,weather_scope:'stored_pilot_zone'},now);
 assert.equal(r.usable,false);assert.equal(r.alerts[0].id,'data_review');
});
test('old or failed point weather cannot assert a current local danger',()=>{
 assert.equal(weatherAlertPolicy({...base,fetched_at_utc:'2026-11-14T03:00:00Z'},now).usable,false);
 assert.equal(weatherAlertPolicy({...base,weather_refresh_error:true},now).usable,false);
});
test('weekly deficit is caution even during rain, not proof of current drought',()=>{
 const r=weatherAlertPolicy({...base,current_conditions:{precip_mm:20}},now);
 assert.equal(r.usable,true);assert.equal(r.alerts[0].severity,'warning');
 assert.notEqual(r.alerts[0].severity,'critical');
});
test('credible point forecast keeps acute hazards ahead of weekly deficit',()=>{
 const r=weatherAlertPolicy({...base,active_alerts:[...base.active_alerts,{id:'frost_critical',severity:'critical'}]},now);
 assert.equal(r.alerts[0].id,'frost_critical');
});
