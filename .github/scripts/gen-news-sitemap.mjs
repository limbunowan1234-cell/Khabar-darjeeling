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

// Detect language from the article's title + content.
// Devanagari (\u0900-\u097F) is shared by Hindi and Nepali, so we look for
// a few Nepali-specific function words to tell them apart; otherwise Hindi;
// if there's no Devanagari at all, treat it as English.
function detectLang(a) {
  const text = `${a.title || ''} ${a.content || ''}`;
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (!hasDevanagari) return 'en';

  // Common Nepali markers rarely used the same way in Hindi.
  const nepaliMarkers = /(छ|हो|भएको|गर्न|लागि|हुन्छ|पर्खाइ|र |मा |को |हरू|छन्|थियो|गरेको)/;
  if (nepaliMarkers.test(text)) return 'ne';

  return 'hi';
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
    const lang = detectLang(a);
    return `  <url>
    <loc>${esc(`${SITE}/article.html?id=${a.$id}`)}</loc>
    <news:news>
      <news:publication><news:name>${esc(PUB)}</news:name><news:language>${lang}</news:language></news:publication>
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
  console.log(`Wrote ${OUT} with ${docs.length} entries.`);
}

main().catch(err => { console.error(err); process.exit(1); });
