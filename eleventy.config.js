import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { load as loadYaml } from "js-yaml";
import markdownIt from "markdown-it";
import Image, { generateHTML } from "@11ty/eleventy-img";
import { HtmlBasePlugin } from "@11ty/eleventy";

// Set when the site is served from a sub-folder, e.g. "/website-jessy/" on GitHub Pages.
const pathPrefix = ("/" + (process.env.PATH_PREFIX || "") + "/").replace(/\/+/g, "/");

// Approved copy is rendered as-is: no smart quotes, no auto-linking, no raw HTML.
const md = markdownIt({ html: false, linkify: false, typographer: false });

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Adds a short content hash to an asset URL ("/assets/x.svg?v=1a2b3c4d"), so browsers fetch
// a changed illustration straight away instead of showing a cached copy.
const versioned = (urlPath) => {
  try {
    const hash = crypto.createHash("md5").update(fs.readFileSync(path.join("src", urlPath))).digest("hex");
    return `${urlPath}?v=${hash.slice(0, 8)}`;
  } catch {
    return urlPath;
  }
};

// A placeholder such as "[Insert professional email address]" counts as "not supplied yet".
const isPlaceholder = (value) => !value || /^\s*\[.*\]\s*$/.test(value);

export default function (eleventyConfig) {
  // Prefixes root-relative links and image sources in the HTML with pathPrefix.
  eleventyConfig.addPlugin(HtmlBasePlugin);
  eleventyConfig.addDataExtension("yml,yaml", (contents) => loadYaml(contents));

  eleventyConfig.addPassthroughCopy({
    "src/assets/fonts": "assets/fonts",
    "src/assets/illustrations": "assets/illustrations",
    "src/assets/icons": "/",
    "src/assets/social": "assets/social",
    "src/assets/uploads": "assets/uploads",
    "src/admin": "admin",
  });
  eleventyConfig.ignores.add("src/admin/**");
  eleventyConfig.addWatchTarget("src/_includes/css/");

  // Paragraphs of approved copy (blank-line separated, Markdown allowed for CMS edits).
  eleventyConfig.addFilter("md", (text) => md.render(String(text ?? "")));

  // Escapes a heading and sets each "&" in the display face's italic ampersand.
  eleventyConfig.addFilter("amp", (text) =>
    escapeHtml(text).replace(/&amp;/g, '<span class="amp">&amp;</span>'),
  );

  eleventyConfig.addFilter("isPlaceholder", isPlaceholder);
  // First paragraph of a blank-line separated text (used for homepage teasers).
  eleventyConfig.addFilter("firstParagraph", (text) => String(text ?? "").split(/\n\s*\n/)[0]);
  eleventyConfig.addFilter("versioned", versioned);
  eleventyConfig.addFilter("telHref", (phone) => "tel:" + String(phone).replace(/[^\d+]/g, ""));
  eleventyConfig.addFilter("waHref", (phone) => "https://wa.me/" + String(phone).replace(/\D/g, ""));
  eleventyConfig.addFilter("navLabel", (nav, key) => nav.find((item) => item.key === key)?.label);
  eleventyConfig.addFilter("navUrl", (nav, key) => nav.find((item) => item.key === key)?.url);
  eleventyConfig.addFilter("itemId", (item) => item.id || eleventyConfig.getFilter("slugify")(item.title));

  eleventyConfig.addFilter("personSchema", (settings, url) => {
    const person = { "@context": "https://schema.org", "@type": "Person", name: settings.name, jobTitle: settings.role };
    if (url) person.url = url + "/";
    if (!isPlaceholder(settings.email)) person.email = settings.email;
    if (!isPlaceholder(settings.phone)) person.telephone = settings.phone;
    return JSON.stringify(person).replace(/</g, "\\u003c");
  });

  // All CSS is inlined: one small stylesheet, no render-blocking request.
  eleventyConfig.addShortcode("inlineCss", () => {
    const css = fs.readFileSync("src/_includes/css/main.css", "utf8");
    return css
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\s+/g, " ")
      .replace(/\s*([{}:;,>])\s*/g, "$1")
      .replace(/;}/g, "}")
      .replace(/url\("(\/assets\/[^"]+)"\)/g, (_, url) => `url("${versioned(url)}")`)
      .replace(/url\("\//g, `url("${pathPrefix}`)
      .trim();
  });

  // Responsive, optimised portrait (AVIF/WebP/JPEG) from an image uploaded through the CMS.
  eleventyConfig.addAsyncShortcode("portrait", async (portrait, sizes, loading = "lazy") => {
    if (!portrait?.image) return "";
    const metadata = await Image(path.join("src", portrait.image), {
      widths: [400, 720, 1080],
      formats: ["avif", "webp", "jpeg"],
      outputDir: "_site/assets/img/",
      urlPath: "/assets/img/",
    });
    return generateHTML(metadata, {
      alt: portrait.alt || "",
      sizes,
      loading,
      decoding: "async",
      class: "portrait__img",
    });
  });

  eleventyConfig.on("eleventy.after", () => {
    const settings = loadYaml(fs.readFileSync("src/_data/settings.yml", "utf8"));
    // An empty phone number is deliberate (it hides the phone line); only flag leftover placeholders.
    const missing = ["email", "phone"].filter((key) => (key === "email" || settings[key]) && isPlaceholder(settings[key]));
    if (missing.length) {
      console.warn(
        `\n[contact] Placeholder still in use for: ${missing.join(", ")}. ` +
          "Replace it in the CMS (Contact details & settings) once Jessy supplies the final details.\n",
      );
    }
  });

  return {
    pathPrefix,
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "11ty.js"],
    htmlTemplateEngine: "njk",
  };
}
