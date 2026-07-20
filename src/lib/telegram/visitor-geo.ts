export interface VisitorGeo {
  ip: string;
  country?: string;
  region?: string;
  city?: string;
}

function normalizeIp(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let ip = raw.trim();
  if (!ip || ip === "unknown") return undefined;

  // Node often reports IPv4-mapped IPv6 as ::ffff:127.0.0.1
  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }

  return ip || undefined;
}

export function isPrivateOrLocalIp(ip: string): boolean {
  const value = normalizeIp(ip) || ip;
  if (
    value === "127.0.0.1" ||
    value === "::1" ||
    value === "0.0.0.0" ||
    value === "localhost"
  ) {
    return true;
  }
  if (value.startsWith("10.") || value.startsWith("192.168.") || value.startsWith("169.254.")) {
    return true;
  }
  const match = /^172\.(\d+)\./.exec(value);
  if (match) {
    const second = Number(match[1]);
    if (second >= 16 && second <= 31) return true;
  }
  return false;
}

function decodeHeader(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value).trim() || undefined;
  } catch {
    return value.trim() || undefined;
  }
}

export function clientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = normalizeIp(forwarded.split(",")[0]);
    if (first) return first;
  }

  return (
    normalizeIp(request.headers.get("x-real-ip") || undefined) ||
    normalizeIp(request.headers.get("cf-connecting-ip") || undefined) ||
    normalizeIp(request.headers.get("x-vercel-forwarded-for") || undefined) ||
    "unknown"
  );
}

export function geoFromHeaders(request: Request): Partial<VisitorGeo> {
  return {
    country: decodeHeader(request.headers.get("x-vercel-ip-country") || undefined) ||
      decodeHeader(request.headers.get("cf-ipcountry") || undefined),
    region: decodeHeader(request.headers.get("x-vercel-ip-country-region") || undefined),
    city: decodeHeader(request.headers.get("x-vercel-ip-city") || undefined),
  };
}

async function fetchText(url: string): Promise<string | undefined> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!response.ok) return undefined;
    return (await response.text()).trim() || undefined;
  } catch {
    return undefined;
  }
}

async function lookupPublicIp(): Promise<string | undefined> {
  return normalizeIp(await fetchText("https://api.ipify.org"));
}

async function lookupGeoByIp(ip: string): Promise<Partial<VisitorGeo>> {
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!response.ok) return {};
    const data = (await response.json()) as {
      success?: boolean;
      ip?: string;
      country?: string;
      region?: string;
      city?: string;
    };
    if (data.success === false) return {};
    return {
      ip: data.ip || ip,
      country: data.country,
      region: data.region,
      city: data.city,
    };
  } catch {
    return {};
  }
}

/**
 * Prefer edge geo headers (Vercel/CF). Fall back to public IP + ip-api for
 * local/dev or hosts that don't inject geo headers.
 */
export async function resolveVisitorGeo(request: Request): Promise<VisitorGeo> {
  const headerGeo = geoFromHeaders(request);
  let ip = clientIpFromRequest(request);

  if (isPrivateOrLocalIp(ip) || ip === "unknown") {
    ip = (await lookupPublicIp()) || ip;
  }

  if (headerGeo.country || headerGeo.region || headerGeo.city) {
    return {
      ip,
      country: headerGeo.country,
      region: headerGeo.region,
      city: headerGeo.city,
    };
  }

  if (ip !== "unknown" && !isPrivateOrLocalIp(ip)) {
    const lookedUp = await lookupGeoByIp(ip);
    return {
      ip: lookedUp.ip || ip,
      country: lookedUp.country,
      region: lookedUp.region,
      city: lookedUp.city,
    };
  }

  return { ip };
}
