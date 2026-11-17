// RSS 2.0 / RSS 1.0（RDF）/ Atom から記事の見出し・リンク・日時を取り出す。
// 必要な項目だけを読む小さなパーサーで、外部ライブラリは使わない。

export type FeedItem = {
  title: string;
  url: string;
  publishedAt: string | null; // ISO 8601
};

const MAX_TITLE_LENGTH = 200;

function decodeEntities(text: string) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeFromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeFromCodePoint(parseInt(dec, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function safeFromCodePoint(code: number) {
  try {
    return String.fromCodePoint(code);
  } catch {
    return '';
  }
}

// 要素の中身を取り出す。CDATA は中身をそのまま、それ以外はエンティティを戻す。タグは除く。
function textOf(block: string, tag: string): string | null {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  if (!match) return null;
  const raw = match[1].trim();
  const cdata = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  const text = cdata ? cdata[1] : decodeEntities(raw.replace(/<[^>]+>/g, ''));
  return text.replace(/\s+/g, ' ').trim();
}

// Atom の <link href="..."> を読む（rel が alternate か、rel なしのもの）。
function atomLink(block: string): string | null {
  const links = block.match(/<link\b[^>]*>/gi) ?? [];
  for (const tag of links) {
    const rel = tag.match(/\brel\s*=\s*["']([^"']+)["']/i)?.[1];
    const href = tag.match(/\bhref\s*=\s*["']([^"']+)["']/i)?.[1];
    if (href && (!rel || rel === 'alternate')) return decodeEntities(href);
  }
  return null;
}

function toIsoDate(value: string | null): string | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

// http(s) の URL だけを通す（javascript: などのリンクを表示しないため）。
function safeUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function parseFeed(xml: string): FeedItem[] {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) ?? xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ?? [];
  const items: FeedItem[] = [];
  for (const block of blocks) {
    const title = textOf(block, 'title');
    const isAtom = /^<entry\b/i.test(block);
    const url = safeUrl(isAtom ? atomLink(block) : textOf(block, 'link') ?? textOf(block, 'guid'));
    if (!title || !url) continue;
    const date = textOf(block, 'pubDate') ?? textOf(block, 'dc:date') ?? textOf(block, 'updated') ?? textOf(block, 'published');
    items.push({ title: title.slice(0, MAX_TITLE_LENGTH), url, publishedAt: toIsoDate(date) });
  }
  return items;
}
