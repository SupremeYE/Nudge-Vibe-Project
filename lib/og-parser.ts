export interface OGData {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

function decodeHTML(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
}

export async function parseOGTags(url: string): Promise<OGData> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "facebookexternalhit/1.1" },
      signal: AbortSignal.timeout(10000),
    })
    const html = await res.text()

    const getOG = (property: string): string | null => {
      const patterns = [
        new RegExp(
          `<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']*)["']`,
          "i"
        ),
        new RegExp(
          `<meta[^>]*content=["']([^"']*)["'][^>]*property=["']og:${property}["']`,
          "i"
        ),
      ]
      for (const pattern of patterns) {
        const m = html.match(pattern)
        if (m?.[1]) return decodeHTML(m[1])
      }
      return null
    }

    const getTitleTag = (): string | null => {
      const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
      return m?.[1] ? decodeHTML(m[1].trim()) : null
    }

    return {
      title: getOG("title") ?? getTitleTag(),
      description: getOG("description"),
      image: getOG("image"),
      siteName: getOG("site_name"),
    }
  } catch {
    return { title: null, description: null, image: null, siteName: null }
  }
}
