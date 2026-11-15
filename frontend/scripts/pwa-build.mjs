import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export function pwaBuild() {
  let assets = [];
  let buildId = "";
  return {
    name: "tarpuy-pwa-precache",
    apply: "build",
    generateBundle(_, bundle) {
      assets = Object.keys(bundle).filter(name => /\.(js|css)$/.test(name)).map(name => `/${name}`);
      buildId = createHash("sha256").update(JSON.stringify(assets)).digest("hex").slice(0, 12);
      this.emitFile({ type: "asset", fileName: "precache-manifest.json", source: JSON.stringify(assets) });
    },
    async writeBundle(options) {
      const swPath = path.resolve(options.dir, "sw.js");
      const template = await readFile(swPath, "utf8");
      const hash = createHash("sha256").update(buildId).update(template);
      // Public files do not receive Vite hashes; include them in the shell version.
      for (const name of ["index.html", "manifest.json", "icons/tarpuy-180.png", "icons/tarpuy-192.png", "icons/tarpuy-512.png", "icons/tarpuy-maskable-512.png"]) hash.update(await readFile(path.resolve(options.dir, name)));
      buildId = hash.digest("hex").slice(0, 12);
      await writeFile(swPath, template.replaceAll("__BUILD_ID__", buildId));
    },
  };
}
