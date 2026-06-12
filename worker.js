// Worker entry — serves a dynamic Google News sitemap at /news-sitemap.xml
// Everything else falls through to static assets (the khabar-darjeeling directory).

const APPWRITE_ENDPOINT = 'https://nyc.cloud.appwrite.io/v1';
const PROJECT_ID        = 'khabardarjeeling';
const DATABASE_ID       = 'Khabar_db';
const COLLECTION_ID     = 'articles';
const SITE_URL          = 'https://khabardarjeeling.space';
const PUBLICATION_NAME  = 'Khabar Darjeeling';

function xmlEscape(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function buildNewsSitemap() {
  // Articles published in the last 48 hours (Google News requirement)
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  const queries = [
    JSON.stringify({ method: 'equal', attribute: 'status', values: ['published'] }),
    JSON.stringify({ method: 'greaterThanEqual', attribute: '$createdAt', values: [cutoff] }),
    JSON.stringify({ method: 'orderDesc', attribute: '$createdAt' }),
    JSON.stringify({ method: 'limit', values: [1000] }),
  ];

  const url = new URL(`${APPWRITE_ENDPOINT}/databases/${DATABASE_ID}/collections/${COLLECTION_ID}/documents`);
  queries.forEach(q => url.searchParams.append('queries[]', q));

  const res = await fetch(url.toString(), {
    headers: {
      'X-Appwrite-Project': PROJECT_ID,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Appwrite ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const articles = data.documents || [];

  const items = articles.map(a => {
    const pub = new Date(a.publishedAt || a.$createdAt).toISOString();
    const loc = `${SITE_URL}/article.html?id=${a.$id}`;
    return `  <url>
    <loc>${xmlEscape(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>${xmlEscape(PUBLICATION_NAME)}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pub}</news:publication_date>
      <news:title>${xmlEscape(a.title)}</news:title>
    </news:news>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Dynamic route: /news-sitemap.xml
    if (url.pathname === '/news-sitemap.xml') {
      try {
        const xml = await buildNewsSitemap();
        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=600',
          },
        });
      } catch (err) {
        return new Response(`Sitemap generation failed: ${err.message}`, {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    }

    // Everything else → static assets (khabar-darjeeling directory)
    return env.ASSETS.fetch(request);
  },
};
