import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Embed() {
  const router = useRouter();
  const { file } = router.query;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!file) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', backgroundColor: 'black' }}>
        <div>
          <h1>Error</h1>
          <p>No file specified.</p>
        </div>
      </div>
    );
  }

  const handleError = (e) => {
    console.error('Video error:', e);
    setError('Failed to load video');
    setLoading(false);
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleCanPlay = () => {
    setLoading(false);
  };

  return (
    <div style={{ margin: 0, padding: 0, height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      {loading && !error && (
        <div style={{ color: 'white', position: 'absolute', zIndex: 1 }}>
          Loading video...
        </div>
      )}
      {error && (
        <div style={{ color: 'red', position: 'absolute', zIndex: 1 }}>
          {error}
        </div>
      )}
      <video
        src={`/api/stream?file=${encodeURIComponent(file)}`}
        controls
        autoPlay
        muted // Add muted for autoplay to work in most browsers
        playsInline // Better mobile support
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          display: error ? 'none' : 'block'
        }}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onLoadedData={() => console.log('Video data loaded')}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}