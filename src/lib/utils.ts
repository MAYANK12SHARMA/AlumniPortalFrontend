type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | Record<string, boolean>
  | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  const push = (val: ClassValue) => {
    if (!val) return;
    if (typeof val === "string" || typeof val === "number") {
      classes.push(String(val));
      return;
    }
    if (Array.isArray(val)) {
      val.forEach(push);
      return;
    }
    if (typeof val === "object") {
      for (const key in val as Record<string, boolean>) {
        if ((val as Record<string, boolean>)[key]) classes.push(key);
      }
    }
  };

  inputs.forEach(push);
  return classes.join(" ");
}

// Normalize a media URL coming from the backend so that:
// - Relative /media/... paths become absolute with IPv4 localhost to avoid Node resolving ::1
// - Explicit http://localhost:8000 is rewritten to http://127.0.0.1:8000 to prevent ECONNREFUSED on IPv6 (::1)
// - Leaves other hosts untouched
export function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("/media/")) return `http://127.0.0.1:8000${url}`;
  return url.replace(/^http:\/\/localhost:8000/, "http://127.0.0.1:8000");
}
