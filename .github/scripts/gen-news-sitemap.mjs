// Generates khabar-darjeeling/news-sitemap.xml from Appwrite (published, last 48h)
// Run by .github/workflows/news-sitemap.yml

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const EP = 'https://nyc.cloud.appwrite.io/v1';
const PID = 'khabardarjeeling';
const DB = 'Khabar_db';
const COL = 'articles';
const SITE = 'https://khabardarjeeling.space';
const PUB = 'Khabar Darjeeling';
const OUT = 'khabar-darjeeling/news-sitemap.xml';

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

async function main() {
  const cutoff = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const queries = [
    JSON.stringify({ method: 'equal', attribute: 'status', values: ['published'] }),
    JSON.stringify({ method: 'greaterThanEqual', attribute: '$createdAt', values: [cutoff] }),
    JSON.stringify({ method: 'orderDesc', attribute: '$createdAt' }),
    JSON.stringify({ method: 'limit', values: [1000] }),
  ];
  const u = new URL(`${EP}/databases/${DB}/collections/${COL}/documents`);
  queries.forEach(q => u.searchParams.append('queries[]', q));

  const r = await fetch(u.toString(), { headers: { 'X-Appwrite-Project': PID } });
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Appwrite ${r.status}: ${body.slice(0, 300)}`);
  }

  const docs = (await r.json()).documents || [];
  console.log(`Found ${docs.length} published article(s) in the last 48h.`);

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
</urlset>
`;

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, xml, 'utf8');
  console.log(`Wrote ${OUT}`);
}

main().catch(err => { console.error(err); process.exit(1); });
