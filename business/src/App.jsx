import { useState, useEffect, useRef } from 'react';
import logoUrl from './logo.png';

const BRICOLAGE = "'Bricolage Grotesque', sans-serif";

const LIME   = '#C7F464';
const DARK   = '#111827';
const RED    = '#f87171';
const TEAL   = '#4AE1B1';
const MUTED  = '#9CA3AF';
const FIELD_BG = '#F2F2F2';

const fieldStyle = {
  width: '100%',
  background: FIELD_BG,
  border: '1px solid transparent',
  borderRadius: '12px',
  padding: '14px 18px',
  fontSize: '14px',
  color: DARK,
  outline: 'none',
  boxShadow: '0px 0px 15px 0px #C7F46433',
  transition: 'border-color 0.15s',
};

const fieldDisabledStyle = {
  ...fieldStyle,
  background: '#F0F0F0',
  color: '#BBBBBB',
  cursor: 'not-allowed',
  pointerEvents: 'none',
  boxShadow: 'none',
};

function extractYelpId(input) {
  const m = input.match(/yelp\.[^/]+\/(?:writeareview\/)?biz\/([^?/#\s]+)/);
  return m ? m[1] : input.trim();
}

const EMPTY_FORM = {
  storeName: '',
  googlePlaceId: '',
  yelpBusinessId: '',
  instagramProfileUrl: '',
  facebookPageUrl: '',
  redNoteUserId: '',
};

const PLATFORMS = [
  { key: 'googlePlaceId',       label: 'Google'    },
  { key: 'yelpBusinessId',      label: 'Yelp'      },
  { key: 'instagramProfileUrl', label: 'Instagram' },
  { key: 'facebookPageUrl',     label: 'Facebook'  },
  { key: 'redNoteUserId',       label: 'RedNote'   },
];

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function PlatformBadge({ label, active }) {
  return (
    <span
      style={{
        padding: '3px 10px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 700,
        background: active ? 'rgba(199, 244, 100, 0.35)' : '#F3F4F6',
        color: active ? '#374151' : '#D1D5DB',
        border: active ? `1px solid ${LIME}` : '1px solid transparent',
        letterSpacing: '0.01em',
      }}
    >
      {active ? '✓ ' : ''}{label}
    </span>
  );
}

function StoreCard({ store, onCopy }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '22px',
        border: '1px solid #F3F4F6',
        boxShadow: '0px 0px 15px 0px #C7F46433',
      }}
    >
      {/* Name + date */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
        <p
          style={{
            fontFamily: BRICOLAGE,
            fontWeight: 800,
            fontSize: '18px',
            color: DARK,
            letterSpacing: '-0.3px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
          }}
        >
          {store.storeName}
        </p>
        <span style={{ fontSize: '11px', color: MUTED, flexShrink: 0, paddingTop: '3px' }}>
          {formatDate(store.createdAt)}
        </span>
      </div>

      {/* Platform badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
        {PLATFORMS.map(p => (
          <PlatformBadge key={p.key} label={p.label} active={!!store[p.key]} />
        ))}
      </div>

      {/* URL row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: FIELD_BG,
          borderRadius: '12px',
          padding: '10px 14px',
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#6B7280',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {store.url}
        </span>
        <button
          onClick={() => onCopy(store.url)}
          style={{
            padding: '6px 16px',
            background: LIME,
            border: 'none',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            color: DARK,
            cursor: 'pointer',
            boxShadow: '2px 2px 0px 0px #0000001A',
            flexShrink: 0,
          }}
        >
          Copy
        </button>
        <a
          href={store.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '6px 16px',
            background: DARK,
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'white',
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          Open ↗
        </a>
      </div>
    </div>
  );
}

function Label({ children, autoFilled }) {
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.02em' }}>
        {children}
      </span>
      {autoFilled && (
        <span style={{ fontSize: '11px', fontWeight: 700, color: TEAL }}>✓ Auto-filled</span>
      )}
    </div>
  );
}

function Field({ label, hint, autoFilled, children }) {
  return (
    <div>
      <Label autoFilled={autoFilled}>{label}</Label>
      {children}
      {hint && <p style={{ fontSize: '11px', color: MUTED, marginTop: '4px' }}>{hint}</p>}
    </div>
  );
}

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [autoFilled, setAutoFilled] = useState({ storeName: false, googlePlaceId: false });
  const [yelpInput, setYelpInput] = useState('');
  const [stores, setStores] = useState([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [placesReady, setPlacesReady] = useState(false);
  const searchRef = useRef(null);
  const acRef = useRef(null);

  const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY;

  useEffect(() => {
    if (!MAPS_KEY) return;
    if (window.google?.maps?.places) { setPlacesReady(true); return; }
    window.__gm_admin_cb = () => setPlacesReady(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&callback=__gm_admin_cb`;
    script.async = true;
    document.head.appendChild(script);
  }, [MAPS_KEY]);

  useEffect(() => {
    if (!placesReady || !searchRef.current || acRef.current) return;
    const nameCache = new Map();
    const acService = new window.google.maps.places.AutocompleteService();
    const input = searchRef.current;
    const handleInput = () => {
      const val = input.value;
      if (!val || val.length < 2) return;
      acService.getPlacePredictions({ input: val, types: ['establishment'] }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          predictions.forEach(p => nameCache.set(p.place_id, p.structured_formatting.main_text));
        }
      });
    };
    input.addEventListener('input', handleInput);
    const ac = new window.google.maps.places.Autocomplete(input, {
      types: ['establishment'],
      fields: ['name', 'place_id'],
    });
    acRef.current = ac;
    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.place_id) return;
      const name = nameCache.get(place.place_id) || place.name || '';
      setForm(f => ({ ...f, storeName: name, googlePlaceId: place.place_id }));
      setAutoFilled({ storeName: true, googlePlaceId: true });
    });
    return () => input.removeEventListener('input', handleInput);
  }, [placesReady]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/stores`).then(r => r.json()).then(setStores).catch(() => {});
  }, []);

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setAutoFilled(a => ({ ...a, [key]: false }));
  };

  const handleYelpBlur = () => {
    if (!yelpInput.trim()) { setForm(f => ({ ...f, yelpBusinessId: '' })); return; }
    setForm(f => ({ ...f, yelpBusinessId: extractYelpId(yelpInput) }));
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.storeName.trim()) { setError('Store name is required.'); return; }
    if (!form.googlePlaceId.trim()) { setError('Google Place ID is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStores(prev => [data.store, ...prev]);
      setForm(EMPTY_FORM);
      setAutoFilled({ storeName: false, googlePlaceId: false });
      setYelpInput('');
      if (searchRef.current) searchRef.current.value = '';
      showToast('Store saved!');
    } catch {
      setError('Failed to save store.');
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = async (url) => {
    try { await navigator.clipboard.writeText(url); } catch {}
    showToast('URL copied!');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAFA', padding: '0 0 80px' }}>

      {/* Page header */}
      <div className="biz-header" style={{ background: 'white', borderBottom: '1px solid #F3F4F6' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '6px' }}>
            <img src={logoUrl} alt="NomNomNa" className="biz-logo" style={{ objectFit: 'contain' }} />
            <h1
              className="biz-title"
              style={{ fontFamily: BRICOLAGE, fontWeight: 800, color: DARK }}
            >
              Store{' '}
              <span style={{ color: RED }}>Management</span>
            </h1>
          </div>
          <p style={{ fontSize: '14px', color: MUTED }}>
            Add stores and generate customer review links
          </p>
        </div>
      </div>

      <div className="biz-content" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left — Create Store Form */}
          <form
            onSubmit={handleSubmit}
            className="biz-form"
            style={{
              background: 'white',
              borderRadius: '20px',
              boxShadow: '0px 0px 15px 0px #C7F46433',
              border: '1px solid #F3F4F6',
            }}
          >
            <h2
              className="biz-section-title"
              style={{
                fontFamily: BRICOLAGE,
                fontWeight: 800,
                color: DARK,
                marginBottom: '20px',
                letterSpacing: '-0.4px',
              }}
            >
              Add New Store
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <Field
                label="Search on Google — auto-fills Store Name & Place ID"
                hint={undefined}
              >
                <input
                  ref={searchRef}
                  type="text"
                  placeholder={placesReady ? 'Search store name…' : MAPS_KEY ? 'Loading Google Places…' : 'Google Places disabled'}
                  disabled={!placesReady}
                  style={placesReady ? fieldStyle : fieldDisabledStyle}
                  onFocus={e => { e.target.style.borderColor = LIME; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                />
              </Field>

              <Field
                label="Store Name *"
                autoFilled={autoFilled.storeName}
                hint={placesReady ? 'Auto-filled by Google Search above.' : undefined}
              >
                <input
                  value={form.storeName}
                  onChange={set('storeName')}
                  placeholder="Joe's Coffee"
                  disabled={placesReady}
                  style={autoFilled.storeName ? fieldStyle : placesReady ? fieldDisabledStyle : fieldStyle}
                  onFocus={e => { if (!placesReady && !autoFilled.storeName) e.target.style.borderColor = LIME; }}
                  onBlur={e => { if (!placesReady && !autoFilled.storeName) e.target.style.borderColor = 'transparent'; }}
                />
              </Field>

              <Field
                label="Google Place ID *"
                autoFilled={autoFilled.googlePlaceId}
                hint={placesReady ? 'Auto-filled by Google Search above.' : undefined}
              >
                <input
                  value={form.googlePlaceId}
                  onChange={set('googlePlaceId')}
                  placeholder="Auto-filled above, or enter manually"
                  disabled={placesReady}
                  style={{ ...(autoFilled.googlePlaceId ? fieldStyle : placesReady ? fieldDisabledStyle : fieldStyle), fontFamily: 'monospace', fontSize: '12px' }}
                  onFocus={e => { if (!placesReady && !autoFilled.googlePlaceId) e.target.style.borderColor = LIME; }}
                  onBlur={e => { if (!placesReady && !autoFilled.googlePlaceId) e.target.style.borderColor = 'transparent'; }}
                />
              </Field>

              <Field label="Yelp Page URL">
                <input
                  value={yelpInput}
                  onChange={e => setYelpInput(e.target.value)}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; handleYelpBlur(); }}
                  placeholder="https://www.yelp.com/biz/your-store-slug"
                  style={fieldStyle}
                  onFocus={e => { e.target.style.borderColor = LIME; }}
                />
                {form.yelpBusinessId && (
                  <p style={{ fontSize: '11px', color: MUTED, marginTop: '4px', fontWeight: 600 }}>
                    Extracted ID: <span style={{ fontFamily: 'monospace' }}>{form.yelpBusinessId}</span>
                  </p>
                )}
              </Field>

              <Field label="Facebook Page URL">
                <input
                  value={form.facebookPageUrl}
                  onChange={set('facebookPageUrl')}
                  placeholder="https://facebook.com/…"
                  style={fieldStyle}
                  onFocus={e => { e.target.style.borderColor = LIME; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                />
              </Field>

              <Field label="Instagram Profile URL">
                <input
                  value={form.instagramProfileUrl}
                  onChange={set('instagramProfileUrl')}
                  placeholder="https://instagram.com/…"
                  style={fieldStyle}
                  onFocus={e => { e.target.style.borderColor = LIME; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                />
              </Field>

              <Field label="RedNote User ID">
                <input
                  value={form.redNoteUserId}
                  onChange={set('redNoteUserId')}
                  placeholder="RedNote user ID"
                  style={fieldStyle}
                  onFocus={e => { e.target.style.borderColor = LIME; }}
                  onBlur={e => { e.target.style.borderColor = 'transparent'; }}
                />
              </Field>

            </div>

            {error && (
              <p style={{ color: RED, fontSize: '13px', marginTop: '12px', fontWeight: 600 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                marginTop: '20px',
                height: '60px',
                borderRadius: '9999px',
                background: saving ? '#e5e7eb' : LIME,
                boxShadow: saving ? 'none' : '4px 4px 0px 0px #0000001A',
                border: 'none',
                color: DARK,
                fontFamily: BRICOLAGE,
                fontWeight: 800,
                fontSize: '16px',
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '-0.2px',
              }}
            >
              {saving ? 'Saving…' : 'Save Store & Generate Link →'}
            </button>
          </form>

          {/* Right — Store List */}
          <div>
            <h2
              className="biz-section-title"
              style={{
                fontFamily: BRICOLAGE,
                fontWeight: 800,
                color: DARK,
                marginBottom: '16px',
                letterSpacing: '-0.4px',
              }}
            >
              Stores{' '}
              {stores.length > 0 && (
                <span style={{ color: MUTED, fontWeight: 400, fontSize: '18px' }}>({stores.length})</span>
              )}
            </h2>

            {stores.length === 0 ? (
              <div
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '48px 24px',
                  border: '1px solid #F3F4F6',
                  boxShadow: '0px 0px 15px 0px #C7F46433',
                  textAlign: 'center',
                  color: MUTED,
                  fontSize: '14px',
                }}
              >
                No stores yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stores.map(store => (
                  <StoreCard key={store.id} store={store} onCopy={copyUrl} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: DARK,
            color: 'white',
            padding: '12px 24px',
            borderRadius: '9999px',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '4px 4px 0px 0px #0000001A',
            zIndex: 50,
            whiteSpace: 'nowrap',
            fontFamily: BRICOLAGE,
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
