# Cloudflare AI Chat (Workers AI + Memory)

Tiny AI chat API running on **Cloudflare Workers** using **Workers AI (Llama 3.3)** with memory (Durable Object or KV).

## API
`POST /api/chat`
```json
{ "session": "demo1", "message": "Who are you?" }
# cloudfare-ai-chat

## Test
curl -sX POST https://<your-worker>.workers.dev/api/chat \
  -H "content-type: application/json" \
  -d '{"session":"demo1","message":"Who are you?"}'
