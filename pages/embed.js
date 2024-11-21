import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Embed() {
  const router = useRouter();
  const { file } = router.query; // Extract the file key from the query parameter
  const [signedUrl, setSignedUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return; // Wait until the file key is available

    async function fetchSignedUrl() {
      try {
        const res = await fetch(`/api/getSignedUrl?file=${encodeURIComponent(file)}`);
        if (!res.ok) throw new Error(`Failed to fetch signed URL: ${res.statusText}`);
        const data = await res.json();
        setSignedUrl(data.signedUrl); // Set the signed URL
      } catch (err) {
        console.error('Error fetching signed URL:', err);
        setError('Failed to load the video. Please try again later.');
      }
    }

    fetchSignedUrl();
  }, [file]);

  if (error) {
    return (
      <div style={{ color: 'red', textAlign: 'center', marginTop: '20px' }}>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!signedUrl) {
    return (
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <h1>Loading Video...</h1>
        <p>Please wait while the video is being prepared.</p>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <video
        src={signedUrl}
        controls
        autoPlay
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}