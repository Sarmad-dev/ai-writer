# Image Upload API

## Endpoint
`POST /api/upload`

## Authentication
Requires a valid user session.

## Request
- Content-Type: `multipart/form-data`
- Body: Form data with a `file` field containing the image

## Validation
- Maximum file size: 5MB
- Allowed types: JPEG, PNG, GIF, WebP

## Response
```json
{
  "url": "/uploads/filename.jpg"
}
```

## Configuration

### External Storage (Production)
Set the `UPLOAD_BUCKET_URL` environment variable to use external storage (S3, Cloudinary, etc.):

```env
UPLOAD_BUCKET_URL=https://your-storage-service.com/upload
```

### Local Storage (Development)
If `UPLOAD_BUCKET_URL` is not set, files will be saved locally (implementation required).

## Implementation Notes

The current implementation provides the structure but requires additional setup:

1. **For external storage**: Implement the `uploadToExternalStorage` function with your provider's SDK
2. **For local storage**: Add file system logic to save files to the `public/uploads` directory

## Example Usage

```typescript
const formData = new FormData()
formData.append("file", file)

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
})

const { url } = await response.json()
```
