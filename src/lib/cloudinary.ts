import { v2 as cloudinary } from 'cloudinary';

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Dynamically check if Cloudinary is configured via environment variables.
 * Checks both individual vars (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)
 * and CLOUDINARY_URL.
 */
export function getCloudinaryConfig() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  const hasIndividualVars = Boolean(
    cloudName &&
    apiKey &&
    apiSecret &&
    !cloudName.includes('sample') &&
    !apiKey.includes('sample')
  );

  const hasUrl = Boolean(cloudinaryUrl && cloudinaryUrl.startsWith('cloudinary://'));

  const configured = hasIndividualVars || hasUrl;

  if (configured) {
    if (hasIndividualVars) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true
      });
    } else if (hasUrl) {
      cloudinary.config({
        cloudinary_url: cloudinaryUrl,
        secure: true
      });
    }
  }

  return { configured, cloudName, apiKey, apiSecret, cloudinaryUrl };
}

/**
 * Upload image buffer to Cloudinary or fallback to data URL / local storage
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  mimetypeOrFolder: string = 'image/jpeg',
  folderName: string = 'products'
): Promise<UploadResult> {
  const { configured } = getCloudinaryConfig();

  // Smart parameter detection in case caller passes (buffer, folderName)
  let mimetype = 'image/jpeg';
  let folder = folderName;

  if (mimetypeOrFolder.includes('/') || mimetypeOrFolder.startsWith('image/')) {
    mimetype = mimetypeOrFolder;
  } else {
    // caller passed folder as 2nd argument e.g. uploadImageToCloudinary(buffer, 'products')
    folder = mimetypeOrFolder;
  }

  if (configured) {
    try {
      return await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { width: 1200, height: 1200, crop: 'limit', quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error || !result) {
              console.error('[Cloudinary Upload API Error]:', error);
              return reject(error || new Error('Cloudinary upload failed'));
            }
            console.log(`[Cloudinary Upload Success]: ${result.secure_url} (Public ID: ${result.public_id})`);
            resolve({
              url: result.secure_url,
              publicId: result.public_id
            });
          }
        );
        uploadStream.end(buffer);
      });
    } catch (err: any) {
      console.warn(`[Cloudinary Upload Attempt Failed]: ${err.message || err}. Falling back to base64 data URL.`);
    }
  } else {
    console.warn('[Cloudinary Config Notice]: Environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET or CLOUDINARY_URL) not detected at upload time. Storing as Data URL fallback.');
  }

  // Fallback mode when Cloudinary keys aren't configured or upload stream failed
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimetype};base64,${base64}`;
  const mockPublicId = `local_dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    url: dataUrl,
    publicId: mockPublicId
  };
}

/**
 * Delete image from Cloudinary by publicId
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId || publicId.startsWith('local_dev_')) {
    return true;
  }

  const { configured } = getCloudinaryConfig();

  if (configured) {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok' || res.result === 'not found';
    } catch (err) {
      console.warn('Cloudinary delete warning:', err);
      return false;
    }
  }

  return true;
}

