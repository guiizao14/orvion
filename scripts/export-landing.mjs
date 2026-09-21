import { cp, mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";

// Run after vite build. Export only the public landing, never the dashboard.
const destination = resolve("dist/landing-site");
await mkdir(resolve(destination, "assets"), { recursive: true });
await cp("dist/landing/index.html", resolve(destination, "index.html"));
await cp("dist/brand", resolve(destination, "brand"), { recursive: true });
for (const file of await readdir("dist/assets")) {
  if (/^(landing-|manrope-|modulepreload-)/.test(file)) {
    await cp(
      resolve("dist/assets", file),
      resolve(destination, "assets", file),
    );
  }
}
console.log(`Standalone landing exported to ${destination}`);
