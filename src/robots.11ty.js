export const data = { permalink: "/robots.txt", eleventyExcludeFromCollections: true };

export function render({ build }) {
  return ["User-agent: *", "Disallow: /admin/", build.url ? `Sitemap: ${build.url}/sitemap.xml` : ""]
    .filter(Boolean)
    .join("\n") + "\n";
}
