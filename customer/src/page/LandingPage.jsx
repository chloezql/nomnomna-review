import { useState, useEffect } from 'react';
import logoUrl from '../../assets/logo.png';
import signalIconUrl from '../../assets/signal_icon.png';
import mascotUrl from '../../assets/landing_page_asset.png';

export default function LandingPage({ onEnter }) {
  const [fading, setFading] = useState(false);

  const handleStart = () => {
    if (fading) return;
    setFading(true);
    setTimeout(onEnter, 400);
  };

  useEffect(() => {
    const t = setTimeout(handleStart, 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      onClick={handleStart}
      style={{
        transition: 'opacity 0.4s ease',
        opacity: fading ? 0 : 1,
      }}
      className="absolute inset-0 bg-white flex flex-col items-center justify-between overflow-hidden cursor-pointer select-none"
    >
      {/* Top section: logo + signal + CTA */}
      <div className="flex flex-col items-center justify-center flex-1 gap-8 pt-16">
        <img src={logoUrl} alt="NomNomNa" className="w-44 h-44 object-contain" />
        <img src={signalIconUrl} alt="" className="w-14 h-10 object-contain" />
        <p
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '24px',
            lineHeight: '30px',
            letterSpacing: '-0.6px',
            textAlign: 'center',
            textTransform: 'uppercase',
          }}
        >
          LET'S START ... ...
        </p>
      </div>

      {/* Bottom mascot */}
      <div className="w-full">
        <img src={mascotUrl} alt="" className="w-full object-contain object-bottom" />
      </div>
    </div>
  );
}
