import { useRouter } from 'next/router';

export default function Embed() {
  const router = useRouter();
  const { file } = router.query; // Extract the file key from the query parameter

  if (!file) {
    return (
      <div>
        <h1>Error</h1>
        <p>No file specified.</p>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }}>
      <video
        src={`/api/stream?file=${encodeURIComponent(file)}`}
        type="video/mp4"
        controls
        autoPlay
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}