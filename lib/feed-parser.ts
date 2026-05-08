import Parser from 'rss-parser';
import sanitizeHtml from 'sanitize-html';

const parser = new Parser();

export interface ParsedFeed {
  title: string;
  description?: string;
  link?: string;
  image?: string;
  items: ParsedArticle[];
}

export interface ParsedArticle {
  title: string;
  description?: string;
  content?: string;
  author?: string;
  link?: string;
  pubDate?: Date;
  image?: string;
  guid?: string;
}

const SANITIZE_OPTIONS = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'blockquote', 'code', 'pre'],
  allowedAttributes: {
    a: ['href', 'title'],
  },
  allowedSchemes: ['http', 'https'],
};

export async function parseFeedUrl(feedUrl: string): Promise<ParsedFeed> {
  try {
    const feed = await parser.parseURL(feedUrl);

    return {
      title: feed.title || 'Untitled Feed',
      description: feed.description,
      link: feed.link,
      image: feed.image?.url || feed.itunes?.image,
      items: (feed.items || [])
        .slice(0, 100) // Limit to last 100 items
        .map((item) => ({
          title: item.title || 'Untitled',
          description: item.summary || item.description,
          content: item.content ? sanitizeHtml(item.content, SANITIZE_OPTIONS) : undefined,
          author: item.author || item.creator,
          link: item.link,
          pubDate: item.pubDate ? new Date(item.pubDate) : undefined,
          image: extractImageFromContent(item),
          guid: item.guid || item.link || item.title,
        })),
    };
  } catch (error) {
    console.error(`Error parsing feed ${feedUrl}:`, error);
    throw new Error(`Failed to parse feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function extractImageFromContent(item: any): string | undefined {
  // Try media:content
  if (item['media:content']?.url) {
    return item['media:content'].url;
  }

  // Try media:thumbnail
  if (item['media:thumbnail']?.url) {
    return item['media:thumbnail'].url;
  }

  // Try to extract from content
  if (item.content) {
    const match = item.content.match(/<img[^>]+src=["']([^"']+)["']/);
    if (match) return match[1];
  }

  // Try description
  if (item.description) {
    const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/);
    if (match) return match[1];
  }

  return undefined;
}

// OPML export
export function generateOPML(feeds: Array<{ title: string; feedUrl: string; categoryName?: string }>): string {
  const feedsByCategory = feeds.reduce(
    (acc, feed) => {
      const category = feed.categoryName || 'Uncategorized';
      if (!acc[category]) acc[category] = [];
      acc[category].push(feed);
      return acc;
    },
    {} as Record<string, typeof feeds>
  );

  const now = new Date().toISOString();
  let opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Frontpage Feeds</title>
    <dateCreated>${now}</dateCreated>
    <dateModified>${now}</dateModified>
  </head>
  <body>
`;

  for (const [category, categoryFeeds] of Object.entries(feedsByCategory)) {
    opml += `    <outline text="${escapeXml(category)}" title="${escapeXml(category)}">\n`;
    for (const feed of categoryFeeds) {
      opml += `      <outline type="rss" text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.feedUrl)}" />\n`;
    }
    opml += `    </outline>\n`;
  }

  opml += `  </body>
</opml>`;

  return opml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// OPML parsing
export interface OPMLFeed {
  title: string;
  xmlUrl: string;
  category: string;
}

export async function parseOPML(opmlContent: string): Promise<OPMLFeed[]> {
  try {
    const feed = await parser.parseString(opmlContent);
    const feeds: OPMLFeed[] = [];

    function traverse(outlines: any[], category = 'Uncategorized') {
      for (const outline of outlines || []) {
        if (outline.type === 'rss' || outline.xmlUrl) {
          feeds.push({
            title: outline.title || outline.text || 'Untitled',
            xmlUrl: outline.xmlUrl,
            category,
          });
        } else if (outline.children?.length > 0) {
          traverse(outline.children, outline.text || outline.title || 'Uncategorized');
        }
      }
    }

    if (feed.outlines) {
      traverse(feed.outlines);
    }

    return feeds;
  } catch (error) {
    console.error('Error parsing OPML:', error);
    throw new Error(`Failed to parse OPML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
