import { list } from "@vercel/blob";

export const config = { runtime: "nodejs" };

export default async function handler(req) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const jerseyId = url.searchParams.get("jerseyId");

    if (!jerseyId) {
      return new Response(JSON.stringify({ error: "Missing jerseyId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { blobs } = await list({ prefix: `jerseys/${jerseyId}/` });

    const images = blobs.map((b) => {
      const match = b.pathname.match(/(\d+)\.jpg$/);
      const index = match ? parseInt(match[1], 10) : 0;
      return { index, url: b.url };
    });

    return new Response(JSON.stringify({ images }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("List error:", err);
    return new Response(JSON.stringify({ error: "List failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
