var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/oauth-proxy.js
var oauth_proxy_default = {
  async fetch(request, env) {
    const allowedOrigins = [
      "https://inspection-pwa.pages.dev",
      "https://7f5c9fc7.inspection-pwa.pages.dev",
      "https://306711ef.inspection-pwa.pages.dev",
      "http://localhost:5173",
      "https://localhost:5173"
    ];
    const origin = request.headers.get("Origin");
    const isAllowedOrigin = allowedOrigins.some(
      (allowed) => origin && origin.startsWith(allowed.split("://")[0] + "://") && (origin === allowed || origin.includes(".inspection-pwa.pages.dev"))
    );
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Max-Age": "86400"
        }
      });
    }
    const url = new URL(request.url);
    if (url.pathname === "/token") {
      return handleTokenRequest(request, origin, isAllowedOrigin, allowedOrigins);
    } else if (url.pathname === "/userinfo") {
      return handleUserInfoRequest(request, origin, isAllowedOrigin, allowedOrigins);
    }
    return new Response("Not Found", { status: 404 });
  }
};
async function handleTokenRequest(request, origin, isAllowedOrigin, allowedOrigins) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const body = await request.text();
    const authHeader = request.headers.get("Authorization");
    const response = await fetch("https://one.wiwynn.com/oauth/v2.0/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": authHeader
      },
      body
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0]
      }
    });
  }
}
__name(handleTokenRequest, "handleTokenRequest");
async function handleUserInfoRequest(request, origin, isAllowedOrigin, allowedOrigins) {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  try {
    const authHeader = request.headers.get("Authorization");
    const response = await fetch("https://one.wiwynn.com/oauth/v2.0/userinfo", {
      headers: {
        "Authorization": authHeader
      }
    });
    const data = await response.text();
    return new Response(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0]
      }
    });
  }
}
__name(handleUserInfoRequest, "handleUserInfoRequest");
export {
  oauth_proxy_default as default
};
//# sourceMappingURL=oauth-proxy.js.map
