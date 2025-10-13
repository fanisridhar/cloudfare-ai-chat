# 🌩️ Cloudflare AI Chat (Workers AI + Memory)

A lightweight **AI-powered chat API** built on **Cloudflare Workers** using **Workers AI (Llama 3.3)** and persistent **memory** through Durable Objects (or KV as fallback).  
It demonstrates how to deploy an intelligent, serverless chat backend that remembers user conversations.

---

## 🚀 Features
- ⚡ Runs entirely on **Cloudflare’s global edge network**
- 🧠 Uses **Llama 3.3 8B Instruct** via **Workers AI**
- 💾 Optional **Durable Object memory** to store conversation history
- 🔐 Stateless fallback when memory is not bound
- 🧩 Minimal API design (`POST /api/chat`)
- 🌍 Deployed automatically to `*.workers.dev`

---

## 🧭 API Endpoint

### `POST /api/chat`
**Request:**
```json
{
  "session": "demo1",
  "message": "Who are you?"
}
