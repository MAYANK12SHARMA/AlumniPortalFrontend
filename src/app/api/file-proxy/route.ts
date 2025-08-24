import { NextRequest, NextResponse } from "next/server";

// Allow-list domains for proxying. You can extend via env var PROXY_ALLOWED_HOSTS (comma-separated)
const defaultAllowed = new Set(["127.0.0.1", "localhost","collegesathi.hopto.org"]);
const envAllowed = (process.env.PROXY_ALLOWED_HOSTS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
envAllowed.forEach((h) => defaultAllowed.add(h));

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) {
    return NextResponse.json(
      { error: "Missing 'url' query parameter" },
      { status: 400 }
    );
  }
  let targetUrl: URL;
  try {
    targetUrl = new URL(target);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  // Security: only proxy allowed hosts
  if (!defaultAllowed.has(targetUrl.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    const headers: Record<string, string> = {};
    // Optionally forward auth for protected endpoints
    const auth = req.headers.get("authorization");
    if (auth) headers["authorization"] = auth;
    const cookie = req.headers.get("cookie");
    if (cookie) headers["cookie"] = cookie;

    const upstream = await fetch(targetUrl.toString(), {
      headers,
      // Avoid caching for previews
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: upstream.status }
      );
    }

    // Pass-through content type and disposition so browser can render PDF/images
    const resHeaders = new Headers();
    const ct =
      upstream.headers.get("content-type") || "application/octet-stream";
    resHeaders.set("content-type", ct);
    const cd = upstream.headers.get("content-disposition");
    if (cd) resHeaders.set("content-disposition", cd);

    return new NextResponse(upstream.body as any, {
      status: upstream.status,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Proxy fetch failed" },
      { status: 500 }
    );
  }
}
