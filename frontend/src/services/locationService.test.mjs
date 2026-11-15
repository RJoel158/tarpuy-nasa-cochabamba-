import test from "node:test";
import assert from "node:assert/strict";
import { locateDevice, trackBestPosition } from "./locationService.js";
const position = accuracy => ({ coords: { latitude: -17.4, longitude: -66.16, accuracy } });

test("keeps the more accurate fix without accepting a worse second result", async () => {
  const values = [position(300),position(1000)];
  const result = await locateDevice({getCurrentPosition(ok, fail, options){assert.equal(options.maximumAge,0);ok(values.shift());}});
  assert.equal(result.coords.accuracy,300);
});
test("recovers a failed first attempt and stops retrying once precise", async () => {
  let count=0;
  const result=await locateDevice({getCurrentPosition(ok,fail){if(count++===0)fail({code:3});else ok(position(25));}});
  assert.equal(result.coords.accuracy,25);
  assert.equal(count,2);
});
test("does not retry denied permission or continue a cancelled request",async()=>{
  let count=0;
  await assert.rejects(locateDevice({getCurrentPosition(ok,fail){count++;fail({code:1});}}),e=>e.code===1);
  assert.equal(count,1);
  let current=true;
  const result=await locateDevice({getCurrentPosition(ok){current=false;ok(position(20));}},{isCurrent:()=>current});
  assert.equal(result,null);
});

test("waits for an updated precise position and releases the watch",async()=>{
  const cleared=[];
  const geo={watchPosition(ok){queueMicrotask(()=>{ok(position(500));ok(position(20));});return 42;},clearWatch(id){cleared.push(id);}};
  const result=await trackBestPosition(geo,{timeoutMs:100});
  assert.equal(result.coords.accuracy,20);
  assert.deepEqual(cleared,[42]);
});


test("publishes the first fix immediately and only publishes improvements", async () => {
  const updates = [];
  const geo = { watchPosition(ok) {
    queueMicrotask(() => { ok(position(500)); ok(position(900)); ok(position(130)); ok(position(30)); });
    return 7;
  }, clearWatch() {} };
  const result = await trackBestPosition(geo, { onPosition: p => updates.push(p.coords.accuracy), timeoutMs: 100 });
  assert.deepEqual(updates, [500, 130, 30]);
  assert.equal(result.coords.accuracy, 30);
});

test("returns the best approximate fix at the deadline and releases GPS", async () => {
  const cleared = [];
  const geo = { watchPosition(ok) { queueMicrotask(() => ok(position(139))); return 8; }, clearWatch(id) { cleared.push(id); } };
  const result = await trackBestPosition(geo, { timeoutMs: 15 });
  assert.equal(result.coords.accuracy, 139);
  assert.deepEqual(cleared, [8]);
});
