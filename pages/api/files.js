import AWS from 'aws-sdk';

export default async function handler(req, res) {
  // Validate HTTP method
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' }); // Handle non-GET requests
  }

  try {
    // Initialize AWS S3 client with Wasabi configuration
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      endpoint: process.env.S3_ENDPOINT,
      s3ForcePathStyle: true, // Important for Wasabi compatibility
    });

    // List objects in the specified bucket and folder
    const data = await s3
      .listObjectsV2({
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: process.env.S3_FOLDER_NAME,
      })
      .promise();

    // Check if the folder is empty
    if (!data.Contents || data.Contents.length === 0) {
      return res.status(404).json({ error: 'No files found in the specified folder' });
    }

    // Generate pre-signed URLs for each file
    const files = await Promise.all(
      data.Contents.map(async (item) => {
        const signedUrl = await s3.getSignedUrlPromise('getObject', {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: item.Key,
          Expires: 3600, // URL valid for 1 hour
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
    if (error.code === 'NoSuchBucket') {
      return res.status(404).json({ error: 'Bucket does not exist' });
    }

    // Generic error response
    res.status(500).json({
      error: 'Failed to retrieve files',
      details: error.message,
    });
  }
}