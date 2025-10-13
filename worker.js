import { Memory } from "./memory.js";
export { Memory };

export default {
  async fetch(request, env, ctx) {
    // Normalize the path (removes a trailing "/" so /api/chat/ matches /api/chat)
    const u = new URL(request.url);
    const rawPath = u.pathname;
    const path = rawPath !== "/" && rawPath.endsWith("/") ? rawPath.slice(0, -1) : rawPath;

    // ---------- DEBUG: see what the worker actually received ----------
    // Comment this out later if you want, but it helps right now.
    // If you hit GET /debug it will show you the method and path.
    if (path === "/debug") {
      return new Response(JSON.stringify({ method: request.method, rawPath, normalizedPath: path }), {
        headers: { "content-type": "application/json" },
      });
    }
    // -------------------------------------------------------------------

    // Chat endpoint
    if (request.method === "POST" && path === "/api/chat") {
      let body;
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      const { message, session } = body || {};
      if (!message) {
        return new Response(JSON.stringify({ error: "`message` is required" }), {
          status: 400,
          headers: { "content-type": "application/json" },
        });
      }

      // Try Durable Object memory if bound; otherwise fall back to stateless
      let history = [];
      if (env.MEMORY && env.MEMORY.idFromName) {
        const id = env.MEMORY.idFromName(session || "default");
        const stub = env.MEMORY.get(id);
        const historyResp = await stub.fetch("https://do/get");
        history = await historyResp.json();
        history.push({ role: "user", content: message });
      } else {
        // no DO bound – still answer so you can verify the route works
        history = [{ role: "user", content: message }];
      }

      const result = await env.AI.run("@cf/meta/llama-3.3-8b-instruct", {
        messages: [{ role: "system", content: "You are a helpful assistant." }, ...history],
      });
      const reply = result.response;

      if (env.MEMORY && env.MEMORY.idFromName) {
        const id = env.MEMORY.idFromName(session || "default");
        const stub = env.MEMORY.get(id);
        const saved = [...history, { role: "assistant", content: reply }];
        await stub.fetch("https://do/save", { method: "POST", body: JSON.stringify(saved) });
      }

      return new Response(JSON.stringify({ reply }), {
        headers: { "content-type": "application/json" },
      });
    }

    // Fallback (GET /)
    return new Response("Cloudflare AI Worker running.", { status: 200 });
  },
};
