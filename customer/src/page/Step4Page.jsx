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

// Finds the single contiguous region that changed between two strings, so an
// edit's effect on the plain text can be described as "replace [start,oldEnd)
// with [start,newEnd)" instead of diffing the whole string.
function diffEdit(oldStr, newStr) {
  let start = 0;
  const maxStart = Math.min(oldStr.length, newStr.length);
  while (start < maxStart && oldStr[start] === newStr[start]) start++;

  let oldEnd = oldStr.length;
  let newEnd = newStr.length;
  while (oldEnd > start && newEnd > start && oldStr[oldEnd - 1] === newStr[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }
  return { start, oldEnd, newEnd };
}

// Re-maps highlight ranges after an edit so highlighted phrases keep tracking
// the same words as the user types, instead of drifting to the wrong offsets.
function shiftRanges(ranges, { start, oldEnd, newEnd }) {
  const delta = newEnd - oldEnd;
  return ranges
    .map(([s, e]) => {
      if (e <= start) return [s, e];
      if (s >= oldEnd) return [s + delta, e + delta];
      if (s <= start && e >= oldEnd) return [s, e + delta];
      if (s >= start && e <= oldEnd) return null;
      if (s < start) return [s, start];
      return [newEnd, e + delta];
    })
    .filter(r => r && r[1] > r[0]);
}

function renderHighlightedRanges(text, ranges) {
  if (!ranges || ranges.length === 0) return text;
  const sorted = [...ranges]
    .map(([s, e]) => [Math.max(0, s), Math.min(text.length, e)])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);

  const parts = [];
  let cursor = 0;
  sorted.forEach(([s, e], i) => {
    if (s > cursor) parts.push(text.slice(cursor, s));
    parts.push(
      <mark key={i} style={{ background: '#a3e635', color: 'inherit', borderRadius: '2px', padding: '0 1px' }}>
        {text.slice(s, e)}
      </mark>
    );
    cursor = e;
  });
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts;
}

const textBoxClassName = "w-full text-sm font-semibold leading-relaxed px-4 py-3 whitespace-pre-wrap break-words";

export default function Step4Page({ review, ranges, onEdit, onCopy }) {
  const handleChange = (e) => {
    const newText = e.target.value;
    const edit = diffEdit(review, newText);
    onEdit(newText, shiftRanges(ranges, edit));
  };

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

            {/* Editable review text — a highlighted backdrop sits behind a
                transparent-text textarea so the lime marks stay visible while
                the user types; the backdrop's normal flow also drives the
                block's height, so it grows with the content automatically. */}
            <div style={{ position: 'relative' }}>
              <div
                aria-hidden="true"
                className={`${textBoxClassName} text-gray-800`}
                style={{ borderRadius: '10px', background: '#D9D9D94D', border: 'none' }}
              >
                {renderHighlightedRanges(review, ranges)}
              </div>
              <textarea
                value={review}
                onChange={handleChange}
                className={`${textBoxClassName} resize-none focus:outline-none absolute inset-0 h-full`}
                style={{ borderRadius: '10px', background: 'transparent', border: 'none', color: 'transparent', caretColor: '#1f2937' }}
              />
            </div>
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
