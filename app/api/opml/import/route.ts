import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { feeds, categories } from '@/lib/schema';
import { parseFeedUrl, parseOPML } from '@/lib/feed-parser';
import { generateId } from '@/lib/utils';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const content = await file.text();
    const opmlFeeds = await parseOPML(content);

    if (opmlFeeds.length === 0) {
      return NextResponse.json(
        { error: 'No feeds found in OPML file' },
        { status: 400 }
      );
    }

    // Get or create categories
    const categoryMap: Record<string, string> = {};
    const userCategories = await db.query.categories.findMany({
      where: (categories, { eq }) => eq(categories.userId, session.user.id),
    });

    for (const category of userCategories) {
      categoryMap[category.name] = category.id;
    }

    const uniqueCategories = [...new Set(opmlFeeds.map((f) => f.category))];
    for (const categoryName of uniqueCategories) {
      if (!categoryMap[categoryName]) {
        const categoryId = generateId();
        await db.insert(categories).values({
          id: categoryId,
          userId: session.user.id,
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
          color: '#6B7280',
        });
        categoryMap[categoryName] = categoryId;
      }
    }

    // Import feeds
    let importedCount = 0;
    let skippedCount = 0;

    for (const opmlFeed of opmlFeeds) {
      try {
        // Check if already subscribed
        const existingFeed = await db.query.feeds.findFirst({
          where: (feeds, { eq, and }) =>
            and(
              eq(feeds.userId, session.user.id),
              eq(feeds.feedUrl, opmlFeed.xmlUrl)
            ),
        });

        if (existingFeed) {
          skippedCount++;
          continue;
        }

        // Parse and import feed
        const parsedFeed = await parseFeedUrl(opmlFeed.xmlUrl);
        const feedId = generateId();

        await db.insert(feeds).values({
          id: feedId,
          userId: session.user.id,
          categoryId: categoryMap[opmlFeed.category] || null,
          title: opmlFeed.title,
          description: parsedFeed.description,
          feedUrl: opmlFeed.xmlUrl,
          siteUrl: parsedFeed.link,
          imageUrl: parsedFeed.image,
        });

        importedCount++;
      } catch (error) {
        console.error(`Failed to import feed ${opmlFeed.xmlUrl}:`, error);
        skippedCount++;
      }
    }

    return NextResponse.json({
      message: 'OPML imported',
      imported: importedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error('Error importing OPML:', error);
    return NextResponse.json(
      { error: `Failed to import OPML: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
