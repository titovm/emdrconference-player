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
                {/* Button to copy the embed link */}
                  <button
                  onClick={() => copyToClipboard(file.key)}
                  className="text-green-500 hover:text-green-700"
                  aria-label="Copy Embed Link"
                >
                  {/* SVG Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 12h9m-9 0L9.75 9.75M7.5 12l2.25 2.25M16.5 21h-9a3 3 0 01-3-3v-9a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}