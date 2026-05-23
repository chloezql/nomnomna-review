export default function StepHeader({ step, onBack }) {
  const isGreen = step === 3;
  const fillColor = isGreen ? '#a3e635' : '#f87171';

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
          style={{ backgroundColor: isGreen ? '#a3e635' : '#f87171' }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M11 14L6 9L11 4"
              stroke={isGreen ? '#111827' : 'white'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button className="text-gray-500 p-1">
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <rect width="20" height="2.5" rx="1.25" fill="currentColor" />
            <rect y="6.5" width="20" height="2.5" rx="1.25" fill="currentColor" />
            <rect y="13" width="20" height="2.5" rx="1.25" fill="currentColor" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2 px-4">
        {[1, 2, 3].map(s => {
          const isLoading = step === 2 && s <= 2;
          return (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${isLoading ? 'progress-shimmer' : ''}`}
              style={isLoading
                ? { animationDelay: s === 1 ? '0.4s' : '0s', animationDuration: '2s' }
                : { backgroundColor: s <= step ? fillColor : '#e5e7eb' }
              }
            />
          );
        })}
      </div>
    </div>
  );
}
