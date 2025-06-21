# Deployment Checklist and Troubleshooting Guide

## Environment Variables Required on Server

Make sure these environment variables are set on your production server:

```bash
# Authentication
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="https://your-domain.com"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-password"

# AWS/Wasabi S3 Configuration
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="eu-south-1"
S3_BUCKET_NAME="podlux"
S3_FOLDER_NAME="EMDR2024"
S3_ENDPOINT="https://s3.eu-south-1.wasabisys.com"

# Node Environment
NODE_ENV="production"
```

## Common Server Issues and Solutions

### 1. Video Downloads Instead of Streaming
**Symptoms:** Browser downloads video file instead of playing it
**Solutions:**
- Ensure Content-Type is set to "video/mp4" (check API response)
- Verify Content-Disposition is set to "inline"
- Check if HTTPS is required on your server

### 2. CORS Issues in iframe
**Symptoms:** iframe embedding fails with CORS errors
**Solutions:**
- Verify X-Frame-Options header allows embedding
- Check Content-Security-Policy allows frame-ancestors
- Ensure CORS headers are present in API responses

### 3. 500 Server Errors
**Symptoms:** API returns 500 errors
**Solutions:**
- Check server logs for detailed error messages
- Verify all environment variables are set
- Ensure AWS SDK v3 packages are installed
- Check S3 endpoint and credentials

### 4. Build Issues
**Symptoms:** npm run build fails
**Solutions:**
- Ensure all AWS SDK v2 imports are replaced with v3
- Install required packages: @aws-sdk/client-s3, @aws-sdk/s3-request-presigner
- Check for syntax errors in API files

## Testing Commands

### Test Environment Variables
```bash
# On your server, check if variables are set
echo $AWS_ACCESS_KEY_ID
echo $S3_ENDPOINT
echo $S3_BUCKET_NAME
```

### Test API Endpoints
```bash
# Test streaming API
curl -I "https://your-domain.com/api/stream?file=test.mp4"

# Should return:
# Content-Type: video/mp4
# Content-Disposition: inline
# Accept-Ranges: bytes

# Test embed page
curl -I "https://your-domain.com/embed?file=test.mp4"

# Should return:
# X-Frame-Options: ALLOWALL
# Content-Security-Policy: frame-ancestors *;
```

### Test Video Streaming
```bash
# Test range request
curl -H "Range: bytes=0-1023" "https://your-domain.com/api/stream?file=EMDR2024%2Ffile.mp4"

# Should return 206 Partial Content
```

## Deployment Steps

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Copy these files to your server:**
   - `.next/` folder (entire build output)
   - `package.json`
   - `next.config.mjs`
   - Environment variables file (create .env.production)

3. **Install dependencies on server:**
   ```bash
   npm install --production
   ```

4. **Start the application:**
   ```bash
   npm start
   ```

## Server-Specific Configurations

### Nginx Configuration (if using Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Important for video streaming
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
```

### Apache Configuration (if using Apache)
```apache
<VirtualHost *:80>
    ServerName your-domain.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Important for video streaming
    ProxyIOBufferSize 65536
    ProxyReceiveBufferSize 262144
</VirtualHost>
```

## Debug Mode

Enable debug logging by adding to your environment:
```bash
DEBUG=*
NODE_ENV=development
```

This will show detailed logs in the server console.
