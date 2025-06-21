import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { file } = req.query;

  if (!file) {
    return res.status(400).json({ error: 'Missing file key' });
  }

  try {
    const s3Client = new S3Client({
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      region: process.env.AWS_REGION,
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
    });

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: file,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 10800, // URL valid for 3 hours
    });

    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error.message);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
}