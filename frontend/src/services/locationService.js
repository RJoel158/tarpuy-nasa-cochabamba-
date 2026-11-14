function readPosition(geolocation, options) {
  return new Promise((resolve, reject) => geolocation.getCurrentPosition(resolve, reject, options));
}

const valid = (position) => {
  const c = position?.coords;
  return c && Number.isFinite(c.latitude) && Math.abs(c.latitude) <= 90
    && Number.isFinite(c.longitude) && Math.abs(c.longitude) <= 180
    && Number.isFinite(c.accuracy) && c.accuracy >= 0;
};

export async function locateDevice(geolocation, { isCurrent = () => true, onRetry = () => {} } = {}) {
  if (typeof geolocation.watchPosition === "function") {
    return trackBestPosition(geolocation, { isCurrent, onRetry });
  }
  let best = null;
  let failure;
  for (const options of [
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
  ]) {
    if (!isCurrent()) return null;
    try {
      const position = await readPosition(geolocation, options);
      if (!isCurrent()) return null;
      if (!valid(position)) throw Object.assign(new Error("Invalid location"), { code: 2 });
      if (!best || position.coords.accuracy < best.coords.accuracy) best = position;
      if (best.coords.accuracy <= 75) return best;
    } catch (error) {
      failure = error;
      if (error.code === 1) throw error;
    }
    if (isCurrent()) onRetry(best?.coords.accuracy);
  }
  if (best) return best;
  throw failure || Object.assign(new Error("Location unavailable"), { code: 2 });
}

// Network fixes can arrive before the more precise fix. Keep listening briefly.
export function trackBestPosition(geolocation, { isCurrent = () => true, onRetry = () => {}, timeoutMs = 20000 } = {}) {
  return new Promise((resolve, reject) => {
    let best=null, watchId, settled=false;
    const finish=(error)=>{
      if(settled) return;
      settled=true;
      clearTimeout(deadline); clearInterval(cancellation);
      if(watchId!==undefined) geolocation.clearWatch(watchId);
      if(!isCurrent()) resolve(null);
      else if(best) resolve(best);
      else reject(error || Object.assign(new Error("Location unavailable"),{code:3}));
    };
    const deadline=setTimeout(()=>finish(),timeoutMs);
    const cancellation=setInterval(()=>{if(!isCurrent())finish();},100);
    try {
      watchId=geolocation.watchPosition(position=>{
        if(!isCurrent()){finish();return;}
        if(!valid(position))return;
        if(!best || position.coords.accuracy<=best.coords.accuracy)best=position;
        if(best.coords.accuracy<=50)finish();
        else onRetry(best.coords.accuracy);
      },error=>{
        if(error.code===1)finish(error);
        // Transient errors do not discard an already obtained fix.
      },{enableHighAccuracy:true,maximumAge:0,timeout:timeoutMs});
      if(settled)geolocation.clearWatch(watchId);
    } catch(error){finish(error);}
  });
}
