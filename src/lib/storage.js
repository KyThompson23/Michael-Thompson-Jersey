// Unified storage: Vercel Blob (vercel.app), filesystem (localhost), static (github.io)
import { fileToBase64 } from "./db";
import { maxImages } from "../data/teams";

const hostname = typeof window !== "undefined" ? window.location.hostname : "";
const isLocal = hostname.includes("localhost") || hostname.includes("127.0.0.1");
const isVercel = hostname.includes("vercel.app");
const isGHpages = hostname.includes("github.io");

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: "POST",
    ...body,
  });
  if (!res.ok) throw new Error(`API ${path} failed`);
  return res.json();
}

// Upload image
export async function uploadImage(jerseyId, index, file, imageFolder) {
  if (isLocal) {
    const base64 = await fileToBase64(file);
    const data = await apiPost("/api/upload-local", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageFolder, index, data: base64 }),
    });
    return data.url;
  }
  if (isVercel) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("jerseyId", String(jerseyId));
    formData.append("index", String(index));
    const data = await apiPost("/api/upload", { body: formData });
    return data.url;
  }
  // GitHub Pages: no upload API
  return null;
}

// Delete single image
export async function deleteStoredImage(jerseyId, index, imageFolder) {
  if (isLocal) {
    await apiPost("/api/delete-image-local", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageFolder, index }),
    });
    return;
  }
  if (isVercel) {
    await apiPost("/api/delete-image", {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jerseyId: String(jerseyId), index }),
    });
  }
}

// Delete all images for a jersey
export async function deleteAllImages(jerseyId, imageFolder) {
  if (isLocal) {
    await Promise.all(
      Array.from({ length: maxImages }, (_, i) => i).map((i) =>
        apiPost("/api/delete-image-local", {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageFolder, index: i }),
        }).catch(() => {})
      )
    );
    return;
  }
  if (isVercel) {
    await Promise.all(
      Array.from({ length: maxImages }, (_, i) => i).map((i) =>
        apiPost("/api/delete-image", {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jerseyId: String(jerseyId), index: i }),
        }).catch(() => {})
      )
    );
  }
}

// Get all image URLs for a jersey: returns [{index, url}, ...]
export async function getStoredImages(jerseyId, imageFolder) {
  if (isLocal) {
    try {
      const data = await fetch(`/api/images-local?imageFolder=${imageFolder}`).then((r) => r.json());
      return data.images || [];
    } catch {
      return [];
    }
  }
  if (isVercel) {
    try {
      const data = await fetch(`/api/images?jerseyId=${jerseyId}`).then((r) => r.json());
      return data.images || [];
    } catch {
      return [];
    }
  }
  // GitHub Pages: images are static files, no stored uploads
  return [];
}

// Check if any uploaded images exist
export async function hasUploadedImages(jerseyId, imageFolder) {
  const images = await getStoredImages(jerseyId, imageFolder);
  return images.length > 0;
}
