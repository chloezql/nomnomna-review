import { useState, useEffect, useRef } from 'react';
import LandingPage from './page/LandingPage.jsx';
import Step1Page from './page/Step1Page.jsx';
import Step2Page from './page/Step2Page.jsx';
import Step3Page from './page/Step3Page.jsx';
import Step4Page from './page/Step4Page.jsx';
import Step5Page from './page/Step5Page.jsx';
import FinishPage from './page/FinishPage.jsx';

const DEFAULT_PARAMS = {
  storeName: "Joe's Coffee",
  googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
  yelpBusinessId: '',
  instagramProfileUrl: '',
  facebookPageUrl: '',
  redNoteUserId: '',
};

const PLATFORMS = [
  {
    key: 'googlereview',
    name: 'Google Review',
    emoji: '🌟',
    newTab: true,
    getUrl: (p) => `https://search.google.com/local/writereview?placeid=${p.googlePlaceId}`,
  },
  {
    key: 'yelp',
    name: 'Yelp',
    emoji: '⭐',
    newTab: true,
    getUrl: (p) => `https://www.yelp.com/writeareview/biz/${p.yelpBusinessId}?return_url=%2Fbiz%2F${p.yelpBusinessId}&review_origin=biz-details-war-button`,
    disabled: (p) => !p.yelpBusinessId,
  },
  {
    key: 'facebook',
    name: 'Facebook',
    emoji: '👍',
    actions: [
      { key: 'profile', label: 'Store Page', getUrl: (p) => p.facebookPageUrl, paramKey: 'facebookPageUrl' },
    ],
  },
  {
    key: 'instagram',
    name: 'Instagram',
    emoji: '📷',
    actions: [
      { key: 'profile', label: 'Store Page', getUrl: (p) => p.instagramProfileUrl, paramKey: 'instagramProfileUrl' },
    ],
  },
  {
    key: 'rednote',
    name: 'RedNote',
    emoji: '🟥',
    actions: [
      { key: 'post', label: 'Create Post', getUrl: () => 'xhsdiscover://post_note?ignore_draft=true' },
      { key: 'profile', label: 'Store Page', getUrl: (p) => `xhsdiscover://user/${p.redNoteUserId}`, paramKey: 'redNoteUserId' },
    ],
  },
];

export default function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [step, setStep] = useState(1); // 1 | 2 | 3 | 'post'
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [highlights, setHighlights] = useState([]);
  const [tone, setTone] = useState('sincere');
  const [keywords, setKeywords] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [editedReview, setEditedReview] = useState('');
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  // Fetch store info from DB on mount using storeId from URL
  useEffect(() => {
    const storeId = new URLSearchParams(window.location.search).get('store');
    if (!storeId) return;
    fetch(`/api/store/${storeId}`)
      .then(r => r.json())
      .then(data => setParams({
        storeName: data.storeName || DEFAULT_PARAMS.storeName,
        googlePlaceId: data.googlePlaceId || DEFAULT_PARAMS.googlePlaceId,
        yelpBusinessId: data.yelpBusinessId || DEFAULT_PARAMS.yelpBusinessId,
        instagramProfileUrl: data.instagramProfileUrl || DEFAULT_PARAMS.instagramProfileUrl,
        facebookPageUrl: data.facebookPageUrl || DEFAULT_PARAMS.facebookPageUrl,
        redNoteUserId: data.redNoteUserId || DEFAULT_PARAMS.redNoteUserId,
      }))
      .catch(() => {});
  }, []);

  // Auto-advance from step 2 to 3 when generation completes
  useEffect(() => {
    if (step === 2 && !loading && reviews.length > 0) {
      setStep(3);
    }
  }, [step, loading, reviews.length]);

  const toggleHighlight = (key) => {
    setHighlights(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const generateReviews = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setReviews([]);
    setSelectedIdx(null);
    setError('');

    try {
      const res = await fetch('/api/generate-review', {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...params, highlights, tone, keywords }),
      });
      if (!res.ok) throw new Error('Server error');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError('Failed to generate reviews. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromStep2 = () => {
    abortRef.current?.abort();
    setLoading(false);
    setError('');
    setStep(1);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
  };

  const openUrl = (url, newTab = false) => {
    if (!url.startsWith('http')) {
      window.location.href = url;
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    if (newTab) { a.target = '_blank'; a.rel = 'noopener'; }
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeepLink = async (platform) => {
    const url = platform.getUrl(params);
    await copyToClipboard(reviews[selectedIdx]);
    showToast(`Copied & Opening ${platform.name}!`);
    setTimeout(() => openUrl(url, platform.newTab), 350);
  };

  const handleAction = async (platform, action) => {
    const url = action.getUrl(params);
    await copyToClipboard(reviews[selectedIdx]);
    showToast(`Copied & Opening ${platform.name}!`);
    setTimeout(() => openUrl(url), 350);
  };

  // ── Pages ──────────────────────────────────────────────────────────────────

  let page = null;

  if (showLanding) {
    page = <LandingPage onEnter={() => setShowLanding(false)} />;
  } else if (step === 1) {
    page = (
      <Step1Page
        highlights={highlights}
        tone={tone}
        keywords={keywords}
        onToggle={toggleHighlight}
        onTone={setTone}
        onKeywords={setKeywords}
        onNext={() => { setStep(2); generateReviews(); }}
        onBack={() => setShowLanding(true)}
      />
    );
  } else if (step === 2) {
    page = (
      <Step2Page
        error={error}
        onBack={handleBackFromStep2}
        onRetry={() => { setStep(1); setError(''); }}
      />
    );
  } else if (step === 3) {
    page = (
      <Step3Page
        reviews={reviews}
        selectedIdx={selectedIdx}
        onSelect={setSelectedIdx}
        onNext={() => {
          setEditedReview(reviews[selectedIdx]);
          setStep(4);
        }}
        onBack={() => setStep(1)}
      />
    );
  } else if (step === 4) {
    page = (
      <Step4Page
        review={editedReview}
        onEdit={setEditedReview}
        onCopy={async () => {
          await copyToClipboard(editedReview);
          setStep(5);
        }}
      />
    );
  } else if (step === 5) {
    page = (
      <Step5Page
        params={params}
        onPlatformOpen={(platformKey) => {
          const platform = PLATFORMS.find(p => p.key === platformKey);
          if (!platform) return;
          if (platform.actions) {
            const action = platform.actions[0];
            const url = action.getUrl(params);
            if (!action.paramKey || params[action.paramKey]) {
              showToast(`Opening ${platform.name}!`);
              setTimeout(() => openUrl(url), 350);
            }
          } else {
            const url = platform.getUrl(params);
            showToast(`Opening ${platform.name}!`);
            setTimeout(() => openUrl(url, platform.newTab), 350);
          }
          setTimeout(() => setStep('finish'), 600);
        }}
        onBack={() => setStep(4)}
      />
    );
  } else if (step === 'finish') {
    page = (
      <FinishPage
        storeName={params.storeName}
        onShareAnother={() => {
          setReviews([]);
          setSelectedIdx(null);
          setHighlights([]);
          setKeywords('');
          setTone('sincere');
          setStep(1);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div
        className="w-full flex flex-col relative bg-white"
        style={{ maxWidth: '390px', minHeight: '100dvh' }}
      >
        {page}
      </div>
    </div>
  );
}
