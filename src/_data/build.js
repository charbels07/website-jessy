import fs from "node:fs";
import { load as loadYaml } from "js-yaml";

const settings = loadYaml(fs.readFileSync(new URL("./settings.yml", import.meta.url), "utf8"));

export default {
  // Netlify provides URL (the site's primary address, custom domain included).
  url: (process.env.URL || settings.url || "").replace(/\/$/, ""),
  year: new Date().getFullYear(),
  // Preview builds are kept out of search engines: the GitHub Pages preview, and the Netlify
  // site while it only has its temporary *.netlify.app address. Once Jessy's domain is the
  // site's primary address (and the site has rebuilt), it can be found on Google.
  preview: Boolean(process.env.SITE_PREVIEW) || /\.netlify\.app/.test(process.env.URL || ""),
};
