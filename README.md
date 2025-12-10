# xkcd-imgs-deno

Get xkcd comics via a CORS-enabled API. Designed for Deno Deploy.

## Features

* JSON responses
* CORS support for all origins
* In-memory caching (1 hour TTL)
* Request logging

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Latest comic |
| `GET /latest` | Latest comic |
| `GET /random` | Random comic |
| `GET /{number}` | Specific comic by number |
| `GET /cache/stats` | Cache statistics |
| `GET /cache/clear` | Clear cache |

## Sample Response

```json
{
  "success": true,
  "data": {
    "num": 2867,
    "title": "Example Comic",
    "img": "https://imgs.xkcd.com/comics/example.png",
    "alt": "Alt text here"
  },
  "cached": false,
  "endpoint": "latest",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Deploy to Deno Deploy

1. Fork or push this repo to GitHub
2. Go to [Deno Deploy](https://dash.deno.com/)
3. Create a new project and link your GitHub repo
4. Set the entrypoint to `xkcd-api.ts`
5. Deploy!

## Run Locally

```bash
deno task start
# or with watch mode:
deno task dev
```
