import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';

const app = express();
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
    const reviews = Array.isArray(parsed.reviews) ? parsed.reviews : Object.values(parsed).flat();
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
