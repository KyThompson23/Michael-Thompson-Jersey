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
  // Vercel & GitHub Pages: no upload API (use static files)
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
  // Vercel & GitHub Pages: skip (static files)
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
  // Vercel & GitHub Pages: skip (static files)
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
  // Vercel / GitHub Pages: use static files (no Blob call — avoids timeout)
  return [];
}

// Check if any uploaded images exist
export async function hasUploadedImages(jerseyId, imageFolder) {
  const images = await getStoredImages(jerseyId, imageFolder);
  return images.length > 0;
}
