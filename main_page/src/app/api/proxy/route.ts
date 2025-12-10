import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const referer = req.nextUrl.searchParams.get("referer");

  if (!url) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    // 1. Fetch the remote content with the correct headers (spoofing the Referer)
    const response = await fetch(url, {
      headers: {
        Referer: referer || "https://gogoanime.hu/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return new NextResponse(`Upstream Error: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("Content-Type");

    // 2. Handle M3U8 Manifests (Rewrite links)
    if (
      contentType?.includes("application/vnd.apple.mpegurl") ||
      url.endsWith(".m3u8")
    ) {
      const text = await response.text();
      const baseUrl = new URL(url); // Used to resolve relative paths

      // Regex to find lines that are URLs (not starting with #)
      // We rewrite them to pass through THIS proxy again
      const modifiedText = text
        .split("\n")
        .map((line) => {
          if (line.trim() && !line.trim().startsWith("#")) {
            // Resolve relative URLs to absolute
            const absoluteLine = new URL(line, baseUrl.toString()).toString();
            // Recursively proxy this chunk
            return `/api/proxy?url=${encodeURIComponent(absoluteLine)}&referer=${encodeURIComponent(referer || "")}`;
          }
          return line;
        })
        .join("\n");

      return new NextResponse(modifiedText, {
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // 3. Handle Video Segments (Binary data)
    const data = await response.arrayBuffer();
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=31536000", // Cache segments for performance
      },
    });
  } catch (error) {
    console.error("Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
