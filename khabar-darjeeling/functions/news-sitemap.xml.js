// Cloudflare Pages Function → serves Google News sitemap at /news-sitemap.xml
// Path in repo: khabar-darjeeling/functions/news-sitemap.xml.js

const EP = 'https://nyc.cloud.appwrite.io/v1';
const PID = 'khabardarjeeling';
const DB = 'Khabar_db';
const COL = 'articles';
const SITE = 'https://khabardarjeeling.space';
const PUB = 'Khabar Darjeeling';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export async function onRequest(context) {
  try {
    const cutoff = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const q = [
      JSON.stringify({ method: 'equal', attribute: 'status', values: ['published'] }),
      JSON.stringify({ method: 'greaterThanEqual', attribute: '$createdAt', values: [cutoff] }),
      JSON.stringify({ method: 'orderDesc', attribute: '$createdAt' }),
      JSON.stringify({ method: 'limit', values: [1000] })
    ];
    const u = new URL(`${EP}/databases/${DB}/collections/${COL}/documents`);
    q.forEach(x => u.searchParams.append('queries[]', x));

    const r = await fetch(u.toString(), { headers: { 'X-Appwrite-Project': PID } });
    if (!r.ok) {
      const body = await r.text();
      return new Response(`Appwrite ${r.status}: ${body.slice(0, 300)}`, { status: 502 });
    }

    const docs = (await r.json()).documents || [];
    const items = docs.map(a => {
      const d = new Date(a.publishedAt || a.$createdAt).toISOString();
      return `  <url>
    <loc>${esc(`${SITE}/article.html?id=${a.$id}`)}</loc>
    <news:news>
      <news:publication><news:name>${esc(PUB)}</news:name><news:language>en</news:language></news:publication>
      <news:publication_date>${d}</news:publication_date>
      <news:title>${esc(a.title)}</news:title>
    </news:news>
  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=600'
      }
    });
  } catch (err) {
    return new Response(`Sitemap failed: ${err.message}`, { status: 500 });
  }
}
