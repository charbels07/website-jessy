export const data = {
  permalink: (data) => (data.build.url ? "/sitemap.xml" : false),
  eleventyExcludeFromCollections: true,
};

export function render({ build, collections }) {
  const urls = collections.all
    .filter((page) => page.url && !page.url.endsWith(".html"))
    .map((page) => `  <url><loc>${build.url}${page.url}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
