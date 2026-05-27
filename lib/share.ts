export function buildShareUrl(participants: string[], courtCount: number): string {
  const encoded = base64Encode(JSON.stringify(participants));
  return `${window.location.origin}/share?players=${encodeURIComponent(encoded)}&courts=${courtCount}`;
}

export function decodeShareData(
  playersParam: string,
  courtsParam: string
): { participants: string[]; courtCount: number } | null {
  try {
    const decoded = base64Decode(playersParam);
    const participants = JSON.parse(decoded);
    const courtCount = parseInt(courtsParam, 10);
    if (!Array.isArray(participants) || participants.length < 2) return null;
    if (participants.some((p: unknown) => typeof p !== "string" || p.trim() === "")) return null;
    if (isNaN(courtCount) || courtCount < 1 || courtCount > 3) return null;
    return { participants, courtCount };
  } catch {
    return null;
  }
}

function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary);
}

function base64Decode(str: string): string {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}
