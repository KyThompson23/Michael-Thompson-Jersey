import { del } from "@vercel/blob";

export const config = { runtime: "nodejs" };

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { jerseyId, index } = await req.json();

    if (!jerseyId || index == null) {
      return new Response(JSON.stringify({ error: "Missing jerseyId or index" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await del(`jerseys/${jerseyId}/${index}.jpg`);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Delete error:", err);
    return new Response(JSON.stringify({ error: "Delete failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
