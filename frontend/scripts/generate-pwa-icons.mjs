import { build } from "esbuild";
import { Resvg } from "@resvg/resvg-js";
import { createRequire } from "node:module";
import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const temp = path.join(root, ".pwa-icon-render.cjs");
try {
  await build({ stdin: { contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import {PersonajeGuia} from './src/components/personality/PersonajeGuia.jsx'; export default renderToStaticMarkup(React.createElement(PersonajeGuia,{pose:'saludo',size:120}));`, resolveDir: root }, bundle: true, platform: "node", format: "cjs", outfile: temp });
  const markup = createRequire(import.meta.url)(temp).default;
  const css = await readFile(path.join(root, "src/styles/tokens.css"), "utf8");
  const palette = {};
  for (const match of css.matchAll(/(--[\w-]+):\s*(#[\da-fA-F]{3,8})\s*;/g)) palette[match[1]] ??= match[2];
  const original = markup.match(/<svg[\s\S]*?<\/svg>/)[0].replace(/var\((--[\w-]+)\)/g, (_, key) => {
    if (!palette[key]) throw new Error(`Unknown brand colour: ${key}`);
    return palette[key];
  });
  const inner = original.replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "");
  const out = path.join(root, "public/icons");
  await mkdir(out, { recursive: true });
  for (const [name, size, padding] of [["tarpuy-180",180,16],["tarpuy-192",192,16],["tarpuy-512",512,16],["tarpuy-maskable-512",512,32]]) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 192 192"><rect width="192" height="192" fill="${palette['--papel']}"/><svg x="${padding}" y="${padding}" width="${192-padding*2}" height="${192-padding*2}" viewBox="0 0 120 120" fill="none">${inner}</svg></svg>`;
    await writeFile(path.join(out, `${name}.png`), new Resvg(svg).render().asPng());
  }
  console.log("Generated four Tarpuy icons from the existing Mamá Tomasa SVG.");
} finally { await unlink(temp).catch(() => {}); }
