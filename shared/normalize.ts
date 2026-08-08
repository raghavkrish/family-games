export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0b80-\u0bff\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function answersMatch(submitted: string, accept: string[]): boolean {
  const n = normalizeAnswer(submitted);
  return accept.some((a) => normalizeAnswer(a) === n);
}
