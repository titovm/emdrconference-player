import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function List() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  // Expose the S3 folder name to the client side
  const rootDir = process.env.NEXT_PUBLIC_S3_FOLDER_NAME || '';

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch('/api/files');
        if (!res.ok) throw new Error(`Failed to fetch files: ${res.statusText}`);
        const data = await res.json();
        setFiles(data.files || []);
      } catch (err) {
        console.error('Error fetching files:', err);
        setError('Failed to load files. Please try again later.');
      }
    }

    fetchFiles();
  }, []);

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Video Browser</h1>
      {files.length === 0 ? (
        <p>Loading files...</p>
      ) : (
        <ul>
          {files.map((file, index) => {
            // Remove the root directory from the file key for display
            const displayName = file.key.startsWith(`${rootDir}/`)
              ? file.key.slice(rootDir.length + 1)
              : file.key;

            return (
              <li key={index}>
                {/* Link to the player with the full file key */}
                <Link href={`/player?file=${encodeURIComponent(file.key)}`}>
                  {displayName}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}