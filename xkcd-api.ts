// xkcd-api-cached.ts

import { serve } from "https://deno.land/std@0.210.0/http/server.ts";

const PORT = 8000;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

// CORS headers configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
  "Content-Type": "application/json",
  "Cache-Control": "public, max-age=3600",
};

// Cache helper functions
function getCached(key: string) {
  const cached = cache.get(key);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    if (age < CACHE_DURATION) {
      return cached.data;
    }
    cache.delete(key);
  }
  return null;
}

function setCache(key: string, data: any) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

// Fetch with caching
async function fetchWithCache(url: string, cacheKey: string) {
  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) {
    return { data: cached, cached: true };
  }

  // Fetch fresh data
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  setCache(cacheKey, data);
  return { data, cached: false };
}

// API functions
async function getLatestXkcd() {
  const result = await fetchWithCache(
    "https://xkcd.com/info.0.json",
    "latest"
  );
  return result;
}

async function getXkcdByNumber(num: number) {
  const result = await fetchWithCache(
    `https://xkcd.com/${num}/info.0.json`,
    `comic-${num}`
  );
  return result;
}

async function getRandomXkcd() {
  const { data: latest } = await getLatestXkcd();
  const randomNum = Math.floor(Math.random() * latest.num) + 1;
  return await getXkcdByNumber(randomNum);
}

// Request logging middleware
function logRequest(req: Request, status: number, duration: number) {
  const url = new URL(req.url);
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${url.pathname} - ${status} (${duration}ms)`
  );
}

// Main handler
async function handler(req: Request): Promise<Response> {
  const startTime = Date.now();
  const url = new URL(req.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    logRequest(req, 204, Date.now() - startTime);
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    let result;
    let endpoint = path;

    switch (true) {
      case path === "/" || path === "/latest":
        result = await getLatestXkcd();
        endpoint = "latest";
        break;

      case path === "/random":
        result = await getRandomXkcd();
        endpoint = "random";
        break;

      case /^\/\d+$/.test(path):
        const num = parseInt(path.substring(1));
        result = await getXkcdByNumber(num);
        endpoint = `comic-${num}`;
        break;

      case path === "/cache/stats":
        result = {
          data: {
            size: cache.size,
            keys: Array.from(cache.keys()),
            maxAge: CACHE_DURATION,
          },
          cached: false,
        };
        break;

      case path === "/cache/clear":
        cache.clear();
        result = {
          data: { message: "Cache cleared", previousSize: cache.size },
          cached: false,
        };
        break;

      default:
        const errorResponse = new Response(
          JSON.stringify({
            success: false,
            error: "Not Found",
            path,
          }),
          {
            status: 404,
            headers: corsHeaders,
          }
        );
        logRequest(req, 404, Date.now() - startTime);
        return errorResponse;
    }

    const response = new Response(
      JSON.stringify({
        success: true,
        ...result,
        endpoint,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "X-Cache": result.cached ? "HIT" : "MISS",
        },
      }
    );

    logRequest(req, 200, Date.now() - startTime);
    return response;

  } catch (error) {
    console.error("Error:", error);
    const errorResponse = new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal Server Error",
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
    logRequest(req, 500, Date.now() - startTime);
    return errorResponse;
  }
}

// Start server
console.log(`
🚀 XKCD CORS API Server
   Running on: http://localhost:${PORT}
   
📚 Endpoints:
   GET /          → Latest comic
   GET /latest    → Latest comic
   GET /random    → Random comic
   GET /{number}  → Specific comic
   GET /cache/stats → Cache statistics
   GET /cache/clear → Clear cache
   
✨ Features:
   • CORS enabled for all origins
   • In-memory caching (1 hour TTL)
   • Request logging
   • Error handling
`);

await serve(handler, { port: PORT });
