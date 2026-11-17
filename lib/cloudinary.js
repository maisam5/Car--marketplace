import { v2 as cloudinary } from "cloudinary";

function ensureCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    return;
  }

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env"
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

/**
 * Extracts the Cloudinary public_id from a delivery URL.
 * Example: https://res.cloudinary.com/<cloud>/image/upload/v1700000000/carhub/cars/123/img.webp -> carhub/cars/123/img
 */
export function extractCloudinaryPublicId(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;

  try {
    const url = new URL(imageUrl);
    if (!url.hostname.includes("cloudinary.com")) return null;

    const uploadIndex = url.pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    let pathAfterUpload = url.pathname.slice(uploadIndex + "/upload/".length);
    // Strip optional version segment (e.g. v1700000000/)
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, "");
    // Strip file extension
    return pathAfterUpload.replace(/\.[^/.]+$/, "") || null;
  } catch {
    return null;
  }
}

/**
 * Uploads a base64 data URI image to Cloudinary under the given folder.
 */
export async function uploadCarImage(base64Data, folder = "carhub/cars") {
  ensureCloudinaryConfig();

  const result = await cloudinary.uploader.upload(base64Data, {
    folder,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
}

/**
 * Deletes one or more Cloudinary images by their URLs.
 */
export async function deleteCarImages(imageUrls = []) {
  const publicIds = imageUrls
    .map(extractCloudinaryPublicId)
    .filter(Boolean);

  if (publicIds.length === 0) return { deleted: 0 };

  ensureCloudinaryConfig();

  const response = await cloudinary.api.delete_resources(publicIds, {
    resource_type: "image",
  });

  return response;
}
