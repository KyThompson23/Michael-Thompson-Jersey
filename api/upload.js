import { put } from "@vercel/blob";

export const config = { runtime: "nodejs" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const jerseyId = formData.get("jerseyId");
    const index = formData.get("index");

    if (!file || !jerseyId || index == null) {
      return new Response(JSON.stringify({ error: "Missing file, jerseyId, or index" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const blob = await put(`jerseys/${jerseyId}/${index}.jpg`, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return new Response(JSON.stringify({ url: blob.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
