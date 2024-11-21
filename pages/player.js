import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Player() {
  const router = useRouter();
  const { file } = router.query; // Extract the file key from query params
  const [signedUrl, setSignedUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) return; // Wait for the file key to be available in the query

    async function fetchSignedUrl() {
      try {
        const res = await fetch(`/api/getSignedUrl?file=${encodeURIComponent(file)}`);
        if (!res.ok) throw new Error(`Failed to fetch signed URL: ${res.statusText}`);
        const data = await res.json();
        setSignedUrl(data.signedUrl); // Update the signed URL state
      } catch (err) {
        console.error(err);
        setError('Failed to load video. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchSignedUrl();
  }, [file]);

  // Display loading message or error if necessary
  if (loading) {
    return (
      <div>
        <h1>Loading Video...</h1>
        <p>Please wait while the video is being prepared.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  // Render the video player and embed code
  return (
    <div>
      <h1>Video Player</h1>
      {signedUrl ? (
        <video
          src={signedUrl}
          controls
          style={{ width: '100%', maxWidth: '800px' }}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Video is unavailable.</p>
      )}

      <p>Embed Code:</p>
      <textarea
        readOnly
        style={{ width: '100%', height: '50px' }}
        value={`<iframe src="${window.location.origin}/player?file=${encodeURIComponent(
          file
        )}" frameborder="0" allowfullscreen></iframe>`}
      />
    </div>
  );
}