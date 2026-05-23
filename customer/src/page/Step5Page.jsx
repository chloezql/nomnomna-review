import { useState } from 'react';
import StepHeader from './StepHeader.jsx';
import googleIcon    from '../../assets/google_icon.png';
import yelpIcon      from '../../assets/yelp_icon.png';
import instagramIcon from '../../assets/instagram_icon.png';
import facebookIcon  from '../../assets/facebook_icon.png';
import rednoteIcon   from '../../assets/rednote_icon.png';
import shareAsset    from '../../assets/share_page_asset.png';
import shareVector1  from '../../assets/share_page_vector_1.png';
import shareVector2  from '../../assets/share_page_vector_2.png';

const BRICOLAGE = "'Bricolage Grotesque', sans-serif";

const btnBase = {
  height: '66px',
  borderRadius: '9999px',
  padding: '16px',
  background: '#F9F9F9',
  border: '1px solid #F3F4F6',
  boxShadow: '0px 1px 2px 0px #0000000D',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
};

const btnActive = {
  ...btnBase,
  background: '#C7F464',
  border: '1px solid #E5E7EB',
};

export default function Step5Page({ params, onPlatformOpen, onBack }) {
  const [selected, setSelected] = useState(null);

  const handleTap = (key) => {
    setSelected(key);
    setTimeout(() => onPlatformOpen(key), 320);
  };

  const platforms = [
    { key: 'googlereview', name: 'Google Review', icon: googleIcon,    disabled: false },
    { key: 'yelp',         name: 'Yelp Review',   icon: yelpIcon,      disabled: !params.yelpBusinessId },
    { key: 'instagram',    name: 'Instagram',      icon: instagramIcon, disabled: false },
    { key: 'facebook',     name: 'Facebook',       icon: facebookIcon,  disabled: false },
    { key: 'rednote',      name: 'Rednote',        icon: rednoteIcon,   disabled: false },
  ];

  return (
    <div className="flex flex-col flex-1 bg-white relative overflow-hidden">
      <StepHeader step={3} onBack={onBack} />

      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-44">
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
          Where should we{' '}
          <br />
          <span style={{ color: '#a3e635' }}>share</span> it?
        </h1>
        <p className="text-gray-400 text-sm mb-12">We'll open the platform for you</p>

        <div className="space-y-3">
          {platforms.map(({ key, name, icon, disabled }) => {
            const active = selected === key;
            return (
              <button
                key={key}
                onClick={() => !disabled && handleTap(key)}
                disabled={disabled}
                className="transition-all active:scale-[0.98] disabled:opacity-40"
                style={active ? btnActive : btnBase}
              >
                <img src={icon} alt={name} className="w-9 h-9 object-contain flex-shrink-0" />
                <span className="flex-1 text-left font-bold text-gray-900 text-base px-3">{name}</span>
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={
                    active
                      ? { backgroundColor: '#111827', borderColor: '#111827' }
                      : { borderColor: '#d1d5db' }
                  }
                >
                  {active && <span className="text-white text-xs font-bold leading-none">✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom mascot + vectors — all relative to bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: '160px' }}>
        <img
          src={shareAsset}
          alt=""
          className="absolute bottom-0 left-0 h-28 w-auto object-contain"
        />
        <img
          src={shareVector1}
          alt=""
          style={{
            position: 'absolute',
            width: '70px',
            height: '30px',
            bottom: '60px',
            left: '160px',
            opacity: 1,
          }}
        />
        <img
          src={shareVector2}
          alt=""
          style={{
            position: 'absolute',
            width: '16px',
            height: '30px',
            bottom: '80px',
            left: '150px',
            opacity: 1,
          }}
        />
      </div>
    </div>
  );
}
