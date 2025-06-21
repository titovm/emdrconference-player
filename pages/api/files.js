import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  // Validate HTTP method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' }); // Handle non-GET requests
  }

  try {
    // Initialize AWS S3 client with Wasabi configuration
    const s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true, // Important for Wasabi compatibility
    });

    // List objects in the specified bucket and folder
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME,
      Prefix: process.env.S3_FOLDER_NAME,
    });
    
    const data = await s3Client.send(command);

    // Check if the folder is empty
    if (!data.Contents || data.Contents.length === 0) {
      return res.status(404).json({ error: 'No files found in the specified folder' });
    }

    // Generate pre-signed URLs for each file
    const files = await Promise.all(
      data.Contents.map(async (item) => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: item.Key,
        });
        
        const signedUrl = await getSignedUrl(s3Client, getObjectCommand, { 
          expiresIn: 3600 // URL valid for 1 hour
        });

        return {
          key: item.Key,
          signedUrl,
        };
      })
    );

    // Respond with the list of files and their signed URLs
    res.status(200).json({ files });
  } catch (error) {
    console.error('Error listing files or generating signed URLs:', error.message);

    // Handle AWS-specific errors
    if (error.name === 'NoSuchBucket' || error.code === 'NoSuchBucket') {
      return res.status(404).json({ error: 'Bucket does not exist' });
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to retrieve files',
      details: error.message,
    });
  }
}