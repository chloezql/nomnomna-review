import StepHeader from './StepHeader.jsx';
import step3Asset from '../../assets/step_3_asset.png';

const BRICOLAGE = "'Bricolage Grotesque', sans-serif";

function renderHighlighted(text) {
  const parts = text.split(/(\[H\].*?\[\/H\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[H\](.*?)\[\/H\]$/);
    if (match) {
      return (
        <mark key={i} style={{ background: '#a3e635', color: 'inherit', borderRadius: '2px', padding: '0 1px' }}>
          {match[1]}
        </mark>
      );
    }
    return part;
  });
}

const cardBase = {
  minHeight: '92px',
  borderRadius: '12px',
  padding: '24px',
  background: '#F2F2F2',
  boxShadow: '0px 0px 15px 0px #C7F46433',
  border: '1px solid transparent',
  gap: '12px',
};

const cardActive = {
  ...cardBase,
  background: 'linear-gradient(255.23deg, rgba(199, 244, 100, 0.31) 4.4%, rgba(255, 255, 255, 0.31) 101.19%)',
  border: '1px solid #4AE1B1',
};

export default function Step3Page({ reviews, selectedIdx, onSelect, onNext, onBack }) {
  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <StepHeader step={3} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-6">
        {/* Heading row */}
        <div className="flex items-end justify-between mb-1">
          <h1
            style={{
              fontFamily: BRICOLAGE,
              fontWeight: 800,
              fontSize: '40px',
              lineHeight: '48px',
              letterSpacing: '-0.96px',
              textTransform: 'uppercase',
              color: '#111827',
            }}
          >
            PICK YOUR{' '}
            <br />
            <span style={{ color: '#a3e635' }}>FAVE</span>{' '}
            REVIEW
          </h1>
          <img
            src={step3Asset}
            alt=""
            className="object-contain flex-shrink-0"
            style={{ height: '96px', width: 'auto' }}
          />
        </div>
        <p className="text-gray-400 text-sm mb-6">Choose the one you like best</p>

        {reviews.length === 0 ? (
          <p className="text-gray-400 text-center mt-16">No reviews generated yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, idx) => {
              const active = selectedIdx === idx;
              return (
                <button
                  key={idx}
                  onClick={() => onSelect(idx)}
                  className="w-full text-left flex items-start justify-between transition-all active:scale-[0.98]"
                  style={active ? cardActive : cardBase}
                >
                  <div className="flex-1 pr-3">
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: '#f59e0b', fontSize: '1.1rem', lineHeight: 1 }}>★</span>
                      ))}
                    </div>
                    <p className="text-gray-800 text-base leading-relaxed">{renderHighlighted(review)}</p>
                  </div>
                  {active && (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: '#a3e635' }}
                    >
                      <span className="font-bold text-sm leading-none" style={{ color: '#111827' }}>✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Next button */}
      <div className="px-5 pb-8 pt-3 bg-gray-50 flex justify-center">
        <button
          onClick={onNext}
          disabled={selectedIdx === null}
          className="w-full font-extrabold text-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            height: '68px',
            maxWidth: '384px',
            borderRadius: '9999px',
            paddingTop: '20px',
            paddingBottom: '20px',
            gap: '12px',
            background: '#C7F464',
            boxShadow: '4px 4px 0px 0px #0000001A',
            color: '#111827',
          }}
        >
          Next <span>→</span>
        </button>
      </div>
    </div>
  );
}
