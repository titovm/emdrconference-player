import AWS from 'aws-sdk';
import { PassThrough } from 'stream';

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  endpoint: process.env.S3_ENDPOINT,
  s3ForcePathStyle: true, // Required for Wasabi or path-style S3
});

export default async function handler(req, res) {
  const { file } = req.query;
  const range = req.headers.range;

  if (!file) {
    return res.status(400).json({ error: "File parameter is required" });
  }

  try {
    // Get the file size
    const headResult = await s3
      .headObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: file,
      })
      .promise();

    const fileSize = headResult.ContentLength;

    // Parse the Range header
    let start = 0;
    let end = fileSize - 1;

    if (range) {
      const rangeMatch = range.match(/bytes=(\d+)-(\d*)/);
      if (rangeMatch) {
        start = parseInt(rangeMatch[1], 10);
        end = rangeMatch[2] ? parseInt(rangeMatch[2], 10) : end;
      }
    }

    // Ensure the range is valid
    if (start >= fileSize || end >= fileSize) {
      return res.status(416).json({ error: "Requested range not satisfiable" });
    }

    // Get the object stream
    const objectStream = s3
      .getObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: file,
        Range: `bytes=${start}-${end}`,
      })
      .createReadStream();

    // Set headers for partial content
    res.writeHead(206, {
      "Content-Type": headResult.ContentType || "application/octet-stream",
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
    });

    // Pipe the data to the response
    objectStream.pipe(res);
  } catch (error) {
    console.error("Error streaming file:", error);
    res.status(500).json({ error: "Failed to stream file" });
  }
}