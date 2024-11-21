import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function List() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [copiedMessage, setCopiedMessage] = useState(false); // State to control the visibility of the "Copied" message

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

  // Function to copy the embed link to the clipboard
  const copyToClipboard = (fileKey) => {
    const embedLink = `${window.location.origin}/embed?file=${encodeURIComponent(fileKey)}`;
    navigator.clipboard
      .writeText(embedLink)
      .then(() => {
        setCopiedMessage(true); // Show the "Copied" message
        setTimeout(() => setCopiedMessage(false), 2000); // Hide after 2 seconds
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please try again.');
      });
  };

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
      {/* Show the copied message at the top when visible */}
      {copiedMessage && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white text-center p-2">
          Copied to clipboard!
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Video Browser</h1>
      {files.length === 0 ? (
        <p>Loading files...</p>
      ) : (
        <ul>
          {/* Skip the first line and remove "EMDR2024/" from file names */}
          {files.slice(1).map((file, index) => {
            // Remove "EMDR2024/" from the beginning of the file key
            const displayName = file.key.replace(/^EMDR2024\//, '');

            return (
              <li key={index}>
                {/* Link to the player with the full file key */}
                <Link className="underline text-blue-500" href={`/player?file=${encodeURIComponent(file.key)}`}>
                  {displayName}
                </Link>
                <button
                  className="ml-4 font-bold underline text-blue-500"
                  onClick={() => copyToClipboard(file.key)}
                >
                  Скопировать ссылку
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}