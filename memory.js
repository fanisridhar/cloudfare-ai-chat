export class Memory {
  constructor(state) { this.state = state; }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/get") {
      const history = (await this.state.storage.get("history")) || [];
      return new Response(JSON.stringify(history), { headers: { "content-type": "application/json" }});
    }
    if (url.pathname === "/save") {
      const data = await request.json();
      await this.state.storage.put("history", data);
      return new Response("ok");
    }
    return new Response("Found", { status: 404});
   // return new Response("Not found", { status: 404 });
  }
}
