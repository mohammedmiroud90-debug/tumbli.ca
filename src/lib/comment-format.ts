export function sanitizeCommentHtml(value: string): string {
  const withoutDangerousContent = value.replace(/<\/?(?:script|style)[^>]*>/gi, "");
  const normalized = withoutDangerousContent
    .replace(/<\/?b\b[^>]*>/gi, (tag) => tag.startsWith("</") ? "</strong>" : "<strong>")
    .replace(/<\/?i\b[^>]*>/gi, (tag) => tag.startsWith("</") ? "</em>" : "<em>")
    .replace(/<(p|strong|em|ul|ol|li|br)(?:\s[^>]*)?>/gi, "<$1>")
    .replace(/<\/(p|strong|em|ul|ol|li)>/gi, "</$1>")
    .replace(/<(?!\/?(?:p|strong|em|ul|ol|li|br)\b)[^>]*>/gi, "");
  return normalized.trim();
}

export function commentText(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
