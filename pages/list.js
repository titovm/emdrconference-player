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
                    className="w-6 h-6 ml-2"
                  >
                  <path d="M20.9983 10C20.9862 7.82497 20.8897 6.64706 20.1213 5.87868C19.2426 5 17.8284 5 15 5H12C9.17157 5 7.75736 5 6.87868 5.87868C6 6.75736 6 8.17157 6 11V16C6 18.8284 6 20.2426 6.87868 21.1213C7.75736 22 9.17157 22 12 22H15C17.8284 22 19.2426 22 20.1213 21.1213C21 20.2426 21 18.8284 21 16V15" stroke-width="1.5" stroke-linecap="round"></path> <path d="M3 10V16C3 17.6569 4.34315 19 6 19M18 5C18 3.34315 16.6569 2 15 2H11C7.22876 2 5.34315 2 4.17157 3.17157C3.51839 3.82475 3.22937 4.69989 3.10149 6" stroke-width="1.5" stroke-linecap="round"></path>
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