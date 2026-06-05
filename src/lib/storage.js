// Unified storage: Vercel Blob API in production, IndexedDB in development
import { saveImage, deleteImage as dbDelete, getImage as dbGet, hasUploadedImages as dbHas, fileToBase64 } from "./db";

const isProd = typeof window !== "undefined" && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1");

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    ...body,
  });
  if (!res.ok) throw new Error(`API ${path} failed`);
  return res.json();
}

// Upload image: file → API (prod) or IndexedDB (dev)
export async function uploadImage(jerseyId, index, file) {
  if (isProd) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("jerseyId", String(jerseyId));
    formData.append("index", String(index));
    const data = await apiPost("/api/upload", { body: formData });
    return data.url;
  } else {
    const base64 = await fileToBase64(file);
    await saveImage(jerseyId, index, base64);
    return base64;
  }
}

// Delete single image
export async function deleteStoredImage(jerseyId, index) {
  if (isProd) {
    await apiPost("/api/delete-image", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jerseyId: String(jerseyId), index }),
    });
  } else {
    await dbDelete(jerseyId, index);
  }
}

// Delete all images for a jersey
export async function deleteAllImages(jerseyId) {
  if (isProd) {
    // Delete 5 possible slots
    await Promise.all(
      [0, 1, 2, 3, 4].map((i) =>
        apiPost("/api/delete-image", {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jerseyId: String(jerseyId), index: i }),
        }).catch(() => {})
      )
    );
  } else {
    const { deleteImages } = await import("./db");
    await deleteImages(jerseyId);
  }
}

// Get all image URLs for a jersey: returns [{index, url}, ...]
export async function getStoredImages(jerseyId) {
  if (isProd) {
    try {
      const data = await fetch(`/api/images?jerseyId=${jerseyId}`).then((r) => r.json());
      return data.images || [];
    } catch {
      return [];
    }
  } else {
    const results = [];
    for (let i = 0; i < 5; i++) {
      const base64 = await dbGet(jerseyId, i);
      if (base64) results.push({ index: i, url: base64 });
    }
    return results;
  }
}

// Check if any uploaded images exist
export async function hasUploadedImages(jerseyId) {
  if (isProd) {
    const images = await getStoredImages(jerseyId);
    return images.length > 0;
  } else {
    return dbHas(jerseyId);
  }
}
