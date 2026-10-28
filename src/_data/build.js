import fs from "node:fs";
import { load as loadYaml } from "js-yaml";

const settings = loadYaml(fs.readFileSync(new URL("./settings.yml", import.meta.url), "utf8"));

export default {
  // Netlify provides URL (the site's primary address, custom domain included).
  url: (process.env.URL || settings.url || "").replace(/\/$/, ""),
  year: new Date().getFullYear(),
  // Preview builds (e.g. GitHub Pages) are kept out of search engines.
  preview: Boolean(process.env.SITE_PREVIEW),
};
