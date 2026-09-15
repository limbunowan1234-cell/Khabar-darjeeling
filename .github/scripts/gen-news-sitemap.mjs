// Generates khabar-darjeeling/news-sitemap.xml from the khabar-redesign
// project's Cloudflare Worker (published, last 48h). Run by
// .github/workflows/news-sitemap.yml.
//
// Used to query Appwrite's Database API directly -- that's been fully
// billing-blocked (402) for weeks now, same root cause as the auth outage
// in khabar-redesign, so every hourly run has been failing since. Swapped
// to the Worker's own /articles endpoint, which mirrors Appwrite's
// document shape ($id, $createdAt, title, content, publishedAt) closely
// enough that only the fetch itself needed to change.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const WORKER_URL = 'https://khabar-worker.limbunowan1234.workers.dev';
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
  const cutoffMs = Date.now() - 48 * 3600 * 1000;

  // No server-side date filter on the Worker's /articles -- same approach
  // khabar-redesign's own app/news-sitemap.xml route already takes:
  // fetch everything published (default status filter), filter by date
  // client-side. limit=1000 comfortably covers 48h of real posting volume.
  const r = await fetch(`${WORKER_URL}/articles?limit=1000`);
  if (!r.ok) {
    const body = await r.text();
    throw new Error(`Worker ${r.status}: ${body.slice(0, 300)}`);
  }

  const all = (await r.json()).documents || [];
  const docs = all.filter(a => new Date(a.publishedAt || a.$createdAt).getTime() >= cutoffMs);
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
