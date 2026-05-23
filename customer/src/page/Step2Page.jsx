import StepHeader from './StepHeader.jsx';
import loadingAsset from '../../assets/loading_asset.png';

export default function Step2Page({ error, onBack, onRetry }) {
  return (
    <div className="flex flex-col flex-1 bg-white">
      <StepHeader step={2} onBack={onBack} />

      <div className="flex-1 flex flex-col px-5 pt-8">
        <h1
          style={{
            fontFamily: "'Bricolage Grotesque', sans-serif",
            fontWeight: 800,
            fontSize: '40px',
            lineHeight: '44px',
            letterSpacing: '0px',
          }}
          className="text-gray-900 mb-1"
        >
          We are <br/>cooking up <br/>some{' '}
          <span style={{ color: '#f87171' }}>magic...</span>
        </h1>
        <p className="text-gray-400 text-sm">
          {error ? error : 'Hang tight while we working our magic'}
        </p>

        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <p className="text-red-400 font-semibold text-center">{error}</p>
            <button
              onClick={onRetry}
              className="px-8 py-3 rounded-full font-bold text-gray-900 transition-all active:scale-95"
              style={{ backgroundColor: '#a3e635' }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <img src={loadingAsset} alt="Loading" className="w-full h-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
