<div align="center">

# @brightdata/ai-sdk

### Give your AI agent eyes on the web.

Plug-and-play [Vercel AI SDK](https://sdk.vercel.ai) tools powered by [Bright Data](https://brightdata.com) — scrape any site, search any engine, and collect structured data from Amazon, LinkedIn, Instagram, Facebook, and more.

[![npm version](https://img.shields.io/npm/v/@brightdata/ai-sdk.svg)](https://www.npmjs.com/package/@brightdata/ai-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## Why?

LLMs are powerful reasoners, but they can't see the live web. This package bridges that gap — each export is a ready-made `tool()` that any AI SDK-compatible model can call autonomously:

- **Scrape** — fetch any webpage as clean markdown, bypassing anti-bot protection
- **Search** — query Google, Bing, or Yandex and get structured results
- **Datasets** — pull product details, job listings, social profiles, and more

No browser automation. No proxy configuration. Just import, configure, and let the model decide when to use each tool.

---

## Quick Start

### 1. Install

```bash
npm install @brightdata/ai-sdk ai zod
```

### 2. Get your API key

Sign up at [brightdata.com](https://brightdata.com/cp) and grab your API key from the dashboard.

Set it as an environment variable, or place it in `.env` at your project root:

```bash
BRIGHTDATA_API_KEY="your_api_key"
```

If you prefer shell exports:

```bash
export BRIGHTDATA_API_KEY="your_api_key"
```

### 3. Run your first agent

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import { generateText, stepCountIs } from 'ai';
import { scrape, search } from '@brightdata/ai-sdk';

const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    tools: {
        scrape: scrape(),
        search: search(),
    },
    stopWhen: stepCountIs(5),
    prompt: 'Find and summarize the top 3 trending AI papers this week.',
});

console.log(text);
```

The model will autonomously decide when to search the web and when to scrape specific pages.

---

## Available Tools

| Tool | Description | Key Inputs |
|---|---|---|
| `scrape` | Scrape any URL to clean markdown or HTML | `url`, `country` |
| `search` | Search Google, Bing, or Yandex | `query`, `search_engine`, `country` |
| `amazon_product` | Get Amazon product details, pricing, and reviews | `url`, `zipcode` |
| `linkedin_profile` | Collect LinkedIn profile data | `urls` (array) |
| `linkedin_jobs` | Discover LinkedIn job postings | `location`, `keyword`, `country` |
| `instagram_profile` | Fetch Instagram profile info and posts | `url` |
| `facebook_profile` | Collect Facebook profile data | `url` |
| `chatgpt` | Collect ChatGPT responses with optional web search | `prompt`, `web_search` |

---

## Usage Examples

### Web Research Agent

Combine scrape and search to build an agent that can research any topic:

```typescript
import { openai } from '@ai-sdk/openai';
import { generateText, stepCountIs } from 'ai';
import { scrape, search, amazon_product } from '@brightdata/ai-sdk';

const { text } = await generateText({
    model: openai('gpt-4o'),
    tools: {
        scrape: scrape(),
        search: search(),
        amazon_product: amazon_product(),
    },
    stopWhen: stepCountIs(10),
    prompt: 'Search for the best noise-cancelling headphones and compare'
        + ' prices on Amazon',
});
```

### Streaming with Next.js App Router

```typescript
// app/api/research/route.ts
import { anthropic } from '@ai-sdk/anthropic';
import { streamText, stepCountIs } from 'ai';
import { scrape, search } from '@brightdata/ai-sdk';

export async function POST(req: Request) {
    const { prompt } = await req.json();

    const result = streamText({
        model: anthropic('claude-sonnet-4-5-20250929'),
        tools: {
            scrape: scrape(),
            search: search(),
        },
        stopWhen: stepCountIs(5),
        prompt,
    });

    return result.toDataStreamResponse();
}
```

### LinkedIn Job Discovery

```typescript
import { generateText, stepCountIs } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { linkedin_jobs, linkedin_profile } from '@brightdata/ai-sdk';

const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    tools: {
        linkedin_jobs: linkedin_jobs(),
        linkedin_profile: linkedin_profile(),
    },
    stopWhen: stepCountIs(5),
    prompt: 'Find senior software engineer jobs in San Francisco'
        + ' and show me the profiles of people in similar roles.',
});
```

### Social Media Intelligence

```typescript
import { generateText, stepCountIs } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { instagram_profile, facebook_profile } from '@brightdata/ai-sdk';

const { text } = await generateText({
    model: anthropic('claude-sonnet-4-5-20250929'),
    tools: {
        instagram: instagram_profile(),
        facebook: facebook_profile(),
    },
    stopWhen: stepCountIs(5),
    prompt: 'Analyze the social media presence for @natgeo on Instagram.',
});
```

### Cherry-Picking Individual Tools

You don't have to use all tools at once — import only what you need:

```typescript
import { scrape } from '@brightdata/ai-sdk';

const scrape_tool = scrape({
    api_key: 'your_api_key',
    data_format: 'html',
    country: 'us',
});
```

---

## Configuration

Every tool factory accepts an options object. Common options:

| Option | Type | Description |
|---|---|---|
| `api_key` | `string` | Bright Data API key. Falls back to `BRIGHTDATA_API_KEY` from process env or `.env` file. |
| `data_format` | `string` | Output format (`'markdown'`, `'html'`). Varies by tool. |
| `country` | `string` | Two-letter country code for geo-targeted requests. |

### Tool-Specific Options

**`search()`** also accepts:
- `search_engine` — `'google'` | `'bing'` | `'yandex'` (default: `'google'`)

**`linkedin_profile()`** and **`facebook_profile()`** also accept:
- `format` — `'json'` | `'jsonl'`

**`chatgpt()`** also accepts:
- `format` — `'json'` | `'jsonl'`

---

## How It Works

```
Your App ──► AI SDK (generateText / streamText)
                │
                ├──► model decides to call `search` tool
                │       └──► Bright Data SERP API ──► results back to model
                │
                ├──► model decides to call `scrape` tool
                │       └──► Bright Data Web Unlocker ──► page content back to model
                │
                └──► model decides to call `amazon_product` tool
                        └──► Bright Data Datasets API ──► product JSON back to model
```

Each tool is a standard Vercel AI SDK `tool()` instance. The model receives the tool descriptions and schemas, then autonomously decides which tools to call based on the user's prompt.

---

## Requirements

- Node.js 18+
- [Vercel AI SDK](https://www.npmjs.com/package/ai) v5 or v6
- [Zod](https://www.npmjs.com/package/zod) v4+
- A [Bright Data](https://brightdata.com/cp) API key

---

## Related

- [`@brightdata/sdk`](https://www.npmjs.com/package/@brightdata/sdk) — The core Bright Data SDK this package is built on
- [Vercel AI SDK](https://sdk.vercel.ai) — The AI framework these tools plug into
- [Bright Data Docs](https://docs.brightdata.com/integrations/vercel-ai-sdk) — Full integration guide

---

## License

[MIT](LICENSE) - Bright Data
