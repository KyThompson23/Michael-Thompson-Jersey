// IndexedDB helper — stores uploaded jersey photos persistently in browser

const DB_NAME = "jersey-gallery";
const STORE_NAME = "images";
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function imageKey(jerseyId, index) {
  return `${jerseyId}-${index}`;
}

// Save a single image as base64
export async function saveImage(jerseyId, index, base64) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(base64, imageKey(jerseyId, index));
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Save multiple images at once: { 0: base64, 1: base64, ... }
export async function saveImages(jerseyId, imageMap) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  Object.entries(imageMap).forEach(([index, base64]) => {
    if (base64) store.put(base64, imageKey(jerseyId, Number(index)));
  });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Get a single image as base64 string (or null)
export async function getImage(jerseyId, index) {
  const db = await openDB();
  return new Promise((resolve) => {
    const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(imageKey(jerseyId, index));
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

// Check if any uploaded images exist for this jersey
export async function hasUploadedImages(jerseyId) {
  const db = await openDB();
  return new Promise((resolve) => {
    const range = IDBKeyRange.bound(`${jerseyId}-0`, `${jerseyId}-999`);
    const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).count(range);
    req.onsuccess = () => resolve(req.result > 0);
    req.onerror = () => resolve(false);
  });
}

// Delete a single image
export async function deleteImage(jerseyId, index) {
  const db = await openDB();
  return new Promise((resolve) => {
    const req = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(imageKey(jerseyId, index));
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

// Delete all images for a jersey
export async function deleteImages(jerseyId) {
  const db = await openDB();
  return new Promise((resolve) => {
    const keys = [0, 1, 2, 3, 4].map((i) => imageKey(jerseyId, i));
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    keys.forEach((k) => store.delete(k));
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

// Read a file as base64 data URL
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
