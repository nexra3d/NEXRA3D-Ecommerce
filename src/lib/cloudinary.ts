import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(
  cloudName &&
  apiKey &&
  apiSecret &&
  !cloudName.includes('sample') &&
  !apiKey.includes('sample')
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
}

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Upload image buffer to Cloudinary or fallback to data URL / storage
 */
export async function uploadImageToCloudinary(
  buffer: Buffer,
  mimetype: string,
  folder: string = 'products'
): Promise<UploadResult> {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
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
            return reject(error || new Error('Cloudinary upload failed'));
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id
          });
        }
      );
      uploadStream.end(buffer);
    });
  } else {
    // Fallback mode when Cloudinary keys aren't configured yet
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimetype};base64,${base64}`;
    const mockPublicId = `local_dev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      url: dataUrl,
      publicId: mockPublicId
    };
  }
}

/**
 * Delete image from Cloudinary by publicId
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  if (!publicId || publicId.startsWith('local_dev_')) {
    return true;
  }

  if (isCloudinaryConfigured) {
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
