import { useEffect, useRef } from 'react';
import step4Vector1 from '../../assets/step_4_vector_1.png';
import step4Vector2 from '../../assets/step_4_vector_2.png';
import editPageAsset from '../../assets/edit_page_asset.png';

const BRICOLAGE = "'Bricolage Grotesque', sans-serif";

const titleStyle = {
  fontFamily: BRICOLAGE,
  fontWeight: 800,
  fontSize: '30px',
  lineHeight: '36px',
  letterSpacing: '-0.9px',
};

export default function Step4Page({ review, onEdit, onCopy }) {
  const taRef = useRef(null);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = taRef.current.scrollHeight + 'px';
    }
  }, [review]);

  return (
    <div
      className="flex flex-col flex-1 relative overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      {/* Top vector */}
      <img
        src={step4Vector1}
        alt=""
        className="absolute pointer-events-none"
        style={{ top: '100px', left: '100px', width: '30%', zIndex: 0 }}
      />

      {/* Bottom vector */}
      <img
        src={step4Vector2}
        alt=""
        className="absolute pointer-events-none"
        style={{ bottom: '100px', right: '80px', width: '30%', zIndex: 0 }}
      />

      {/* Centered content */}
      <div className="flex-1 flex flex-col justify-center px-6 relative" style={{ zIndex: 10 }}>
        {/* Title */}
        <div className="mb-4">
          <h1 style={{ ...titleStyle, color: '#a3e635' }}>Edit</h1>
          <h1 style={{ ...titleStyle, color: 'white' }}>or Copy it?</h1>
        </div>

        {/* Card + mascot + button wrapper */}
        <div className="relative">
          {/* Mascot — half the card width, behind the card */}
          <img
            src={editPageAsset}
            alt=""
            className="absolute pointer-events-none"
            style={{
              width: '171px',
              height: 'auto',
              top: '-105px',
              right: '-15px',
              opacity: 1,
              zIndex: 5,
            }}
          />

          {/* White card — above mascot */}
          <div
            style={{
              width: '342px',
              minHeight: '244px',
              borderRadius: '16px',
              paddingTop: '24px',
              paddingRight: '32px',
              paddingBottom: '48px',
              paddingLeft: '32px',
              background: '#FFFFFF',
              boxShadow: '4px 4px 0px 0px #0000001A',
              display: 'flex',
              flexDirection: 'column',
              gap: '14.88px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            {/* Card header */}
            <div className="flex items-center justify-between flex-shrink-0">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: '#f59e0b', fontSize: '1.2rem', lineHeight: 1 }}>★</span>
                ))}
              </div>
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  opacity: 0.71,
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="text-gray-500 text-xs font-bold leading-none">✓</span>
              </div>
            </div>

            {/* Editable review text */}
            <textarea
              ref={taRef}
              value={review}
              onChange={e => onEdit(e.target.value)}
              className="w-full text-sm font-semibold text-gray-800 leading-relaxed resize-none focus:outline-none px-4 py-3"
              style={{
                borderRadius: '10px',
                background: '#D9D9D94D',
                overflow: 'hidden',
                display: 'block',
              }}
            />
          </div>

          {/* Copy button — overlaps the bottom edge of the card */}
          <div
            className="flex justify-center"
            style={{ marginTop: '-20px', position: 'relative', zIndex: 20 }}
          >
            <button
              onClick={onCopy}
              className="font-extrabold text-gray-900 text-base transition-all active:scale-95"
              style={{
                height: '40px',
                borderRadius: '136px',
                transform: 'rotate(3deg)',
                paddingTop: '8px',
                paddingRight: '24px',
                paddingBottom: '8px',
                paddingLeft: '24px',
                background: '#C7F464',
                boxShadow: '4px 4px 0px 0px #0000001A',
                whiteSpace: 'nowrap',
              }}
            >
              Copy it !
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
