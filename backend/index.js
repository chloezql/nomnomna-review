import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { transport: ws } }
);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const HIGHLIGHT_LABELS = {
  quality:     'Food Quality',
  atmosphere:  'Atmosphere',
  cleanliness: 'Cleanliness',
  service:     'Service',
  location:    'Location',
  value:       'Value for Money',
  returning:   'Would Return',
};

const TONE_DESCRIPTIONS = {
  sincere:      'sincere, genuine, and friendly',
  enthusiastic: 'enthusiastic and energetic with exclamatory language',
};

app.post('/api/generate-review', async (req, res) => {
  const { storeName, highlights = [], tone, keywords } = req.body;
  if (!storeName) return res.status(400).json({ error: 'storeName is required' });

  const toneDesc = keywords?.trim()
    ? keywords.trim()
    : TONE_DESCRIPTIONS[tone] || TONE_DESCRIPTIONS.sincere;

  const highlightText = highlights.length > 0
    ? `The reviewer wants to highlight: ${highlights.map(h => HIGHLIGHT_LABELS[h] || h).join(', ')}.`
    : '';

  const highlightInstructions = highlights.length > 0
    ? `For each review, inline the [H] and [/H] tags directly around the words inside the review text that describe each highlighted topic (${highlights.map(h => HIGHLIGHT_LABELS[h] || h).join(', ')}). The tags must wrap the actual words as they appear in the review — do NOT append tagged phrases at the end. Never tag the store name. Tag only 2–4 words maximum — typically an adjective + noun or adverb + adjective. Never tag a full clause or more than 4 words. Example: "The [H]cozy and inviting[/H] atmosphere made it perfect to relax. The staff was [H]incredibly attentive and friendly[/H], which really made the visit." Every review must contain at least one inline [H]...[/H] tag.`
    : '';

  const prompt = `Generate 3 distinct, realistic customer reviews for a restaurant or business called "${storeName}".
${highlightText}
Writing style: ${toneDesc}.
Each review should be 2–4 sentences, sound like a real customer, and be unique in perspective and phrasing.
${highlightInstructions}
Return ONLY a JSON object in this exact format: { "reviews": ["...", "...", "..."] }`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(completion.choices[0].message.content);
    const rawReviews = Array.isArray(parsed.reviews) ? parsed.reviews : Object.values(parsed).flat();
    const reviews = rawReviews.filter(r => typeof r === 'string' && r.trim().length > 0).slice(0, 3);
    res.json({ reviews });
  } catch (err) {
    console.error('OpenAI error:', err.message);
    res.status(500).json({ error: 'Failed to generate reviews' });
  }
});

app.post('/api/feedback', async (req, res) => {
  const { feedback, storeName } = req.body;
  if (!feedback?.trim()) return res.status(400).json({ error: 'feedback is required' });

  const { error } = await supabase.from('feedbacks').insert({
    feedback: feedback.trim(),
    store_name: storeName || 'Unknown',
  });

  if (error) {
    console.error('Supabase error:', error.message);
    return res.status(500).json({ error: 'Failed to save feedback' });
  }
  res.json({ success: true });
});

const REDNOTE_HOSTS = ['xhslink.cn', 'xhslink.com', 'xiaohongshu.com'];
const YELP_HOST_REGEX = /^([a-z0-9-]+\.)?yelp\.[a-z.]+$/i;

function isRedNoteHost(hostname) {
  return REDNOTE_HOSTS.some(h => hostname === h || hostname.endsWith(`.${h}`));
}

// Follows redirects on a short/share link server-side (short-link services
// only expose the real target via a redirect, not in the URL itself) and
// pulls an ID out of wherever it lands. Some share links (e.g. Yelp's via
// Adjust) land on an attribution page that never issues a real HTTP redirect
// to the destination — it decides app-vs-web with client-side JS instead —
// but embeds the real target URL-encoded in its own query string, so we also
// check a decoded copy of the final URL.
async function resolveRedirectAndExtract(url, extractRegex) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15' },
    });
    const finalUrl = response.url;
    let decodedUrl = finalUrl;
    try { decodedUrl = decodeURIComponent(finalUrl); } catch { /* leave as-is if not decodable */ }
    const match = finalUrl.match(extractRegex) || decodedUrl.match(extractRegex);
    return { resolvedUrl: finalUrl, id: match ? match[1] : null };
  } finally {
    clearTimeout(timeout);
  }
}

app.post('/api/resolve-rednote-link', async (req, res) => {
  const { url } = req.body;
  if (!url?.trim()) return res.status(400).json({ error: 'url is required' });

  let parsedUrl;
  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  if (!isRedNoteHost(parsedUrl.hostname)) {
    return res.status(400).json({ error: 'URL must be a RedNote (xiaohongshu.com / xhslink.cn) link' });
  }

  try {
    const { resolvedUrl, id } = await resolveRedirectAndExtract(parsedUrl.href, /\/user\/profile\/([a-zA-Z0-9_-]+)/);
    if (!id) return res.status(422).json({ error: 'Could not find a user ID in the resolved link', resolvedUrl });
    res.json({ redNoteUserId: id, resolvedUrl });
  } catch (err) {
    console.error('RedNote link resolve error:', err.message);
    res.status(502).json({ error: 'Failed to resolve RedNote link' });
  }
});

app.post('/api/resolve-yelp-link', async (req, res) => {
  const { url } = req.body;
  if (!url?.trim()) return res.status(400).json({ error: 'url is required' });

  let parsedUrl;
  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return res.status(400).json({ error: 'Invalid URL' });
  }
  if (!YELP_HOST_REGEX.test(parsedUrl.hostname)) {
    return res.status(400).json({ error: 'URL must be a Yelp (yelp.com / yelp.to) link' });
  }

  try {
    const { resolvedUrl, id } = await resolveRedirectAndExtract(parsedUrl.href, /yelp\.[^/]+\/(?:writeareview\/)?biz\/([^?/#\s]+)/);
    if (!id) return res.status(422).json({ error: 'Could not find a business ID in the resolved link', resolvedUrl });
    res.json({ yelpBusinessId: id, resolvedUrl });
  } catch (err) {
    console.error('Yelp link resolve error:', err.message);
    res.status(502).json({ error: 'Failed to resolve Yelp link' });
  }
});

app.post('/api/store', async (req, res) => {
  const {
    storeName,
    googlePlaceId, yelpBusinessId,
    instagramProfileUrl, facebookPageUrl, redNoteUserId,
  } = req.body;

  if (!storeName) return res.status(400).json({ error: 'storeName is required' });

  const id = randomUUID();
  const url = `${FRONTEND_URL}/?store=${id}`;

  const { data, error } = await supabase.from('stores').insert({
    id,
    store_name: storeName,
    google_place_id: googlePlaceId || '',
    yelp_business_id: yelpBusinessId || '',
    instagram_profile_url: instagramProfileUrl || '',
    facebook_page_url: facebookPageUrl || '',
    red_note_user_id: redNoteUserId || '',
    url,
  }).select().single();

  if (error) {
    console.error('Supabase error:', error.message);
    return res.status(500).json({ error: 'Failed to create store' });
  }

  res.json({ store: toStoreCamel(data) });
});

app.get('/api/stores', async (_req, res) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data.map(toStoreCamel));
});

app.get('/api/store/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (error || !data) return res.status(404).json({ error: 'Store not found' });
  res.json(toStoreCamel(data));
});

function toStoreCamel(row) {
  return {
    id:                  row.id,
    storeName:           row.store_name,
    googlePlaceId:       row.google_place_id,
    yelpBusinessId:      row.yelp_business_id,
    instagramProfileUrl: row.instagram_profile_url,
    facebookPageUrl:     row.facebook_page_url,
    redNoteUserId:       row.red_note_user_id,
    createdAt:           row.created_at,
    url:                 row.url,
  };
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
