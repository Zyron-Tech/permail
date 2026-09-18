/**
 * The composer is plain text on purpose — it keeps campaigns readable and
 * deliverable. This turns that text into the HTML half of the message, with a
 * small amount of familiar formatting.
 *
 *   **bold**   *italic*   [label](https://url)   - bullet   blank line = paragraph
 */

export function escapeHtml(value: string): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" style="color:#780115;text-decoration:underline">$1</a>',
    )
    .replace(/(^|[\s(])((?:https?:\/\/)[^\s<)]+)/g, (_m, lead, url) => {
      return `${lead}<a href="${url}" style="color:#780115;text-decoration:underline">${url}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/\n/g, "<br />");
}

export function textToHtml(text: string): string {
  const blocks = (text ?? "").replace(/\r\n/g, "\n").split(/\n{2,}/);

  const rendered = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";

      const lines = trimmed.split("\n");
      const isList = lines.every((line) => /^\s*[-*]\s+/.test(line));

      if (isList) {
        const items = lines
          .map((line) => `<li style="margin:0 0 6px">${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`)
          .join("");
        return `<ul style="margin:0 0 16px;padding-left:22px;list-style:disc">${items}</ul>`;
      }

      return `<p style="margin:0 0 16px">${inline(trimmed)}</p>`;
    })
    .filter(Boolean)
    .join("");

  return wrap(rendered);
}

function wrap(inner: string): string {
  return [
    '<div style="margin:0;padding:0;background:#ffffff">',
    '<div style="font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Helvetica,Arial,sans-serif;',
    'font-size:16px;line-height:1.65;color:#1a1416;max-width:620px">',
    inner,
    "</div></div>",
  ].join("");
}
