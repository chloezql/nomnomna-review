import { useState } from 'react';
import starIcon        from '../../assets/star_icon.png';
import feedbackVector  from '../../assets/feedback_page_vector_2.png';
import plusIcon        from '../../assets/plus_icon.png';
import feedbackIcon    from '../../assets/feedback_icon.png';
import feedbackAsset   from '../../assets/feedback_page_asset.png';
import feedbackVector1 from '../../assets/feedback_page_vector_1.png';

const BRICOLAGE = "'Bricolage Grotesque', sans-serif";

export default function FinishPage({ onShareAnother, storeName }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!feedbackText.trim()) return;
    setSending(true);
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackText, storeName: storeName || 'Unknown' }),
      });
    } catch {}
    setSending(false);
    setSent(true);
  };

  const handleClose = () => {
    setShowFeedback(false);
    setFeedbackText('');
    setSent(false);
  };

  return (
    <div className="flex flex-col flex-1 bg-white overflow-hidden relative">
      <div className="flex-1 px-6 pt-12">
        {/* Heading row */}
        <div className="relative mb-1">
          <h1
            style={{
              fontFamily: BRICOLAGE,
              fontWeight: 800,
              fontSize: '48px',
              lineHeight: '60px',
              letterSpacing: '-1.2px',
              color: '#111827',
            }}
          >
            More love,
          </h1>
          <h1
            className="flex items-center gap-2"
            style={{
              fontFamily: BRICOLAGE,
              fontWeight: 800,
              fontSize: '48px',
              lineHeight: '60px',
              letterSpacing: '-1.2px',
            }}
          >
            more{' '}
            <span style={{ color: '#f08080' }}>magic.</span>
            <img src={starIcon} alt="" className="object-contain" style={{ width: '28px', height: '28px' }} />
          </h1>
          <img
            src={feedbackVector}
            alt=""
            className="absolute object-contain pointer-events-none"
            style={{ top: '76px', right: '-16px', width: '80px', height: 'auto' }}
          />
        </div>

        <p
          className="mb-12 mt-8"
          style={{
            fontFamily: BRICOLAGE,
            fontWeight: 400,
            fontSize: '20px',
            lineHeight: '28px',
            letterSpacing: '0px',
            color: '#374151',
          }}
        >
          Help more local businesses<br />grow with your feedback.
        </p>

        {/* Action rows */}
        <div className="space-y-3 mt-8">
          <ActionRow
            icon={plusIcon}
            label="Share Another Review"
            onClick={onShareAnother}
          />
          <ActionRow
            icon={feedbackIcon}
            label="Give Feedback on the App"
            onClick={() => setShowFeedback(true)}
          />
        </div>
      </div>

      {/* Bottom mascot */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={feedbackAsset}
          alt=""
          className="absolute bottom-0 right-0 h-full w-auto object-contain"
        />
        <img
          src={feedbackVector1}
          alt=""
          className="absolute object-contain"
          style={{ bottom: '3rem', left: '4rem', width: '4rem', height: 'auto' }}
        />
      </div>

      {/* Feedback modal */}
      {showFeedback && (
        <div
          className="absolute inset-0 flex items-end justify-center z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div
            className="w-full"
            style={{
              background: '#FFFFFF',
              borderRadius: '24px 24px 0 0',
              padding: '28px 24px 40px',
              maxWidth: '390px',
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 rounded-full" style={{ background: '#E5E7EB' }} />
            </div>

            {sent ? (
              <div className="flex flex-col items-center gap-4 py-8">
                <p
                  style={{
                    fontFamily: BRICOLAGE,
                    fontWeight: 800,
                    fontSize: '28px',
                    lineHeight: '36px',
                    color: '#111827',
                  }}
                >
                  Thanks! 🎉
                </p>
                <p style={{ fontFamily: BRICOLAGE, fontWeight: 400, fontSize: '16px', color: '#6B7280' }}>
                  Your feedback means a lot to us.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-4 font-extrabold transition-all active:scale-95"
                  style={{
                    height: '56px',
                    width: '100%',
                    borderRadius: '9999px',
                    background: '#C7F464',
                    boxShadow: '4px 4px 0px 0px #0000001A',
                    color: '#111827',
                    fontSize: '16px',
                    fontFamily: BRICOLAGE,
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <p
                  className="mb-1"
                  style={{
                    fontFamily: BRICOLAGE,
                    fontWeight: 800,
                    fontSize: '24px',
                    lineHeight: '32px',
                    letterSpacing: '-0.5px',
                    color: '#111827',
                  }}
                >
                  Your Feedback
                </p>
                <p className="mb-5" style={{ fontFamily: BRICOLAGE, fontWeight: 400, fontSize: '14px', color: '#9CA3AF' }}>
                  Tell us what you think — we read every word.
                </p>

                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={5}
                  className="w-full resize-none focus:outline-none text-sm leading-relaxed px-4 py-3 mb-5"
                  style={{
                    borderRadius: '12px',
                    background: '#F2F2F2',
                    boxShadow: '0px 0px 15px 0px #C7F46433',
                    border: 'none',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '14px',
                    color: '#111827',
                  }}
                />

                <button
                  onClick={handleSend}
                  disabled={!feedbackText.trim() || sending}
                  className="w-full font-extrabold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    height: '56px',
                    borderRadius: '9999px',
                    background: '#C7F464',
                    boxShadow: '4px 4px 0px 0px #0000001A',
                    color: '#111827',
                    fontSize: '16px',
                    fontFamily: BRICOLAGE,
                  }}
                >
                  {sending ? 'Sending…' : 'Send Feedback'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionRow({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="transition-all active:scale-[0.98]"
      style={{
        width: '342px',
        height: '82px',
        borderRadius: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        background: '#FFFFFF',
        border: '1px solid #EBEBEB',
      }}
    >
      <img src={icon} alt="" className="object-contain flex-shrink-0" style={{ width: '20px', height: '20px' }} />
      <span
        className="flex-1 text-center px-4"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '28px',
          letterSpacing: '0px',
          color: '#131313',
        }}
      >
        {label}
      </span>
      <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex-shrink-0" />
    </button>
  );
}
