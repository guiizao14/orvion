import { readFile, writeFile } from "node:fs/promises";
const file = await readFile("public/brand/symbol-light.svg", "utf8");
const style = `<style>path{stroke:#FF5A5F;stroke-width:3;stroke-dasharray:100;animation:draw 1.6s ease both}@keyframes draw{0%{fill-opacity:0;stroke-dashoffset:100;stroke-opacity:1}65%{fill-opacity:0;stroke-dashoffset:0;stroke-opacity:1}100%{fill-opacity:1;stroke-dashoffset:0;stroke-opacity:0}}@media(prefers-reduced-motion:reduce){path{animation:none;stroke:none}}</style>`;
await writeFile(
  "public/brand/symbol-animated.svg",
  file
    .replace('fill="none">', 'fill="none">' + style)
    .replaceAll("<path ", '<path pathLength="100" '),
);
