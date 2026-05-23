import StepHeader from './StepHeader.jsx';
import foodQualityIcon  from '../../assets/food_quality_icon.png';
import atmosphereIcon   from '../../assets/atmosphere_icon.png';
import cleanlinessIcon  from '../../assets/cleanliness_icon.png';
import serviceIcon      from '../../assets/service_icon.png';
import locationIcon     from '../../assets/location_icon.png';
import valueIcon        from '../../assets/value_of_money_icon.png';
import returningIcon    from '../../assets/would_return_icon.png';
import editIcon         from '../../assets/edit_icon.png';
import step1Asset       from '../../assets/step_1_asset.png';

const HIGHLIGHTS = [
  { key: 'quality',     label: 'Food Quality',   icon: foodQualityIcon },
  { key: 'atmosphere',  label: 'Atmosphere',      icon: atmosphereIcon },
  { key: 'cleanliness', label: 'Cleanliness',     icon: cleanlinessIcon },
  { key: 'service',     label: 'Service',         icon: serviceIcon },
  { key: 'location',    label: 'Location',        icon: locationIcon },
  { key: 'value',       label: 'Value for Money', icon: valueIcon },
  { key: 'returning',   label: 'Would Return',    icon: returningIcon },
];

const TONES = [
  { key: 'sincere',      label: 'Sincere & Nature', sub: 'Genuine, friendly' },
  { key: 'enthusiastic', label: 'Enthusiastic',     sub: 'Energetic, exclamatory' },
];

const BRICOLAGE = "'Bricolage Grotesque', sans-serif";

const toneBase = {
  minHeight: '92px',
  borderRadius: '12px',
  padding: '24px',
  background: '#F2F2F2',
  boxShadow: '0px 0px 15px 0px #C7F46433',
  border: '1px solid transparent',
  gap: '12px',
};

const toneActive = {
  ...toneBase,
  background: 'linear-gradient(255.23deg, rgba(199, 244, 100, 0.31) 4.4%, rgba(255, 255, 255, 0.31) 101.19%)',
  border: '1px solid #4AE1B1',
};

export default function Step1Page({ highlights, tone, keywords, onToggle, onTone, onKeywords, onNext, onBack }) {
  return (
    <div className="flex flex-col flex-1 bg-white">
      <StepHeader step={1} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-6">
        {/* Section 1: Highlights */}
        <h1
          style={{
            fontFamily: BRICOLAGE,
            fontWeight: 800,
            fontSize: '40px',
            lineHeight: '44px',
            letterSpacing: '0px',
            color: '#111827',
          }}
          className="mb-1"
        >
          What do you want to{' '}
          <span style={{ color: '#f87171' }}>shout out?</span>
        </h1>
        <p className="text-gray-400 text-sm mb-5">Pick all that apply</p>

        <div className="flex flex-wrap gap-2 mb-10">
          {HIGHLIGHTS.map(({ key, label, icon }) => {
            const active = highlights.includes(key);
            return (
              <button
                key={key}
                onClick={() => onToggle(key)}
                className="flex items-center justify-between gap-1.5 text-sm font-semibold transition-all active:scale-95"
                style={
                  active
                    ? {
                        height: '48px',
                        borderRadius: '102px',
                        paddingTop: '17px',
                        paddingBottom: '17px',
                        paddingLeft: '16px',
                        paddingRight: '16px',
                        background: 'linear-gradient(113.74deg, #F47373 0%, #FE7F7F 100%)',
                        boxShadow: '0px 4px 4px 0px #B048482B',
                        color: 'white',
                        border: 'none',
                      }
                    : {
                        height: '48px',
                        borderRadius: '102px',
                        padding: '16px',
                        gap: '2px',
                        background: '#F9FAFB80',
                        border: '1px solid #EBEBEB',
                        color: '#374151',
                      }
                }
              >
                {/* Left icon */}
                <span
                  className="flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0"
                  style={active ? { boxShadow: '0px 4px 4px 0px #B048482B' } : {}}
                >
                  <img
                    src={icon}
                    alt=""
                    className="w-4 h-4 object-contain"
                    style={active ? { filter: 'brightness(0) invert(1)' } : {}}
                  />
                </span>
                <span>{label}</span>
                {/* Checkmark badge */}
                {active && (
                  <span
                    className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: '#1a1a1a', color: 'white' }}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Section 2: Writing Style */}
        <div className="flex items-end mb-1">
          <h2
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
            HOW SHOULD WE{' '}
            <span style={{ color: '#a3e635' }}>SAY IT</span>
          </h2>
          <img
            src={step1Asset}
            alt=""
            className="object-contain flex-shrink-0"
            style={{ height: '96px', width: 'auto' }}
          />
        </div>
        <p className="text-gray-400 text-sm mb-4">Choose a writing style</p>

        <div className="space-y-3">
          {TONES.map(({ key, label, sub }) => {
            const active = tone === key;
            return (
              <button
                key={key}
                onClick={() => onTone(key)}
                className="w-full text-left flex items-center justify-between transition-all active:scale-[0.98]"
                style={active ? toneActive : toneBase}
              >
                <div>
                  <p className="font-bold text-base text-gray-900">{label}</p>
                  <p className="text-sm text-gray-400">{sub}</p>
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

        {/* Custom style input */}
        <p className="text-gray-400 text-sm mt-6 mb-2">or Customize your own</p>
        <div className="relative">
          <input
            type="text"
            value={keywords}
            onChange={e => {
              const val = e.target.value;
              onKeywords(val);
              if (val) onTone('');
              else onTone('sincere');
            }}
            placeholder="Type your style..."
            className="w-full text-sm text-gray-800 placeholder-gray-400 focus:outline-none pr-12"
            style={{
              height: '68px',
              borderRadius: '12px',
              paddingLeft: '24px',
              paddingRight: '56px',
              background: '#F2F2F2',
              boxShadow: '0px 0px 15px 0px #C7F46433',
              border: 'none',
            }}
          />
          <img
            src={editIcon}
            alt=""
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 object-contain"
          />
        </div>
      </div>

      {/* Next button */}
      <div className="px-5 pb-8 pt-3 bg-white flex justify-center">
        <button
          onClick={onNext}
          className="w-full font-extrabold text-lg flex items-center justify-center transition-all active:scale-95"
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
