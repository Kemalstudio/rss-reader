import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { feeds, categories } from '@/lib/schema';
import { generateId } from '@/lib/utils';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's feeds with categories
    const userFeeds = await db.query.feeds.findMany({
      where: (feeds, { eq }) => eq(feeds.userId, session.user.id),
      with: {
        category: true,
      },
    });

    // Generate OPML
    const now = new Date().toISOString();
    const feedsByCategory = userFeeds.reduce(
      (acc, feed) => {
        const categoryName = feed.category?.name || 'Uncategorized';
        if (!acc[categoryName]) acc[categoryName] = [];
        acc[categoryName].push(feed);
        return acc;
      },
      {} as Record<string, typeof userFeeds>
    );

    let opml = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Frontpage Feeds</title>
    <dateCreated>${now}</dateCreated>
    <dateModified>${now}</dateModified>
  </head>
  <body>
`;

    for (const [categoryName, categoryFeeds] of Object.entries(feedsByCategory)) {
      opml += `    <outline text="${escapeXml(categoryName)}" title="${escapeXml(categoryName)}">\n`;
      for (const feed of categoryFeeds) {
        opml += `      <outline type="rss" text="${escapeXml(feed.title)}" title="${escapeXml(feed.title)}" xmlUrl="${escapeXml(feed.feedUrl)}" />\n`;
      }
      opml += `    </outline>\n`;
    }

    opml += `  </body>
</opml>`;

    return new NextResponse(opml, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': 'attachment; filename="frontpage-feeds.opml"',
      },
    });
  } catch (error) {
    console.error('Error exporting OPML:', error);
    return NextResponse.json(
      { error: 'Failed to export feeds' },
      { status: 500 }
    );
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
