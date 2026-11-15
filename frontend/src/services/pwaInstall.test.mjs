import test from "node:test";
import assert from "node:assert/strict";
import { createPwaInstaller, isIosDevice } from "./pwaInstall.js";

test("iPhone and iPad use manual steps without misclassifying desktop Mac or Android", () => {
  assert.equal(isIosDevice({ userAgent: "iPhone", platform: "iPhone" }), true);
  assert.equal(isIosDevice({ userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 5 }), true);
  assert.equal(isIosDevice({ userAgent: "Macintosh", platform: "MacIntel", maxTouchPoints: 0 }), false);
  assert.equal(isIosDevice({ userAgent: "Android", platform: "Linux", maxTouchPoints: 5 }), false);
});

function environment(installed = false) {
  const scope = new EventTarget();
  const media = new EventTarget();
  media.matches = installed;
  scope.matchMedia = () => media;
  scope.navigator = {};
  return scope;
}
function offer(scope, outcome = "dismissed", fails = false) {
  const event = new Event("beforeinstallprompt", { cancelable: true });
  let calls = 0;
  event.prompt = async () => { calls++; if (fails) throw Error("unavailable"); };
  event.userChoice = Promise.resolve({ outcome });
  scope.dispatchEvent(event);
  return () => calls;
}
test("captures a prompt before UI subscribes and consumes it only once", async () => {
  const scope = environment(); const service = createPwaInstaller(scope);
  const calls = offer(scope);
  assert.equal(service.getSnapshot().available, true);
  await Promise.all([service.install(), service.install()]);
  assert.equal(calls(), 1);
  assert.equal(service.getSnapshot().installed, false);
  assert.equal(service.getSnapshot().outcome, "dismissed");
  service.destroy();
});
test("acceptance alone never asserts installation; appinstalled does", async () => {
  const scope = environment(); const service = createPwaInstaller(scope);
  offer(scope, "accepted"); await service.install();
  assert.equal(service.getSnapshot().installed, false);
  scope.dispatchEvent(new Event("appinstalled"));
  assert.equal(service.getSnapshot().installed, true);
  assert.equal(service.getSnapshot().available, false);
  service.destroy();
});
test("already installed apps do not offer another prompt", async () => {
  const scope = environment(true); const service = createPwaInstaller(scope);
  const calls = offer(scope); await service.install();
  assert.equal(calls(), 0);
  service.destroy();
});
test("a failed prompt clears loading and can recover with a new browser event", async () => {
  const scope = environment(); const service = createPwaInstaller(scope);
  offer(scope, "dismissed", true); await service.install();
  assert.equal(service.getSnapshot().installing, false);
  assert.match(service.getSnapshot().error, /menú/);
  const calls = offer(scope); await service.install();
  assert.equal(calls(), 1);
  assert.equal(service.getSnapshot().error, "");
  service.destroy();
});
test("cleanup removes subscriptions to browser events", () => {
  const scope = environment(); const service = createPwaInstaller(scope);
  service.destroy(); offer(scope);
  assert.equal(service.getSnapshot().available, false);
});
