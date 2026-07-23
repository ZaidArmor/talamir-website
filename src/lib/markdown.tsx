import type { ReactNode } from 'react';

/**
 * A deliberately small markdown renderer.
 *
 * Adding a markdown library would mean adding a dependency, and dependencies
 * need a stated licence and approval. The documentation and blog bodies in this
 * repository use a narrow subset — headings, paragraphs, lists, inline code and
 * bold — so a ~60-line renderer covers them with no supply-chain surface.
 *
 * It renders *elements*, never raw HTML: there is no `dangerouslySetInnerHTML`
 * anywhere in this file, so authored content cannot inject markup even if the
 * content source later becomes a CMS with untrusted editors.
 */

/** Inline: `code` and **bold**. Everything else is literal text. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];

    if (token.startsWith('`')) {
      nodes.push(<code key={`${keyPrefix}-c${i}`}>{token.slice(1, -1)}</code>);
    } else {
      nodes.push(<strong key={`${keyPrefix}-b${i}`}>{token.slice(2, -2)}</strong>);
    }

    last = match.index + token.length;
    i += 1;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function renderMarkdown(source: string): ReactNode[] {
  const lines = source.split('\n');
  const out: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    const items = list;
    list = [];
    out.push(
      <ul key={`ul-${key++}`}>
        {items.map((item, i) => (
          <li key={i}>{inline(item, `li-${key}-${i}`)}</li>
        ))}
      </ul>,
    );
  };

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Ordered and unordered list items are both rendered as list rows; the
    // content here does not distinguish them semantically.
    const listItem = /^\s*(?:[-*]|\d+\.)\s+(.*)$/.exec(line);
    if (listItem) {
      list.push(listItem[1]);
      continue;
    }

    flushList();

    const heading = /^(#{2,4})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      // h1 is the page title, rendered by the layout — bodies start at h2.
      if (level === 2) out.push(<h2 key={key++}>{inline(text, `h${key}`)}</h2>);
      else if (level === 3) out.push(<h3 key={key++}>{inline(text, `h${key}`)}</h3>);
      else out.push(<h4 key={key++}>{inline(text, `h${key}`)}</h4>);
      continue;
    }

    out.push(<p key={key++}>{inline(line, `p${key}`)}</p>);
  }

  flushList();
  return out;
}
