import { S3Client, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// Configure AWS SDK v3 for Wasabi
const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // Required for Wasabi or path-style S3
  maxAttempts: 3,
  // Disable SSL for development (if needed)
  // tls: false,
});

// export const runtime = 'edge';


export default async function handler(req, res) {
  const { file } = req.query;
  const range = req.headers.range;

  console.log('Stream request for file:', file);
  console.log('Range header:', range);

  if (!file) {
    return res.status(400).json({ error: "File parameter is required" });
  }

  // Validate environment variables
  if (!process.env.S3_BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
    console.error('Missing required environment variables');
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    // Decode the file path in case it contains URL-encoded characters
    const decodedFile = decodeURIComponent(file);
    console.log('Decoded file path:', decodedFile);

    // Get the file size
    const headCommand = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: decodedFile,
    });
    const headResult = await s3Client.send(headCommand);

    const fileSize = headResult.ContentLength;
    console.log('File size:', fileSize);

    // Parse the Range header
    let start = 0;
    let end = fileSize - 1;
    let isPartialContent = false;

    if (range) {
      const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
      if (rangeMatch) {
        start = parseInt(rangeMatch[1], 10);
        end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : end;
        isPartialContent = true;
      }
    }

    // Ensure the range is valid
    if (start >= fileSize || end >= fileSize || start > end) {
      return res.status(416).json({ error: "Requested range not satisfiable" });
    }

    // Get the object stream
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: decodedFile,
      Range: isPartialContent ? `bytes=${start}-${end}` : undefined,
    });

    const objectResponse = await s3Client.send(getObjectCommand);
    const objectStream = objectResponse.Body;

    console.log('Streaming bytes:', isPartialContent ? `${start}-${end}/${fileSize}` : `full file (${fileSize} bytes)`);

    // Set appropriate headers
    const headers = {
      "Content-Type": headResult.ContentType || "video/mp4",
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Cache-Control": "public, max-age=3600"
    };

    if (isPartialContent) {
      headers["Content-Range"] = `bytes ${start}-${end}/${fileSize}`;
      res.writeHead(206, headers);
    } else {
      res.writeHead(200, headers);
    }

    // Pipe the data to the response
    objectStream.pipe(res);

    // Handle stream errors
    objectStream.on('error', (streamError) => {
      console.error('Stream error:', streamError);
      if (!res.headersSent) {
        res.status(500).json({ error: "Stream error" });
      }
    });

  } catch (error) {
    console.error("Error streaming file:", error);
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      code: error.code || error.$metadata?.httpStatusCode,
      stack: error.stack,
      bucket: process.env.S3_BUCKET_NAME,
      key: file,
      decodedKey: decodeURIComponent(file),
      endpoint: process.env.S3_ENDPOINT
    });
    
    // Return more specific error messages
    if (error.name === 'NoSuchKey' || error.code === 'NoSuchKey') {
      return res.status(404).json({ error: "File not found" });
    } else if (error.name === 'AccessDenied' || error.code === 'AccessDenied') {
      return res.status(403).json({ error: "Access denied" });
    } else {
      return res.status(500).json({ 
        error: "Failed to stream file",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        errorName: error.name,
        errorCode: error.code
      });
    }
  }
}