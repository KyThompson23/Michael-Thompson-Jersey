import { imageLabels, maxImages } from "../data/teams";

// Build image objects for a jersey (metadata only, no URL resolution)
export function getJerseyImages(jersey) {
  const { imageFolder, imageCount = maxImages } = jersey;
  const count = Math.min(imageCount, maxImages);
  return Array.from({ length: count }, (_, i) => ({
    src: `/images/jerseys/${imageFolder}/${i + 1}.jpg`, // local fallback path
    label: imageLabels[i],
    index: i,
  }));
}

// Fallback placeholder
export function getPlaceholder(label, index = 0) {
  const colors = ["4a1e6b", "006bb6", "c8102e", "00471b", "f58426"];
  const color = colors[index % colors.length];
  return `https://placehold.co/600x600/${color}/ffffff?text=${encodeURIComponent(label || "Jersey")}`;
}
